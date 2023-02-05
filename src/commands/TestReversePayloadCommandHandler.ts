import { CommandHandlerInterface } from "@app/commands/CommandHandlerInterface";
import { TestReversePayload } from "@app/commands/TestReversePayloadCommand";

export type TestReverseResult = { testValue: string };
export class TestReversePayloadCommandHandler
  implements CommandHandlerInterface<TestReversePayload, TestReverseResult>
{
  public handle(payload: TestReversePayload): TestReverseResult {
    const reversed = payload.testValue.split("").reverse().join("");
    return { testValue: reversed };
  }
}
