import { EventHandlerInterface } from "@app/events/EventHandlerInterface";
import {
  NodeInitializedEventPayload,
  nodeInitializedEventName,
} from "@app/events/NodeInitializedEvent";
import { LoggerInterface } from "@app/logger/LoggerInterface";

export class NodeInitializedEventHandler
  implements EventHandlerInterface<NodeInitializedEventPayload>
{
  public constructor(private readonly logger: LoggerInterface) {}

  public getHandledEventName(): string {
    return nodeInitializedEventName;
  }

  public handle(payload: NodeInitializedEventPayload): void {
    this.logger.info(this, `New node initialized: ${payload.name}`);
  }
}
