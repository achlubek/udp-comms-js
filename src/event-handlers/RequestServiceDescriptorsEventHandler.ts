import { CommandBusInterface } from "@app/bus/CommandBusInterface";
import { EventBusInterface } from "@app/bus/EventBusInterface";
import {
  RequestServiceDescriptorsEvent,
  requestServiceDescriptorsEventName,
} from "@app/events/RequestServicesDescriptorsEvent";
import { ServiceDescriptorEvent } from "@app/events/ServiceDescriptorEvent";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";
import { ServiceRuntimeInterface } from "@app/runtime/ServiceRuntimeInterface";

export class RequestServiceDescriptorsEventHandler
  implements EventHandlerInterface<RequestServiceDescriptorsEvent>
{
  public constructor(
    private readonly runtime: ServiceRuntimeInterface,
    private readonly commandBus: CommandBusInterface,
    private readonly eventBus: EventBusInterface
  ) {}

  public getHandledEventName(): string {
    return requestServiceDescriptorsEventName;
  }

  public async handle(): Promise<void> {
    await this.runtime.publishEvent(
      new ServiceDescriptorEvent({
        name: this.runtime.getName(),
        commandHandlers: this.commandBus.getHandledCommands(),
        eventHandlers: this.eventBus.getHandledEvents(),
      })
    );
  }
}
