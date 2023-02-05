import { CommandHandlerInterface } from "@app/commands/CommandHandlerInterface";
import { EventHandlerInterface } from "@app/events/EventHandlerInterface";
import { EventInterface } from "@app/events/EventInterface";

export interface ServiceRuntimeInterface {
  start(): Promise<void>;

  executeCommand<Payload, Returns>(
    name: string,
    payload: Payload
  ): Promise<Returns>;

  publishEvent<T>(event: EventInterface<T>): Promise<void>;

  registerCommandHandler(
    handler: CommandHandlerInterface<unknown, unknown>
  ): void;

  unregisterCommandHandler(commandName: string): void;

  registerEventHandler(handler: EventHandlerInterface<unknown>): string;
}
