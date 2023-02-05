// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
type CommandHandlerAnyType = (payload: Any) => Any;

export class CommandBus {
  private handlers: Record<string, CommandHandlerAnyType | undefined> = {};
  public register(commandName: string, handler: CommandHandlerAnyType): void {
    if (this.handlers[commandName]) {
      throw new Error("handler already registered");
    }
    this.handlers[commandName] = handler;
  }

  public unsubscribe(commandName: string): void {
    this.handlers[commandName] = undefined;
  }

  public hasHandler(commandName: string): boolean {
    return !!this.handlers[commandName];
  }

  public execute(commandName: string, payload: Any): Any {
    const handler = this.handlers[commandName];
    if (!handler) {
      throw new Error("handler not registered");
    }
    return handler(payload);
  }
}
