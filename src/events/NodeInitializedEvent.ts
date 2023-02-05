import * as os from "os";

import { EventInterface } from "@app/events/EventInterface";

export const nodeInitializedEventName = "node-initialized";

export interface NodeInitializedEventPayload {
  name: string;
}

export class NodeInitializedEvent
  implements EventInterface<NodeInitializedEventPayload>
{
  public readonly name: string = nodeInitializedEventName;
  public readonly payload: NodeInitializedEventPayload;
  public constructor() {
    this.payload = { name: os.hostname() };
  }
}
