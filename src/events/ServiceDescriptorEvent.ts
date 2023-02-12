export class ServiceDescriptorEvent {
  public constructor(
    public readonly name: string,
    public readonly commandHandlers: string[],
    public readonly queryHandlers: string[],
    public readonly eventHandlers: string[]
  ) {}
}
