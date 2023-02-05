import { CommandBusInterface } from "@app/bus/CommandBusInterface";

export type CommandHandler = (payload: unknown) => unknown;

class CommandException extends Error {
  public constructor(public readonly commandName: string, message: string) {
    super(message);
  }
}
export class CommandHandlerAlreadyRegisteredException extends CommandException {
  public constructor(commandName: string) {
    super(commandName, "Handler already registered");
  }
}
export class CommandHandlerNotRegisteredException extends CommandException {
  public constructor(commandName: string) {
    super(commandName, "Handler not registered");
  }
}

export class CommandBus implements CommandBusInterface {
  private handlers: Record<string, CommandHandler | undefined> = {};

  public register(commandName: string, handler: CommandHandler): void {
    if (this.handlers[commandName]) {
      throw new CommandHandlerAlreadyRegisteredException(commandName);
    }
    this.handlers[commandName] = handler;
  }

  public getHandledCommands(): string[] {
    return Object.keys(this.handlers);
  }

  public unregister(commandName: string): void {
    this.handlers[commandName] = undefined;
  }

  public hasHandler(commandName: string): boolean {
    return !!this.handlers[commandName];
  }

  public execute(commandName: string, payload: unknown): unknown {
    const handler = this.handlers[commandName];
    if (!handler) {
      throw new CommandHandlerNotRegisteredException(commandName);
    }
    return handler(payload);
  }
}
