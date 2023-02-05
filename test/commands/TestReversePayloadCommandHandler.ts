import {
  TestReversePayload,
  testReversePayloadCommandName,
} from "@test/commands/TestReversePayloadCommand";

import { CommandHandlerInterface } from "@app/runtime/CommandHandlerInterface";

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
