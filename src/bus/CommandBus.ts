type CommandHandler = (payload: unknown) => unknown;

export class CommandBus {
  private handlers: Record<string, CommandHandler | undefined> = {};
  public register(commandName: string, handler: CommandHandler): void {
    if (this.handlers[commandName]) {
      throw new Error("handler already registered");
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
      throw new Error("handler not registered");
    }
    return handler(payload);
  }
}
