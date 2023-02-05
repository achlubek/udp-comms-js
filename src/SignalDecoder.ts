import { unzipSync } from "zlib";

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | JSONValue[];

type JSONObject = Record<string, JSONValue>;

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

type DecodedSignal =
  | DecodedEvent
  | DecodedCommand
  | DecodedCommandAcknowledge
  | DecodedCommandResult;

export class SignalDecoder {
  public decode(data: ArrayBuffer): DecodedSignal {
    return JSON.parse(unzipSync(data).toString()) as DecodedSignal;
  }
}
