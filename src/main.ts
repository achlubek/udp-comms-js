// eslint-disable-next-line
import "./register";

import { Configuration } from "@app/Configuration";
import { ConfigurationInterface } from "@app/ConfigurationInterface";
import { SignalDecoder } from "@app/SignalDecoder";
import { SignalEncoder } from "@app/SignalEncoder";
import { UdpComms } from "@app/UdpComms";
import { CommandBus } from "@app/bus/CommandBus";
import { EventBus } from "@app/bus/EventBus";
import { RequestServiceDescriptorCommand } from "@app/commands/RequestServiceDescriptorCommand";
import { RequestServiceDescriptorsEvent } from "@app/events/RequestServicesDescriptorsEvent";
import { Logger } from "@app/logger/Logger";
import { ServiceRuntime } from "@app/runtime/ServiceRuntime";

const configuration: ConfigurationInterface = new Configuration();

const logger = new Logger(configuration.getLogLevel());

const udpComms = new UdpComms(
  logger,
  configuration.getBroadcastAddress(),
  configuration.getPort()
);
const encoder = new SignalEncoder();
const decoder = new SignalDecoder();
const commandBus = new CommandBus();
const eventBus = new EventBus();
const runtime = new ServiceRuntime(
  configuration.getServiceName(),
  logger,
  udpComms,
  encoder,
  decoder,
  commandBus,
  eventBus,
  {
    acknowledgeTimeout: 100,
    executeTimeout: 100,
  }
);

void (async () => {
  await runtime.start();
  const result = await runtime.executeCommand(
    new RequestServiceDescriptorCommand()
  );
  logger.debug("test", JSON.stringify(result, undefined, 4));
  await runtime.publishEvent(new RequestServiceDescriptorsEvent());
})();
