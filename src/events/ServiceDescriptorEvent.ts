import { EventInterface } from "@app/events/EventInterface";

export const nodeInitializedEventName = "service-descriptor";

export interface ServicesDescriptorEventPayload {
  commandHandlers: string[];
  eventHandlers: string[];
}

export class ServiceDescriptorEvent
  implements EventInterface<ServicesDescriptorEventPayload>
{
  public readonly name: string = nodeInitializedEventName;

  public constructor(public readonly payload: ServicesDescriptorEventPayload) {}
}
