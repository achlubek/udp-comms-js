// eslint-disable-next-line
import "./register";

import { getEnvironment } from "@app/Env";
import { Runtime } from "@app/Runtime";
import { SignalDecoder } from "@app/SignalDecoder";
import { SignalEncoder } from "@app/SignalEncoder";
import { UdpComms } from "@app/UdpComms";
import { CommandBus } from "@app/bus/CommandBus";
import { EventBus } from "@app/bus/EventBus";
import { testReversePayloadCommandName } from "@app/commands/TestReversePayloadCommand";
import { TestReversePayloadCommandHandler } from "@app/commands/TestReversePayloadCommandHandler";
import { NodeInitializedEventHandler } from "@app/events/NodeInitializedEventHandler";
import { RequestServiceDescriptorsEventHandler } from "@app/events/RequestServiceDescriptorsEventHandler";
import { RequestServiceDescriptorsEvent } from "@app/events/RequestServicesDescriptorsEvent";
import { Logger } from "@app/logger/Logger";

const env = getEnvironment();

const logger = new Logger(env.LOG_LEVEL);

const udpComms = new UdpComms(logger, env.BROADCAST_ADDRESS, env.PORT);
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
runtime.registerEventHandler(
  new RequestServiceDescriptorsEventHandler(runtime, commandBus, eventBus)
);

void (async () => {
  await runtime.start();
  const result = await runtime.executeCommand(testReversePayloadCommandName, {
    testValue: "Abcdef123!",
  });
  logger.debug("test", JSON.stringify(result, undefined, 4));
  await runtime.publishEvent(new RequestServiceDescriptorsEvent());
})();
