import { CommandHandler } from "@app/bus/CommandBus";

export interface CommandBusInterface {
  register(commandName: string, handler: CommandHandler): void;

  getHandledCommands(): string[];

  unregister(commandName: string): void;

  hasHandler(commandName: string): boolean;

  execute(commandName: string, payload: unknown): unknown;
}
