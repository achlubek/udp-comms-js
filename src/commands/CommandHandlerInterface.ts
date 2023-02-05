export interface CommandHandlerInterface<Payload, Results> {
  handle(payload: Payload): Results;
}
