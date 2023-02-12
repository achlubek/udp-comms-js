import { CommandBus, EventBus, QueryBus } from "cqe-js";
import * as crypto from "crypto";

import { ConfigurationInterface } from "@app/configuration/ConfigurationInterface";
import { RequestServiceDescriptorsEventHandler } from "@app/event-handlers/RequestServiceDescriptorsEventHandler";
import { ServiceStartedEventHandler } from "@app/event-handlers/ServiceStartedEventHandler";
import { ServiceStoppedEventHandler } from "@app/event-handlers/ServiceStoppedEventHandler";
import { RequestServiceDescriptorsEvent } from "@app/events/RequestServicesDescriptorsEvent";
import { ServiceDescriptorEvent } from "@app/events/ServiceDescriptorEvent";
import { ServiceStartedEvent } from "@app/events/ServiceStartedEvent";
import { ServiceStoppedEvent } from "@app/events/ServiceStoppedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";
import { GetServiceDescriptorQuery } from "@app/queries/GetServiceDescriptorQuery";
import { GetServiceDescriptorQueryHandler } from "@app/query-handlers/GetServiceDescriptorQueryHandler";
import { CommandHandlerInterface } from "@app/runtime/CommandHandlerInterface";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";
import {
  DecodedCommand,
  DecodedCommandAcknowledge,
  DecodedCommandResult,
  DecodedEvent,
  DecodedQuery,
  DecodedQueryAcknowledge,
  DecodedQueryResult,
  SignalDecoderInterface,
} from "@app/transport/SignalDecoderInterface";
import { SignalEncoderInterface } from "@app/transport/SignalEncoderInterface";
import { UdpCommsInterface } from "@app/transport/UdpCommsInterface";

// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
export type Constructor<T> = new (...args: Any[]) => T;

// danger
// const castToClass = <T extends object>(
//   classConstructor: Constructor<T>,
//   obj: object
// ): T => {
//   Object.defineProperty(obj.constructor, "name", {
//     value: classConstructor.name,
//     writable: false,
//   });
//   return obj as T;
// };

// even more danger
const castToClassName = (className: string, obj: object): object => {
  Object.defineProperty(obj.constructor, "name", {
    value: className,
    writable: false,
  });
  return obj;
};

export interface Timeouts {
  acknowledgeTimeout: number;
  executeTimeout: number;
}

export class NotStartedException extends Error {}
export class AlreadyStartedException extends Error {}

export class ServiceRuntime {
  private waitingAckPromises: Record<
    string,
    ((value: void | PromiseLike<void>) => void) | undefined
  > = {};

  private waitingResultPromises: Record<
    string,
    ((value: Any | PromiseLike<Any>) => void) | undefined
  > = {};

  public constructor(
    private readonly configurationInterface: ConfigurationInterface,
    private readonly logger: LoggerInterface,
    private readonly udpComms: UdpCommsInterface,
    private readonly signalEncoder: SignalEncoderInterface,
    private readonly signalDecoder: SignalDecoderInterface,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
    private readonly timeouts: Timeouts
  ) {
    setInterval(() => {
      if (this.udpComms.isListening()) {
        void this.publishEvent(
          new ServiceDescriptorEvent(
            this.getName(),
            this.commandBus.getHandledCommands(),
            this.queryBus.getHandledQueries(),
            this.eventBus.getHandledEvents()
          )
        );
      }
    }, 1000);
  }

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
        await this.onReceiveDecodedEventSignal(decoded);
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

      if (decoded.dateType === "query") {
        await this.onReceiveDecodedQuerySignal(from, decoded);
      }

      if (decoded.dateType === "query-acknowledge") {
        this.onReceiveDecodedQueryAcknowledgeSignal(decoded);
      }

