import { CommandBus, EventBus, QueryBus } from "aero-cqe";
import { AeroDI } from "aero-di";

import { RequestServiceDescriptorsEvent } from "@app/events/RequestServicesDescriptorsEvent";
import { classesReflection } from "@app/reflectionData";
import { ServiceRuntime, Timeouts } from "@app/runtime/ServiceRuntime";

const commandBus = new CommandBus();
const eventBus = new EventBus();
const queryBus = new QueryBus();

const di = new AeroDI(classesReflection);

di.registerInstance(commandBus);
di.registerInstance(eventBus);
di.registerInstance(queryBus);

export class TimeoutsClass implements Timeouts {
  public constructor(
    public acknowledgeTimeout: number,
    public executeTimeout: number
  ) {}
}

di.parameterResolver.registerValueForClassAndParameterName(
  ServiceRuntime,
  "timeouts",
  new TimeoutsClass(100, 100)
);

void (async () => {
  const runtime = await di.getByClass(ServiceRuntime);
  await runtime.start();
  // const result = await runtime.executeCommand(
  //   new RequestServiceDescriptorCommand()
  // );
  // logger.debug("test", JSON.stringify(result, undefined, 4));
  await runtime.publishEvent(new RequestServiceDescriptorsEvent());
})();
