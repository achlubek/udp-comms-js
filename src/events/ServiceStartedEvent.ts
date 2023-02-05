import * as os from "os";

import { EventInterface } from "@app/runtime/EventInterface";

export const serviceStartedEventName = "runtime/service-started";

export interface ServiceStartedEventPayload {
  name: string;
  hostname: string;
}

export class ServiceStartedEvent
  implements EventInterface<ServiceStartedEventPayload>
{
  public readonly eventName: string = serviceStartedEventName;
  public readonly eventPayload: ServiceStartedEventPayload;
  public constructor(name: string) {
    this.eventPayload = { name, hostname: os.hostname() };
  }
}
