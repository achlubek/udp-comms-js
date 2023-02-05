import * as crypto from "crypto";

import { ServiceRuntimeInterface } from "@app/ServiceRuntimeInterface";
import { SignalDecoderInterface } from "@app/SignalDecoderInterface";
import { SignalEncoderInterface } from "@app/SignalEncoderInterface";
import { UdpCommsInterface } from "@app/UdpCommsInterface";
import { CommandBusInterface } from "@app/bus/CommandBusInterface";
import { EventBusInterface } from "@app/bus/EventBusInterface";
import { CommandHandlerInterface } from "@app/commands/CommandHandlerInterface";
import { EventHandlerInterface } from "@app/events/EventHandlerInterface";
import { EventInterface } from "@app/events/EventInterface";
import { NodeInitializedEvent } from "@app/events/NodeInitializedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";

// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const isPromise = (p: unknown | Promise<unknown>): boolean => {
  const pthen = (p as { then?: unknown }).then;
  return typeof p === "object" && typeof pthen === "function";
};

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
    private readonly logger: LoggerInterface,
    private readonly udpComms: UdpCommsInterface,
    private readonly signalEncoder: SignalEncoderInterface,
    private readonly signalDecoder: SignalDecoderInterface,
    private readonly commandBus: CommandBusInterface,
    private readonly eventBus: EventBusInterface
  ) {}

  public async start(): Promise<void> {
    await this.udpComms.listen(async (from, data) => {
      const decoded = this.signalDecoder.decode(data);
      this.logger.debug(
        this,
        `Decoded signal from ${from}: ${JSON.stringify(decoded, undefined, 4)}`
      );

      if (decoded.dateType === "event") {
        this.logger.debug(this, `Received event ${decoded.name}`);
        this.eventBus.publish(decoded.name, decoded.payload);
      }

      if (decoded.dateType === "command") {
        if (this.commandBus.hasHandler(decoded.name)) {
          const id = decoded.id;
          this.logger.debug(
            this,
            `Received command ${decoded.name} with id ${id}`
          );
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

      if (decoded.dateType === "command-acknowledge") {
        const id = decoded.commandId;
        const promise = this.waitingAckPromises[id];
        if (promise) {
          this.logger.debug(
            this,
            `Received acknowledgement for command id ${id}`
          );
          promise();
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this.waitingAckPromises[id];
        } else {
          this.logger.error(
            this,
            `No acknowledge promise found for command id ${decoded.commandId}`
          );
        }
      }

      if (decoded.dateType === "command-result") {
        const id = decoded.commandId;
        const promise = this.waitingResultPromises[id];
        if (promise) {
          this.logger.debug(this, `Received result for command id ${id}`);
          promise(decoded.payload);
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this.waitingResultPromises[id];
        } else {
          this.logger.error(
            this,
            `No result promise found for command id ${decoded.commandId}`
          );
        }
      }
    });
    await this.publishEvent(new NodeInitializedEvent());
  }

  public async executeCommand<Payload, Returns>(
    name: string,
    payload: Payload
  ): Promise<Returns> {
    this.logger.info(this, `Executing command ${name}`);
    const id = crypto.randomUUID();
    this.logger.debug(this, `Assigned command id ${id}`);
    const ackPromise = new Promise<void>((resolve, reject) => {
      this.waitingAckPromises[id] = resolve;
      setTimeout(() => reject("timeout"), 1000);
    });

    const resultPromise = new Promise<Returns>((resolve, reject) => {
      this.waitingResultPromises[id] = resolve;
      setTimeout(() => reject("timeout"), 1000);
    });

    this.logger.debug(this, `Broadcasting command ${name}`);
    await this.udpComms.broadcast(
      this.signalEncoder.encodeCommand(id, name, payload)
    );

    this.logger.debug(this, `Waiting for acknowledgement for command id ${id}`);
    await ackPromise;
    this.logger.debug(this, `Waiting for result for command id ${id}`);
    return resultPromise;
  }

  public async publishEvent<T>(event: EventInterface<T>): Promise<void> {
    this.logger.info(this, `Dispatching event ${event.name}`);
    await this.udpComms.broadcast(
      this.signalEncoder.encodeEvent(event.name, event.payload)
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
}
