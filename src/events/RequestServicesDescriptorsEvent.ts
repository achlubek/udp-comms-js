import { EventInterface } from "@app/runtime/EventInterface";

export const requestServiceDescriptorsEventName =
  "runtime/request-service-descriptors";

export class RequestServiceDescriptorsEvent implements EventInterface<void> {
  public readonly eventName: string = requestServiceDescriptorsEventName;
  public readonly eventPayload: undefined;
}
