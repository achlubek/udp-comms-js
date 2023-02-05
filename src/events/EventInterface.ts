export interface EventInterface<Payload> {
  readonly name: string;
  readonly payload: Payload;
}
