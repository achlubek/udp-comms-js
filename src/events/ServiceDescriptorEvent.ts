import { AbstractBaseEvent } from "aero-cqe";

export class ServiceDescriptorEvent extends AbstractBaseEvent {
  public constructor(
    public readonly name: string,
    public readonly commandHandlers: string[],
    public readonly queryHandlers: string[],
    public readonly eventHandlers: string[]
  ) {
    super();
  }
}
