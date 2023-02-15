import { AbstractBaseEvent } from "aero-cqe";
import * as os from "os";

export class ServiceStartedEvent extends AbstractBaseEvent {
  public readonly name: string;
  public readonly hostname: string;
  public constructor(name: string) {
    super();
    this.name = name;
    this.hostname = os.hostname();
  }
}
