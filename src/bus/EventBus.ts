import crypto from "crypto";

// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
type EventHandlerAnyType = (payload: Any) => void;

class Subscription {
  public constructor(
    public readonly id: string,
    public readonly eventName: string,
    public readonly handler: EventHandlerAnyType
  ) {}
}

export class EventBus {
  private subscriptions: Subscription[] = [];
  public subscribe(eventName: string, handler: EventHandlerAnyType): string {
    const id = crypto.randomUUID();
    this.subscriptions.push(new Subscription(id, eventName, handler));
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
  }

  public publish(eventName: string, payload: Any): void {
    this.subscriptions
      .filter((s) => s.eventName === eventName)
      .forEach((s) => s.handler(payload));
  }
}
