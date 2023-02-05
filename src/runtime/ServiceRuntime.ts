import * as crypto from "crypto";

import {
  DecodedCommand,
  DecodedCommandAcknowledge,
  DecodedCommandResult,
  DecodedEvent,
  SignalDecoderInterface,
} from "@app/SignalDecoderInterface";
import { SignalEncoderInterface } from "@app/SignalEncoderInterface";
import { UdpCommsInterface } from "@app/UdpCommsInterface";
import { CommandBusInterface } from "@app/bus/CommandBusInterface";
import { EventBusInterface } from "@app/bus/EventBusInterface";
import { RequestServiceDescriptorCommandHandler } from "@app/command-handlers/RequestServiceDescriptorCommandHandler";
import { requestServiceDescriptorCommandName } from "@app/commands/RequestServiceDescriptorCommand";
import { RequestServiceDescriptorsEventHandler } from "@app/event-handlers/RequestServiceDescriptorsEventHandler";
import { ServiceStartedEventHandler } from "@app/event-handlers/ServiceStartedEventHandler";
import { ServiceStoppedEventHandler } from "@app/event-handlers/ServiceStoppedEventHandler";
import { requestServiceDescriptorsEventName } from "@app/events/RequestServicesDescriptorsEvent";
import {
  ServiceStartedEvent,
  serviceStartedEventName,
} from "@app/events/ServiceStartedEvent";
import {
  ServiceStoppedEvent,
  serviceStoppedEventName,
} from "@app/events/ServiceStoppedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";
import { CommandHandlerInterface } from "@app/runtime/CommandHandlerInterface";
import { CommandInterface } from "@app/runtime/CommandInterface";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";
import { EventInterface } from "@app/runtime/EventInterface";
import { ServiceRuntimeInterface } from "@app/runtime/ServiceRuntimeInterface";

// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const isPromise = (p: unknown | Promise<unknown>): boolean => {
  const pthen = (p as { then?: unknown }).then;
  return typeof p === "object" && typeof pthen === "function";
};

export interface Timeouts {
  acknowledgeTimeout: number;
  executeTimeout: number;
}

export class NotStartedException extends Error {}
export class AlreadyStartedException extends Error {}

export class ServiceRuntime implements ServiceRuntimeInterface {
  private waitingAckPromises: Record<
    string,
    ((value: void | PromiseLike<void>) => void) | undefined
  > = {};

  private waitingResultPromises: Record<
    string,
    ((value: Any | PromiseLike<Any>) => void) | undefined
  > = {};

  public constructor(
    private readonly name: string,
    private readonly logger: LoggerInterface,
    private readonly udpComms: UdpCommsInterface,
    private readonly signalEncoder: SignalEncoderInterface,
    private readonly signalDecoder: SignalDecoderInterface,
    private readonly commandBus: CommandBusInterface,
    private readonly eventBus: EventBusInterface,
    private readonly timeouts: Timeouts
  ) {}

  public async start(): Promise<void> {
    if (this.udpComms.isListening()) {
      throw new AlreadyStartedException("Already started");
    }
    this.registerInternalHandlers();
    await this.udpComms.listen(async (from, data) => {
      const decoded = this.signalDecoder.decode(data);
      this.logger.debug(
        this,
        `Decoded signal from ${from}: ${JSON.stringify(decoded, undefined, 4)}`
      );

      if (decoded.dateType === "event") {
        this.onReceiveDecodedEventSignal(decoded);
      }

      if (decoded.dateType === "command") {
        await this.onReceiveDecodedCommandSignal(from, decoded);
      }

      if (decoded.dateType === "command-acknowledge") {
        this.onReceiveDecodedCommandAcknowledgeSignal(decoded);
      }

      if (decoded.dateType === "command-result") {
        this.onReceiveDecodedCommandResultSignal(decoded);
      }
    });
    await this.publishEvent(new ServiceStartedEvent(this.name));
  }

  private registerInternalHandlers(): void {
    this.registerCommandHandler(
      new RequestServiceDescriptorCommandHandler(
        this,
        this.commandBus,
        this.eventBus
      )
    );
    this.registerEventHandler(
      new RequestServiceDescriptorsEventHandler(
        this,
        this.commandBus,
        this.eventBus
      )
    );
    this.registerEventHandler(new ServiceStartedEventHandler(this.logger));
    this.registerEventHandler(new ServiceStoppedEventHandler(this.logger));
  }

  private unregisterInternalHandlers(): void {
    this.unregisterCommandHandler(requestServiceDescriptorCommandName);
    this.unregisterEventHandlers(requestServiceDescriptorsEventName);
    this.unregisterEventHandlers(serviceStartedEventName);
    this.unregisterEventHandlers(serviceStoppedEventName);
  }

  public async stop(): Promise<void> {
    if (!this.udpComms.isListening()) {
      throw new NotStartedException("Not started");
    }
    this.unregisterInternalHandlers();
    await this.publishEvent(new ServiceStoppedEvent(this.name));
    await this.udpComms.close();
  }
  public getName(): string {
    return this.name;
  }

