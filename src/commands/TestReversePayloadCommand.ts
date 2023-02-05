import { CommandInterface } from "@app/commands/CommandInterface";

export interface TestReversePayload {
  testValue: string;
}
export const testReversePayloadCommandName = "get-machine-name";
export class TestReversePayloadCommand
  implements CommandInterface<TestReversePayload>
{
  public readonly name = testReversePayloadCommandName;
  public readonly payload: TestReversePayload;

  public constructor(value: string) {
    this.payload = { testValue: value };
  }
}
