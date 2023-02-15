import { ServiceStoppedEvent } from "@app/events/ServiceStoppedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";

export class ServiceStoppedEventHandler
  implements EventHandlerInterface<ServiceStoppedEvent>
{
  public constructor(private readonly logger: LoggerInterface) {}

  public handle(event: ServiceStoppedEvent): void {
    this.logger.info(
      this,
      `New service started: ${event.name} at hostname ${event.hostname}`
    );
  }
}
