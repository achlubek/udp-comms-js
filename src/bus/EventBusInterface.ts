import { EventHandler } from "@app/bus/EventBus";

export interface EventBusInterface {
  subscribe(eventName: string, handler: EventHandler): string;

  getHandledEvents(): string[];

  unsubscribeBySubscriptionId(id: string): void;

  unsubscribeByEventName(eventName: string): void;

  publish(eventName: string, payload: unknown): void;
}
