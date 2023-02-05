import { assert } from "chai";

import {
  CommandBus,
  CommandHandlerAlreadyRegisteredException,
  CommandHandlerNotRegisteredException,
} from "@app/bus/CommandBus";

import sinon = require("sinon");

describe("CommandBus unit", () => {
  it("Register a handler", () => {
    const commandBus = new CommandBus();
    const commandName = "test-command";
    commandBus.register(commandName, sinon.fake());
    assert.isTrue(commandBus.hasHandler(commandName));
  });

  it("Unregister a handler", () => {
    const commandBus = new CommandBus();
    const commandName = "test-command";
    commandBus.register(commandName, sinon.fake());
    assert.isTrue(commandBus.hasHandler(commandName));
    commandBus.unregister(commandName);
    assert.isFalse(commandBus.hasHandler(commandName));
  });

  it("List handled commands", () => {
    const commandBus = new CommandBus();
    const commandName1 = "test-command1";
    const commandName2 = "test-command2";
    commandBus.register(commandName1, sinon.fake());
    commandBus.register(commandName2, sinon.fake());
    assert.deepEqual(commandBus.getHandledCommands(), [
      commandName1,
      commandName2,
    ]);
  });

  it("Execute a command", () => {
    const commandBus = new CommandBus();
    const commandName = "test-command";
    const returnValue = "return-value";
    const handler = sinon.fake.returns(returnValue);
    commandBus.register(commandName, handler);
    const commandPayload = "command-payload";
    const result = commandBus.execute(commandName, commandPayload);
    assert.strictEqual(result, returnValue);
    assert.isTrue(handler.calledOnceWithExactly(commandPayload));
  });

  it("Throws when executing a command without corresponding handler", () => {
    const commandBus = new CommandBus();
    const commandName = "test-command";
    const commandPayload = "command-payload";
    assert.throw(
      () => commandBus.execute(commandName, commandPayload),
      CommandHandlerNotRegisteredException,
      "Handler not registered"
    );
  });

  it("Throws when registering a duplicate handler", () => {
    const commandBus = new CommandBus();
    const commandName = "test-command";
    commandBus.register(commandName, sinon.fake());
    assert.throw(
      () => commandBus.register(commandName, sinon.fake()),
      CommandHandlerAlreadyRegisteredException,
      "Handler already registered"
    );
  });
});
