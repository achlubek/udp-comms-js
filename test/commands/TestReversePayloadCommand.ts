import { CommandInterface } from "@app/runtime/CommandInterface";

export interface TestReversePayload {
  testValue: string;
}
export const testReversePayloadCommandName = "get-machine-name";
export class TestReversePayloadCommand
  implements CommandInterface<TestReversePayload>
{
  public readonly commandName = testReversePayloadCommandName;
  public readonly commandPayload: TestReversePayload;

  public constructor(value: string) {
    this.commandPayload = { testValue: value };
  }
}
