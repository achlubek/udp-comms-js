import * as dgram from "dgram";

import { Logger } from "@app/logger/Logger";

export type OnReceive = (
  from: string,
  data: ArrayBuffer
) => void | Promise<void>;

export interface Address {
  host: string;
  port: number;
}
type OnMessageHandler = (from: Address, data: ArrayBuffer) => void;

function send(
  logger: Logger,
  client: dgram.Socket,
  to: Address,
  data: ArrayBuffer
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    client.send(new Uint8Array(data), to.port, to.host, (err, bytes) => {
      if (err) {
        logger.error("UdpComms.send", `${err.name}: ${err.message}`);
        logger.debug("UdpComms.send", `Cause: ${JSON.stringify(err.cause)}`);
        if (err.stack) {
          logger.debug("UdpComms.send", `Stack: ${err.stack}`);
        }
        reject(err);
      } else {
        logger.debug(
          "UdpComms.send",
          `Sent ${bytes} bytes to ${to.host}:${to.port}`
        );
        resolve(bytes);
      }
    });
  });
}

function listen(
  logger: Logger,
  port: number,
  onMessage: OnMessageHandler
): Promise<dgram.Socket> {
  return new Promise<dgram.Socket>((resolve, reject) => {
    const server = dgram.createSocket({ type: "udp4", reuseAddr: true });
    server.on("error", (err) => {
      logger.error("UdpComms.listen", `${err.name}: ${err.message}`);
      logger.debug("UdpComms.listen", `Cause: ${JSON.stringify(err.cause)}`);
      if (err.stack) {
        logger.debug("UdpComms.listen", `Stack: ${err.stack}`);
      }
      reject(err);
    });
    server.on("listening", () => {
      server.setBroadcast(true);
      logger.debug("UdpComms.listen", `Listening on port ${port}`);
      resolve(server);
    });
    server.on("message", (msg, rinfo) => {
      logger.debug(
        "UdpComms.listen",
        `New message from ${rinfo.address}:${rinfo.port}`
      );
      onMessage({ host: rinfo.address, port: rinfo.port }, msg);
    });
    server.bind(port);
  });
}

export class UdpComms {
  private socket: dgram.Socket | null = null;
  public constructor(
    private readonly logger: Logger,
    private readonly broadcastAddress: string,
    private readonly port: number
  ) {}

  public async send(remoteAddress: string, data: ArrayBuffer): Promise<void> {
    if (this.socket) {
      await send(
        this.logger,
        this.socket,
        { host: remoteAddress, port: this.port },
        data
      );
    } else {
      throw new Error("Not connected");
    }
  }

  public async broadcast(data: ArrayBuffer): Promise<void> {
    if (this.socket) {
      await send(
        this.logger,
        this.socket,
        { host: this.broadcastAddress, port: this.port },
        data
      );
    } else {
      throw new Error("Not connected");
    }
  }

  public async listen(onReceive: OnReceive): Promise<void> {
    this.socket = await listen(
      this.logger,
      this.port,
      (from, data) => void onReceive(from.host, data)
    );
  }
}
