export interface SignalEncoderInterface {
  encodeEvent<T>(name: string, payload: T): ArrayBuffer;

  encodeCommand<T>(id: string, name: string, payload: T): ArrayBuffer;

  encodeCommandAcknowledge(commandId: string): ArrayBuffer;

  encodeCommandResult<T>(commandId: string, payload: T): ArrayBuffer;
}
