// eslint-disable-next-line
import "./register";

import { Runtime } from "@app/Runtime";
import { SignalDecoder } from "@app/SignalDecoder";
import { SignalEncoder } from "@app/SignalEncoder";
import { UdpComms } from "@app/UdpComms";
import { CommandBus } from "@app/bus/CommandBus";
import { EventBus } from "@app/bus/EventBus";
import { CommandHandlerInterface } from "@app/commands/CommandHandlerInterface";
import { CommandInterface } from "@app/commands/CommandInterface";
import {
  TestReversePayloadCommand,
  testReversePayloadCommandName,
} from "@app/commands/TestReversePayloadCommand";
import { TestReversePayloadCommandHandler } from "@app/commands/TestReversePayloadCommandHandler";
import { Level, Logger } from "@app/logger/Logger";
import { ConstructorOf } from "@app/util/ConstructorOf";
import { getStatic } from "@app/util/getStatic";

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

const register = <Command extends CommandInterface<unknown>>(
  commandClass: ConstructorOf<Command>,
  handler: CommandHandlerInterface<Command["payload"], Command["payload"]>
): void => {
  const commandName = getStatic(commandClass, "name");
  commandBus.register(commandName, handler.handle.bind(handler));
  logger.info("main", `Registered handler for command ${commandName}`);
};

void (async () => {
  await runtime.start();
  register(TestReversePayloadCommand, new TestReversePayloadCommandHandler());
  const result = await runtime.executeCommand<
    TestReversePayloadCommand["payload"],
    TestReversePayloadCommand["payload"]
  >(testReversePayloadCommandName, { testValue: "Abcdef123!" });
  logger.debug("test", JSON.stringify(result, undefined, 4));
})();
//
// (function wait() {
//   if (runtime) setTimeout(wait, 1000);
// })();
