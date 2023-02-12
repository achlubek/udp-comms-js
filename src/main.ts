import { AeroDI } from "aero-di";
import { CommandBus, EventBus, QueryBus } from "cqe-js";

import { RequestServiceDescriptorsEvent } from "@app/events/RequestServicesDescriptorsEvent";
import { classesReflection } from "@app/reflection";
import { ServiceRuntime } from "@app/runtime/ServiceRuntime";

const commandBus = new CommandBus();
const eventBus = new EventBus();
const queryBus = new QueryBus();

const di = new AeroDI(classesReflection);

di.registerInstance(commandBus);
di.registerInstance(eventBus);
di.registerInstance(queryBus);

di.registerValueForClassAndParameterName(ServiceRuntime, "timeouts", {
  acknowledgeTimeout: 100,
  executeTimeout: 100,
});

void (async () => {
  const runtime = await di.getByClass(ServiceRuntime);
  await runtime.start();
  // const result = await runtime.executeCommand(
  //   new RequestServiceDescriptorCommand()
  // );
  // logger.debug("test", JSON.stringify(result, undefined, 4));
  await runtime.publishEvent(new RequestServiceDescriptorsEvent());
})();
