import * as os from "os";

import { EventInterface } from "@app/runtime/EventInterface";

export const serviceStoppedEventName = "runtime/service-stopped";

export interface ServiceStoppedEventPayload {
  name: string;
  hostname: string;
}

export class ServiceStoppedEvent
  implements EventInterface<ServiceStoppedEventPayload>
{
  public readonly eventName: string = serviceStoppedEventName;
  public readonly eventPayload: ServiceStoppedEventPayload;
  public constructor(name: string) {
    this.eventPayload = { name, hostname: os.hostname() };
  }
}
