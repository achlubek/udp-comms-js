import {
  ServiceStartedEventPayload,
  serviceStartedEventName,
} from "@app/events/ServiceStartedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";

export class ServiceStartedEventHandler
  implements EventHandlerInterface<ServiceStartedEventPayload>
{
  public constructor(private readonly logger: LoggerInterface) {}

  public getHandledEventName(): string {
    return serviceStartedEventName;
  }

  public handle(payload: ServiceStartedEventPayload): void {
    this.logger.info(
      this,
      `New service started: ${payload.name} at hostname ${payload.hostname}`
    );
  }
}
