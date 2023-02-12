import * as dgram from "dgram";

import { ConfigurationInterface } from "@app/configuration/ConfigurationInterface";
import { Logger } from "@app/logger/Logger";
import { LoggerInterface } from "@app/logger/LoggerInterface";
import { UdpCommsInterface } from "@app/transport/UdpCommsInterface";

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
  logger: LoggerInterface,
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
  logger: LoggerInterface,
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

export class NotConnectedException extends Error {}

export class UdpComms implements UdpCommsInterface {
  private socket: dgram.Socket | null = null;
  public constructor(
    private readonly logger: Logger,
    private readonly configurationInterface: ConfigurationInterface
  ) {}

  public async send(remoteAddress: string, data: ArrayBuffer): Promise<void> {
    if (this.socket !== null) {
      await send(
        this.logger,
        this.socket,
        { host: remoteAddress, port: this.configurationInterface.getPort() },
        data
      );
    } else {
      throw new NotConnectedException("Not connected");
    }
  }

  public async broadcast(data: ArrayBuffer): Promise<void> {
    if (this.socket !== null) {
      await send(
        this.logger,
        this.socket,
        {
          host: this.configurationInterface.getBroadcastAddress(),
          port: this.configurationInterface.getPort(),
        },
        data
      );
    } else {
      throw new NotConnectedException("Not connected");
    }
  }

  public async listen(onReceive: OnReceive): Promise<void> {
    this.socket = await listen(
      this.logger,
      this.configurationInterface.getPort(),
      (from, data) => void onReceive(from.host, data)
    );
  }

  public async close(): Promise<void> {
    if (this.socket === null) {
      throw new NotConnectedException("Not connected");
    }
    return new Promise<void>((resolve) => {
      this.socket?.close(() => {
        this.socket = null;
        resolve();
      });
    });
  }

  public isListening(): boolean {
    return this.socket !== null;
  }
}