      if (decoded.dateType === "query-result") {
        this.onReceiveDecodedQueryResultSignal(decoded);
      }
    });
    await this.publishEvent(
      new ServiceStartedEvent(this.configurationInterface.getServiceName())
    );
  }

  private registerInternalHandlers(): void {
    this.registerQueryHandler(
      GetServiceDescriptorQuery,
      new GetServiceDescriptorQueryHandler(
        this,
        this.commandBus,
        this.queryBus,
        this.eventBus
      )
    );
    this.registerEventHandler(
      RequestServiceDescriptorsEvent,
      new RequestServiceDescriptorsEventHandler(
        this,
        this.commandBus,
        this.queryBus,
        this.eventBus
      )
    );
    this.registerEventHandler(
      ServiceStartedEvent,
      new ServiceStartedEventHandler(this.logger)
    );
    this.registerEventHandler(
      ServiceStoppedEvent,
      new ServiceStoppedEventHandler(this.logger)
    );
  }

  public async stop(): Promise<void> {
    if (!this.udpComms.isListening()) {
      throw new NotStartedException("Not started");
    }
    this.unregisterInternalHandlers();
    await this.publishEvent(
      new ServiceStoppedEvent(this.configurationInterface.getServiceName())
    );
    await this.udpComms.close();
  }
  public getName(): string {
    return this.configurationInterface.getServiceName();
  }

  private unregisterInternalHandlers(): void {
    this.unregisterCommandHandler(GetServiceDescriptorQuery);
    this.unregisterEventHandlers(RequestServiceDescriptorsEvent);
    this.unregisterEventHandlers(ServiceStartedEvent);
    this.unregisterEventHandlers(ServiceStoppedEvent);
  }

  public async executeCommand<Command extends object>(
    host: string,
    command: Command
  ): Promise<boolean> {
    this.logger.info(this, `Executing command ${command.constructor.name}`);
    const id = crypto.randomUUID();
    try {
      this.logger.debug(this, `Assigned command id ${id}`);
      const ackPromise = new Promise<void>((resolve, reject) => {
        this.waitingAckPromises[id] = resolve;
        setTimeout(
          () => reject("acknowledge timeout"),
          this.timeouts.acknowledgeTimeout
        );
      });

      const resultPromise = new Promise<boolean>((resolve, reject) => {
        this.waitingResultPromises[id] = resolve;
        setTimeout(
          () => reject("execute timeout"),
          this.timeouts.executeTimeout
        );
      });

      this.logger.debug(this, `Sending command ${command.constructor.name}`);
      await this.udpComms.send(
        host,
        this.signalEncoder.encodeCommand(id, command.constructor.name, command)
      );
      this.logger.debug(
        this,
        `Waiting for acknowledgement for command id ${id}`
      );
      await ackPromise;
      this.logger.debug(this, `Waiting for result for command id ${id}`);
      return await resultPromise;
    } finally {
      if (this.waitingAckPromises[id]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.waitingAckPromises[id];
      }
      if (this.waitingAckPromises[id]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.waitingResultPromises[id];
      }
    }
  }

  public async executeMultiCommand<Command extends object>(
    hosts: string[],
    command: Command
  ): Promise<PromiseSettledResult<Awaited<boolean>>[]> {
    this.logger.info(
      this,
      `Executing multi command ${command.constructor.name}`
    );
    const promises = hosts.map((host) =>
      this.executeCommand<Command>(host, command)
    );
    return await Promise.allSettled(promises);
  }

  public async executeQuery<Query extends object, Returns>(
    host: string,
    query: Query
  ): Promise<Returns> {
    this.logger.info(this, `Executing query ${query.constructor.name}`);
    const id = crypto.randomUUID();
    try {
      this.logger.debug(this, `Assigned query id ${id}`);
      const ackPromise = new Promise<void>((resolve, reject) => {
        this.waitingAckPromises[id] = resolve;
        setTimeout(
          () => reject("acknowledge timeout"),
          this.timeouts.acknowledgeTimeout
        );
      });

      const resultPromise = new Promise<Returns>((resolve, reject) => {
        this.waitingResultPromises[id] = resolve;
        setTimeout(
          () => reject("execute timeout"),
          this.timeouts.executeTimeout
        );
      });

      this.logger.debug(this, `Sending query ${query.constructor.name}`);
      await this.udpComms.send(
        host,
        this.signalEncoder.encodeQuery(id, query.constructor.name, query)
      );
      this.logger.debug(this, `Waiting for acknowledgement for query id ${id}`);
      await ackPromise;
      this.logger.debug(this, `Waiting for result for query id ${id}`);
      return await resultPromise;
    } finally {
      if (this.waitingAckPromises[id]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.waitingAckPromises[id];
      }
      if (this.waitingAckPromises[id]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.waitingResultPromises[id];
      }
    }
  }

  public async executeMultiQuery<Query extends object, Returns>(
    hosts: string[],
    query: Query
  ): Promise<PromiseSettledResult<Awaited<Returns>>[]> {
    this.logger.info(this, `Executing multi query ${query.constructor.name}`);
    const promises = hosts.map((host) =>
      this.executeQuery<Query, Returns>(host, query)
    );
    return await Promise.allSettled(promises);
  }

  public async publishEvent<T extends object>(event: T): Promise<void> {
    this.logger.info(this, `Dispatching event ${event.constructor.name}`);
    await this.udpComms.broadcast(
      this.signalEncoder.encodeEvent(event.constructor.name, event)
    );
  }

  public registerCommandHandler<T extends object>(
    command: Constructor<T>,
    handler: CommandHandlerInterface<T>
  ): void {
    this.commandBus.register(command, handler.handle.bind(handler));
    this.logger.info(this, `Registered handler for command ${command.name}`);
  }

  public unregisterCommandHandler<T extends object>(
    command: Constructor<T>
  ): void {
    this.commandBus.unregister(command);
    this.logger.info(
      "main",
      `Unregistered handler for command ${command.name}`
    );
  }

  public registerQueryHandler<T extends object>(
    query: Constructor<T>,
    handler: CommandHandlerInterface<T>
  ): void {
    this.queryBus.register(query, handler.handle.bind(handler));
    this.logger.info(this, `Registered handler for query ${query.name}`);
  }

  public unregisterQueryHandler<T extends object>(query: Constructor<T>): void {
    this.queryBus.unregister(query);
    this.logger.info(this, `Unregistered handler for query ${query.name}`);
  }

  public registerEventHandler<T extends object>(
    event: Constructor<T>,
    handler: EventHandlerInterface<T>
  ): string {
    const subscriptionId = this.eventBus.subscribe(
      event,
      handler.handle.bind(handler)
    );
    this.logger.info(this, `Registered handler for event ${event.name}`);
    return subscriptionId;
  }

  public unregisterEventHandlers<T extends object>(
    event: Constructor<T>
  ): void {
    this.eventBus.unsubscribeByEventClass(event);
    this.logger.info(this, `Unregistered handlers for event ${event.name}`);
  }

  public unregisterEventHandler(subscriptionId: string): void {
    this.eventBus.unsubscribeBySubscriptionId(subscriptionId);
    this.logger.info(
      "main",
      `Unregistered handler for subscription id ${subscriptionId}`
    );
  }

  private async onReceiveDecodedEventSignal(
    decoded: DecodedEvent
  ): Promise<void> {
    this.logger.debug(this, `Received event ${decoded.name}`);
    const recreatedEvent = castToClassName(decoded.name, decoded.payload);
    await this.eventBus.publish(recreatedEvent);
  }

  private async onReceiveDecodedCommandSignal(
    from: string,
    decoded: DecodedCommand
  ): Promise<void> {
    const id = decoded.id;
    this.logger.debug(this, `Received command ${decoded.name} with id ${id}`);
    await this.udpComms.send(
      from,
      this.signalEncoder.encodeCommandAcknowledge(id)
    );
    const recreatedCommand = castToClassName(decoded.name, decoded.payload);
    await this.commandBus.execute(recreatedCommand);
    await this.udpComms.send(
      from,
      this.signalEncoder.encodeCommandResult(id, true)
    );
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
      promiseResolve(decoded);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.waitingResultPromises[id];
    } else {
      this.logger.error(
        this,
        `No result promise found for command id ${decoded.commandId}`
      );
    }
  }

  private async onReceiveDecodedQuerySignal(
    from: string,
    decoded: DecodedQuery
  ): Promise<void> {
    const id = decoded.id;
    this.logger.debug(this, `Received query ${decoded.name} with id ${id}`);
    await this.udpComms.send(
      from,
      this.signalEncoder.encodeQueryAcknowledge(id)
    );
    const recreatedQuery = castToClassName(decoded.name, decoded.payload);
    const result = await this.queryBus.execute(recreatedQuery);
    await this.udpComms.send(
      from,
      this.signalEncoder.encodeQueryResult(id, result)
    );
  }

  private onReceiveDecodedQueryAcknowledgeSignal(
    decoded: DecodedQueryAcknowledge
  ): void {
    const id = decoded.queryId;
    const promiseResolve = this.waitingAckPromises[id];
    if (promiseResolve) {
      this.logger.debug(this, `Received acknowledgement for query id ${id}`);
      promiseResolve();
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.waitingAckPromises[id];
    } else {
      this.logger.error(
        this,
        `No acknowledge promise found for query id ${decoded.queryId}`
      );
    }
  }

  private onReceiveDecodedQueryResultSignal(decoded: DecodedQueryResult): void {
    const id = decoded.queryId;
    const promiseResolve = this.waitingResultPromises[id];
    if (promiseResolve) {
      this.logger.debug(this, `Received result for query id ${id}`);
      promiseResolve(decoded);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.waitingResultPromises[id];
    } else {
      this.logger.error(
        this,
        `No result promise found for query id ${decoded.queryId}`
      );
    }
  }
}
