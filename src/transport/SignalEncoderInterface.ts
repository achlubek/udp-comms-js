export interface SignalEncoderInterface {
  encodeEvent<T>(name: string, payload: T): ArrayBuffer;

  encodeCommand<T>(id: string, name: string, payload: T): ArrayBuffer;

  encodeCommandAcknowledge(commandId: string): ArrayBuffer;

  encodeCommandResult(commandId: string, success: boolean): ArrayBuffer;

  encodeQuery<T>(id: string, name: string, payload: T): ArrayBuffer;

  encodeQueryAcknowledge(queryId: string): ArrayBuffer;

  encodeQueryResult<T>(queryId: string, payload: T): ArrayBuffer;
}
