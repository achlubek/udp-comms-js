import { ServiceStartedEvent } from "@app/events/ServiceStartedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";

export class ServiceStartedEventHandler
  implements EventHandlerInterface<ServiceStartedEvent>
{
  public constructor(private readonly logger: LoggerInterface) {}

  public handle(event: ServiceStartedEvent): void {
    this.logger.info(
      this,
      `New service started: ${event.name} at hostname ${event.hostname}`
    );
  }
}
