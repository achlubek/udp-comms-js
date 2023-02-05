import { CommandBusInterface } from "@app/bus/CommandBusInterface";
import { EventBusInterface } from "@app/bus/EventBusInterface";
import { requestServiceDescriptorCommandName } from "@app/commands/RequestServiceDescriptorCommand";
import { CommandHandlerInterface } from "@app/runtime/CommandHandlerInterface";
import { ServiceRuntimeInterface } from "@app/runtime/ServiceRuntimeInterface";

export interface RequestServiceDescriptorCommandResult {
  name: string;
  commandHandlers: string[];
  eventHandlers: string[];
}

export class RequestServiceDescriptorCommandHandler
  implements
    CommandHandlerInterface<void, RequestServiceDescriptorCommandResult>
{
  public constructor(
    private readonly runtime: ServiceRuntimeInterface,
    private readonly commandBus: CommandBusInterface,
    private readonly eventBus: EventBusInterface
  ) {}

  public getHandledCommandName(): string {
    return requestServiceDescriptorCommandName;
  }

  public handle(): RequestServiceDescriptorCommandResult {
    return {
      name: this.runtime.getName(),
      commandHandlers: this.commandBus.getHandledCommands(),
      eventHandlers: this.eventBus.getHandledEvents(),
    };
  }
}
