import { CommandBus, EventBus, QueryBus } from "cqe-js";

import { RequestServiceDescriptorsEvent } from "@app/events/RequestServicesDescriptorsEvent";
import { ServiceDescriptorEvent } from "@app/events/ServiceDescriptorEvent";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";
import { ServiceRuntime } from "@app/runtime/ServiceRuntime";

export class RequestServiceDescriptorsEventHandler
  implements EventHandlerInterface<RequestServiceDescriptorsEvent>
{
  public constructor(
    private readonly runtime: ServiceRuntime,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus
  ) {}

  public async handle(): Promise<void> {
    await this.runtime.publishEvent(
      new ServiceDescriptorEvent(
        this.runtime.getName(),
        this.commandBus.getHandledCommands(),
        this.queryBus.getHandledQueries(),
        this.eventBus.getHandledEvents()
      )
    );
  }
}
