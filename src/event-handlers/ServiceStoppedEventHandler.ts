import {
  ServiceStoppedEventPayload,
  serviceStoppedEventName,
} from "@app/events/ServiceStoppedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";
import { EventHandlerInterface } from "@app/runtime/EventHandlerInterface";

export class ServiceStoppedEventHandler
  implements EventHandlerInterface<ServiceStoppedEventPayload>
{
  public constructor(private readonly logger: LoggerInterface) {}

  public getHandledEventName(): string {
    return serviceStoppedEventName;
  }

  public handle(payload: ServiceStoppedEventPayload): void {
    this.logger.info(
      this,
      `New service started: ${payload.name} at hostname ${payload.hostname}`
    );
  }
}
