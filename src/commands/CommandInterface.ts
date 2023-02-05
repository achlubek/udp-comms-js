export interface CommandInterface<Payload> {
  readonly name: string;
  readonly payload: Payload;
}
