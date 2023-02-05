import * as crypto from "crypto";

type EventHandler = (payload: unknown) => void;

class Subscription {
  public constructor(
    public readonly id: string,
    public readonly eventName: string,
    public readonly handler: EventHandler
  ) {}
}

export class EventBus {
  private subscriptions: Subscription[] = [];
  public subscribe(eventName: string, handler: EventHandler): string {
    const id = crypto.randomUUID();
    this.subscriptions.push(new Subscription(id, eventName, handler));
    return id;
  }

  public getHandledEvents(): string[] {
    return this.subscriptions.map((s) => s.eventName);
  }

  public unsubscribeBySubscriptionId(id: string): void {
    this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
  }

  public unsubscribeByEventName(eventName: string): void {
    this.subscriptions = this.subscriptions.filter(
      (s) => s.eventName !== eventName
    );
  }

  public publish(eventName: string, payload: unknown): void {
    this.subscriptions
      .filter((s) => s.eventName === eventName)
      .forEach((s) => s.handler(payload));
  }
}
