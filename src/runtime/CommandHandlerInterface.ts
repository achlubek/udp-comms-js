export interface CommandHandlerInterface<Command> {
  handle(command: Command): void;
}
