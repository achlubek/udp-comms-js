import { CommandBus, EventBus, QueryBus } from "cqe-js";

import { QueryHandlerInterface } from "@app/runtime/QueryHandlerInterface";
import { ServiceRuntime } from "@app/runtime/ServiceRuntime";

export interface RequestServiceDescriptorQueryResult {
  name: string;
  commandHandlers: string[];
  queryHandlers: string[];
  eventHandlers: string[];
}

export class GetServiceDescriptorQueryHandler
  implements QueryHandlerInterface<void, RequestServiceDescriptorQueryResult>
{
  public constructor(
    private readonly runtime: ServiceRuntime,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus
  ) {}

  public handle(): RequestServiceDescriptorQueryResult {
    return {
      name: this.runtime.getName(),
      commandHandlers: this.commandBus.getHandledCommands(),
      queryHandlers: this.queryBus.getHandledQueries(),
      eventHandlers: this.eventBus.getHandledEvents(),
    };
  }
}
