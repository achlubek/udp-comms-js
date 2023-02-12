import * as os from "os";

export class ServiceStartedEvent {
  public readonly name: string;
  public readonly hostname: string;
  public constructor(name: string) {
    this.name = name;
    this.hostname = os.hostname();
  }
}
