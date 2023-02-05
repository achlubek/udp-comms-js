import * as crypto from "crypto";

import { SignalDecoder } from "@app/SignalDecoder";
import { SignalEncoder } from "@app/SignalEncoder";
import { UdpComms } from "@app/UdpComms";
import { CommandBus } from "@app/bus/CommandBus";
import { EventBus } from "@app/bus/EventBus";
import { Logger } from "@app/logger/Logger";

// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const isPromise = (p: unknown | Promise<unknown>): boolean => {
  const pthen = (p as { then?: unknown }).then;
  return typeof p === "object" && typeof pthen === "function";
};

export class Runtime {
  private waitingAckPromises: Record<
    string,
    ((value: void | PromiseLike<void>) => void) | undefined
  > = {};

  private waitingResultPromises: Record<
    string,
    ((value: Any | PromiseLike<Any>) => void) | undefined
  > = {};

  public constructor(
    private readonly logger: Logger,
    private readonly udpComms: UdpComms,
    private readonly signalEncoder: SignalEncoder,
    private readonly signalDecoder: SignalDecoder,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  public async start(): Promise<void> {
    await this.udpComms.listen(async (from, data) => {
      const decoded = this.signalDecoder.decode(data);

      if (decoded.dateType === "event") {
        this.logger.debug(this, `Received event ${decoded.name}`);
        this.eventBus.publish(decoded.name, decoded.payload);
      }

      if (decoded.dateType === "command") {
        if (this.commandBus.hasHandler(decoded.name)) {
          const id = decoded.id;
          this.logger.debug(
            this,
            `Received command ${decoded.name} with id ${id}`
          );
          await this.udpComms.send(
            from,
            this.signalEncoder.encodeCommandAcknowledge(id)
          );
          const result = this.commandBus.execute(
            decoded.name,
            decoded.payload
          ) as unknown | Promise<unknown>;
          await this.udpComms.send(
            from,
            this.signalEncoder.encodeCommandResult(
              id,
              isPromise(result) ? await result : result
            )
          );
        } else {
          this.logger.error(this, `No handler for command ${decoded.name}`);
        }
      }

      if (decoded.dateType === "command-acknowledge") {
        const id = decoded.commandId;
        const promise = this.waitingAckPromises[id];
        if (promise) {
          this.logger.debug(
            this,
            `Received acknowledgement for command id ${id}`
          );
          promise();
          delete this.waitingAckPromises[id];
        } else {
          this.logger.error(
            this,
            `No acknowledge promise found for command id ${decoded.commandId}`
          );
        }
      }

      if (decoded.dateType === "command-result") {
        const id = decoded.commandId;
        const promise = this.waitingResultPromises[id];
        if (promise) {
          this.logger.debug(this, `Received result for command id ${id}`);
          promise(decoded.payload);
          delete this.waitingResultPromises[id];
        } else {
          this.logger.error(
            this,
            `No result promise found for command id ${decoded.commandId}`
          );
        }
      }
    });
  }

  public async executeCommand<Payload, Returns>(
    name: string,
    payload: Payload
  ): Promise<Returns> {
    this.logger.info(this, `Executing command ${name}`);
    const id = crypto.randomUUID();
    this.logger.debug(this, `Assigned command id ${id}`);
    const ackPromise = new Promise<void>((resolve, reject) => {
      this.waitingAckPromises[id] = resolve;
      setTimeout(() => reject("timeout"), 1000);
    });

    const resultPromise = new Promise<Returns>((resolve, reject) => {
      this.waitingResultPromises[id] = resolve;
      setTimeout(() => reject("timeout"), 1000);
    });

    this.logger.debug(this, `Broadcasting command ${name}`);
    await this.udpComms.broadcast(
      this.signalEncoder.encodeCommand(id, name, payload)
    );

    this.logger.debug(this, `Waiting for acknowledgement for command id ${id}`);
    await ackPromise;
    this.logger.debug(this, `Waiting for result for command id ${id}`);
    return resultPromise;
  }

  public async dispatchEvent<T>(name: string, payload: T): Promise<void> {
    this.logger.info(this, `Dispatching event ${name}`);
    await this.udpComms.broadcast(
      this.signalEncoder.encodeEvent(name, payload)
    );
  }
}
