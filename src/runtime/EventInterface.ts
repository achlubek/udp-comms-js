export interface EventInterface<Payload> {
  readonly eventName: string;
  readonly eventPayload: Payload;
}
