import { OnReceive } from "@app/UdpComms";

export interface UdpCommsInterface {
  send(remoteAddress: string, data: ArrayBuffer): Promise<void>;

  broadcast(data: ArrayBuffer): Promise<void>;

  listen(onReceive: OnReceive): Promise<void>;
}
