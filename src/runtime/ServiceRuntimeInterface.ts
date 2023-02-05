import { CommandHandlerInterface } from "@app/runtime/CommandHandlerInterface";
import { CommandInterface } from "@app/runtime/CommandInterface";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";
import { EventInterface } from "@app/runtime/EventInterface";

export interface ServiceRuntimeInterface {
  start(): Promise<void>;

  stop(): Promise<void>;

  getName(): string;

  executeCommand<Payload, Returns>(
    host: string,
    command: CommandInterface<Payload>
  ): Promise<Returns>;

  executeMultiCommand<Payload, Returns>(
    hosts: string[],
    command: CommandInterface<Payload>
  ): Promise<PromiseSettledResult<Awaited<Returns>>[]>;

  publishEvent<T>(event: EventInterface<T>): Promise<void>;

  registerCommandHandler(
    handler: CommandHandlerInterface<unknown, unknown>
  ): void;

  unregisterCommandHandler(commandName: string): void;

  registerEventHandler(handler: EventHandlerInterface<unknown>): string;

  unregisterEventHandlers(eventName: string): void;

  unregisterEventHandler(subscriptionId: string): void;
}
