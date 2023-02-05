import { CommandHandlerInterface } from "@app/commands/CommandHandlerInterface";
import {
  TestReversePayload,
  testReversePayloadCommandName,
} from "@app/commands/TestReversePayloadCommand";

export interface TestReverseResult {
  testValue: string;
}
export class TestReversePayloadCommandHandler
  implements CommandHandlerInterface<TestReversePayload, TestReverseResult>
{
  public handle(payload: TestReversePayload): TestReverseResult {
    const reversed = payload.testValue.split("").reverse().join("");
    return { testValue: reversed };
  }

  public getHandledCommandName(): string {
    return testReversePayloadCommandName;
  }
}
