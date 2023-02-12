import { ServiceStoppedEvent } from "@app/events/ServiceStoppedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";

export class ServiceStoppedEventHandler {
  public constructor(private readonly logger: LoggerInterface) {}

  public handle(event: ServiceStoppedEvent): void {
    this.logger.info(
      this,
      `New service started: ${event.name} at hostname ${event.hostname}`
    );
  }
}
