import { unzipSync } from "zlib";

import {
  DecodedSignal,
  SignalDecoderInterface,
} from "@app/SignalDecoderInterface";

export class SignalDecoder implements SignalDecoderInterface {
  public decode(data: ArrayBuffer): DecodedSignal {
    return JSON.parse(unzipSync(data).toString()) as DecodedSignal;
  }
}
