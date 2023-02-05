import { EventInterface } from "@app/runtime/EventInterface";

export const nodeInitializedEventName = "runtime/service-descriptor";

export interface ServiceDescriptorEventPayload {
  name: string;
  commandHandlers: string[];
  eventHandlers: string[];
}

export class ServiceDescriptorEvent
  implements EventInterface<ServiceDescriptorEventPayload>
{
  public readonly eventName: string = nodeInitializedEventName;

  public constructor(
    public readonly eventPayload: ServiceDescriptorEventPayload
  ) {}
}
