import { CommandHandlerInterface } from "@app/runtime/CommandHandlerInterface";
import { CommandInterface } from "@app/runtime/CommandInterface";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";
import { EventInterface } from "@app/runtime/EventInterface";

export interface ServiceRuntimeInterface {
  start(): Promise<void>;

  stop(): Promise<void>;

  getName(): string;

  executeCommand<Payload, Returns>(
    command: CommandInterface<Payload>
  ): Promise<Returns>;

  publishEvent<T>(event: EventInterface<T>): Promise<void>;

  registerCommandHandler(
    handler: CommandHandlerInterface<unknown, unknown>
  ): void;

  unregisterCommandHandler(commandName: string): void;

  registerEventHandler(handler: EventHandlerInterface<unknown>): string;
}
