export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | JSONValue[];

export type JSONObject = Record<string, JSONValue>;

export interface DecodedEvent {
  dateType: "event";
  id: string;
  name: string;
  payload: JSONObject;
}

export interface DecodedCommand {
  dateType: "command";
  id: string;
  name: string;
  payload: JSONObject;
}

export interface DecodedCommandAcknowledge {
  dateType: "command-acknowledge";
  id: string;
  commandId: string;
}

export interface DecodedCommandResult {
  dateType: "command-result";
  id: string;
  commandId: string;
  payload: JSONObject;
}

export type DecodedSignal =
  | DecodedEvent
  | DecodedCommand
  | DecodedCommandAcknowledge
  | DecodedCommandResult;

export interface SignalDecoderInterface {
  decode(data: ArrayBuffer): DecodedSignal;
}
