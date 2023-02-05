import { ServiceRuntimeInterface } from "@app/ServiceRuntimeInterface";
import { CommandBusInterface } from "@app/bus/CommandBusInterface";
import { EventBusInterface } from "@app/bus/EventBusInterface";
import { EventHandlerInterface } from "@app/events/EventHandlerInterface";
import {
  RequestServiceDescriptorsEvent,
  requestServiceDescriptorsEventName,
} from "@app/events/RequestServicesDescriptorsEvent";
import { ServiceDescriptorEvent } from "@app/events/ServiceDescriptorEvent";

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
        commandHandlers: this.commandBus.getHandledCommands(),
        eventHandlers: this.eventBus.getHandledEvents(),
      })
    );
  }
}
