import { AbstractBaseEvent } from "aero-cqe";

export interface EventHandlerInterface<Event extends AbstractBaseEvent> {
  handle(event: Event): void;
}
