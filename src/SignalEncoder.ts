import * as crypto from "crypto";
import { deflateSync } from "zlib";

import { SignalEncoderInterface } from "@app/SignalEncoderInterface";

export class SignalEncoder implements SignalEncoderInterface {
  public encodeEvent<T>(name: string, payload: T): ArrayBuffer {
    return this.stringifyAndDeflate({
      id: crypto.randomUUID(),
      dateType: "event",
      name,
      payload,
    });
  }

  public encodeCommand<T>(id: string, name: string, payload: T): ArrayBuffer {
    return this.stringifyAndDeflate({
      id,
      dateType: "command",
      name,
      payload,
    });
  }

  public encodeCommandAcknowledge(commandId: string): ArrayBuffer {
    return this.stringifyAndDeflate({
      id: crypto.randomUUID(),
      dateType: "command-acknowledge",
      commandId,
    });
  }

  public encodeCommandResult<T>(commandId: string, payload: T): ArrayBuffer {
    return this.stringifyAndDeflate({
      id: crypto.randomUUID(),
      dateType: "command-result",
      commandId,
      payload,
    });
  }

  private stringifyAndDeflate<T>(data: T): ArrayBuffer {
    return deflateSync(JSON.stringify(data), { level: 9 });
  }
}
