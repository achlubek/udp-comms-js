import { CommandInterface } from "@app/runtime/CommandInterface";

export const requestServiceDescriptorCommandName =
  "runtime/request-service-descriptor";

export class RequestServiceDescriptorCommand implements CommandInterface<void> {
  public readonly commandName: string = requestServiceDescriptorCommandName;
  public readonly commandPayload: undefined;
}
