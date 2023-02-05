import { EventHandlerInterface } from "@app/events/EventHandlerInterface";
import {
  NodeInitializedEventPayload,
  nodeInitializedEventName,
} from "@app/events/NodeInitializedEvent";
import { Logger } from "@app/logger/Logger";

export class NodeInitializedEventHandler
  implements EventHandlerInterface<NodeInitializedEventPayload>
{
  public constructor(private readonly logger: Logger) {}

  public getHandledEventName(): string {
    return nodeInitializedEventName;
  }

  public handle(payload: NodeInitializedEventPayload): void {
    this.logger.info(this, `New node initialized: ${payload.name}`);
  }
}
