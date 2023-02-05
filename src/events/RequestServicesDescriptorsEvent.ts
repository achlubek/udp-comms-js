import { EventInterface } from "@app/events/EventInterface";

export const requestServiceDescriptorsEventName = "request-service-descriptors";

export class RequestServiceDescriptorsEvent implements EventInterface<void> {
  public readonly name: string = requestServiceDescriptorsEventName;
  public readonly payload: undefined;
}
