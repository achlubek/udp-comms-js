export interface EventHandlerInterface<Payload> {
  getHandledEventName(): string;
  handle(payload: Payload): void;
}
