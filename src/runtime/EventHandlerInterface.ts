export interface EventHandlerInterface<Event> {
  handle(event: Event): void;
}