  public async executeCommand<Payload, Returns>(
    command: CommandInterface<Payload>
  ): Promise<Returns> {
    this.logger.info(this, `Executing command ${command.commandName}`);
    const id = crypto.randomUUID();
    this.logger.debug(this, `Assigned command id ${id}`);
    const ackPromise = new Promise<void>((resolve, reject) => {
      this.waitingAckPromises[id] = resolve;
      setTimeout(
        () => reject("acknowledge timeout"),
        this.timeouts.acknowledgeTimeout
      );
    });

    const resultPromise = new Promise<Returns>((resolve, reject) => {
      this.waitingResultPromises[id] = resolve;
      setTimeout(() => reject("execute timeout"), this.timeouts.executeTimeout);
    });

    this.logger.debug(this, `Broadcasting command ${command.commandName}`);
    await this.udpComms.broadcast(
      this.signalEncoder.encodeCommand(
        id,
        command.commandName,
        command.commandPayload
      )
    );

    this.logger.debug(this, `Waiting for acknowledgement for command id ${id}`);
    await ackPromise;
    this.logger.debug(this, `Waiting for result for command id ${id}`);
    return resultPromise;
  }

  public async publishEvent<T>(event: EventInterface<T>): Promise<void> {
    this.logger.info(this, `Dispatching event ${event.eventName}`);
    await this.udpComms.broadcast(
      this.signalEncoder.encodeEvent(event.eventName, event.eventPayload)
    );
  }

  public registerCommandHandler(
    handler: CommandHandlerInterface<unknown, unknown>
  ): void {
    const commandName = handler.getHandledCommandName();
    if (this.commandBus.hasHandler(commandName)) {
      throw new Error(`Handler for command ${commandName} already registered`);
    }
    this.commandBus.register(commandName, handler.handle.bind(handler));
    this.logger.info("main", `Registered handler for command ${commandName}`);
  }

  public unregisterCommandHandler(commandName: string): void {
    this.commandBus.unregister(commandName);
    this.logger.info("main", `Unregistered handler for command ${commandName}`);
  }

  public registerEventHandler(handler: EventHandlerInterface<unknown>): string {
    const eventName = handler.getHandledEventName();
    const subscriptionId = this.eventBus.subscribe(
      eventName,
      handler.handle.bind(handler)
    );
    this.logger.info("main", `Registered handler for event ${eventName}`);
    return subscriptionId;
  }

  public unregisterEventHandlers(eventName: string): void {
    this.eventBus.unsubscribeByEventName(eventName);
    this.logger.info("main", `Unregistered handlers for event ${eventName}`);
  }

  public unregisterEventHandler(subscriptionId: string): void {
    this.eventBus.unsubscribeBySubscriptionId(subscriptionId);
    this.logger.info(
      "main",
      `Unregistered handler for subscription id ${subscriptionId}`
    );
  }

  private onReceiveDecodedEventSignal(decoded: DecodedEvent): void {
    this.logger.debug(this, `Received event ${decoded.name}`);
    this.eventBus.publish(decoded.name, decoded.payload);
  }

  private async onReceiveDecodedCommandSignal(
    from: string,
    decoded: DecodedCommand
  ): Promise<void> {
    if (this.commandBus.hasHandler(decoded.name)) {
      const id = decoded.id;
      this.logger.debug(this, `Received command ${decoded.name} with id ${id}`);
      await this.udpComms.send(
        from,
        this.signalEncoder.encodeCommandAcknowledge(id)
      );
      const result = this.commandBus.execute(decoded.name, decoded.payload);
      await this.udpComms.send(
        from,
        this.signalEncoder.encodeCommandResult(
          id,
          isPromise(result) ? await result : result
        )
      );
    } else {
      this.logger.error(this, `No handler for command ${decoded.name}`);
    }
  }

  private onReceiveDecodedCommandAcknowledgeSignal(
    decoded: DecodedCommandAcknowledge
  ): void {
    const id = decoded.commandId;
    const promiseResolve = this.waitingAckPromises[id];
    if (promiseResolve) {
      this.logger.debug(this, `Received acknowledgement for command id ${id}`);
      promiseResolve();
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.waitingAckPromises[id];
    } else {
      this.logger.error(
        this,
        `No acknowledge promise found for command id ${decoded.commandId}`
      );
    }
  }

  private onReceiveDecodedCommandResultSignal(
    decoded: DecodedCommandResult
  ): void {
    const id = decoded.commandId;
    const promiseResolve = this.waitingResultPromises[id];
    if (promiseResolve) {
      this.logger.debug(this, `Received result for command id ${id}`);
      promiseResolve(decoded.payload);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.waitingResultPromises[id];
    } else {
      this.logger.error(
        this,
        `No result promise found for command id ${decoded.commandId}`
      );
    }
  }
}
