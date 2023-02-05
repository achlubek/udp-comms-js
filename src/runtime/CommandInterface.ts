export interface CommandInterface<Payload> {
  readonly commandName: string;
  readonly commandPayload: Payload;
}
