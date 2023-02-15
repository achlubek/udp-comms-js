import { CommandBus, EventBus, QueryBus } from "aero-cqe";
import { ExtractQueryReturnType } from "aero-cqe/dist/bus/QueryBus";

import {
  GetServiceDescriptorQuery,
  RequestServiceDescriptorQueryResult,
} from "@app/queries/GetServiceDescriptorQuery";
import { QueryHandlerInterface } from "@app/runtime/QueryHandlerInterface";
import { ServiceRuntime } from "@app/runtime/ServiceRuntime";

export class GetServiceDescriptorQueryHandler
  implements
    QueryHandlerInterface<
      GetServiceDescriptorQuery,
      ExtractQueryReturnType<GetServiceDescriptorQuery>
    >
{
  public constructor(
    private readonly runtime: ServiceRuntime,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus
  ) {}

  public handle(
    _: GetServiceDescriptorQuery
  ): RequestServiceDescriptorQueryResult {
    return {
      name: this.runtime.getName(),
      commandHandlers: this.commandBus.getHandledCommands(),
      queryHandlers: this.queryBus.getHandledQueries(),
      eventHandlers: this.eventBus.getHandledEvents(),
    };
  }
}
