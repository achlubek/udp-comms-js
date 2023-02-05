// eslint-disable-next-line
import "./register";

import { Runtime } from "@app/Runtime";
import { SignalDecoder } from "@app/SignalDecoder";
import { SignalEncoder } from "@app/SignalEncoder";
import { UdpComms } from "@app/UdpComms";
import { CommandBus } from "@app/bus/CommandBus";
import { EventBus } from "@app/bus/EventBus";
import { testReversePayloadCommandName } from "@app/commands/TestReversePayloadCommand";
import { TestReversePayloadCommandHandler } from "@app/commands/TestReversePayloadCommandHandler";
import { NodeInitializedEventHandler } from "@app/events/NodeInitializedEventHandler";
import { Level, Logger } from "@app/logger/Logger";

const logger = new Logger(
  (process.env.LOG_LEVEL as Level | undefined) ?? "trace"
);

const udpComms = new UdpComms(logger, "192.168.1.255", 7777);
const encoder = new SignalEncoder();
const decoder = new SignalDecoder();
const commandBus = new CommandBus();
const eventBus = new EventBus();
const runtime = new Runtime(
  logger,
  udpComms,
  encoder,
  decoder,
  commandBus,
  eventBus
);

runtime.registerCommandHandler(new TestReversePayloadCommandHandler());
runtime.registerEventHandler(new NodeInitializedEventHandler(logger));

void (async () => {
  await runtime.start();
  const result = await runtime.executeCommand(testReversePayloadCommandName, {
    testValue: "Abcdef123!",
  });
  logger.debug("test", JSON.stringify(result, undefined, 4));
})();
