export interface CommandHandlerInterface<Payload, Results> {
  getHandledCommandName(): string;
  handle(payload: Payload): Results;
}
