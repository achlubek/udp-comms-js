import { Runtime } from "@app/Runtime";
import { CommandBus } from "@app/bus/CommandBus";
import { EventBus } from "@app/bus/EventBus";
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
    private readonly runtime: Runtime,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
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
