import { assert } from "chai";

import { EventBus } from "@app/bus/EventBus";

import sinon = require("sinon");

const isUUID = (str: string) => {
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(str);
};
describe("Event unit", () => {
  it("Subscribe", () => {
    const eventBus = new EventBus();
    const eventName = "test-event";
    const subscriptionId = eventBus.subscribe(eventName, sinon.fake());
    assert.isTrue(isUUID(subscriptionId));
    assert.lengthOf(eventBus.getHandledEvents(), 1);
    assert.include(eventBus.getHandledEvents(), eventName);
  });

  it("Unsubscribe by event name", () => {
    const eventBus = new EventBus();
    const eventName1 = "test-event1";
    const eventName2 = "test-event2";

    eventBus.subscribe(eventName1, sinon.fake());
    eventBus.subscribe(eventName2, sinon.fake());

    assert.lengthOf(eventBus.getHandledEvents(), 2);
    assert.include(eventBus.getHandledEvents(), eventName1);
    assert.include(eventBus.getHandledEvents(), eventName2);

    eventBus.unsubscribeByEventName(eventName1);

    assert.lengthOf(eventBus.getHandledEvents(), 1);
    assert.include(eventBus.getHandledEvents(), eventName2);

    eventBus.unsubscribeByEventName(eventName2);

    assert.lengthOf(eventBus.getHandledEvents(), 0);
  });

  it("Unsubscribe by subscription id", () => {
    const eventBus = new EventBus();
    const eventName1 = "test-event1";
    const eventName2 = "test-event2";

    const subscriptionId1 = eventBus.subscribe(eventName1, sinon.fake());
    const subscriptionId2 = eventBus.subscribe(eventName2, sinon.fake());

    assert.isTrue(isUUID(subscriptionId1));
    assert.isTrue(isUUID(subscriptionId2));

    assert.lengthOf(eventBus.getHandledEvents(), 2);
    assert.include(eventBus.getHandledEvents(), eventName1);
    assert.include(eventBus.getHandledEvents(), eventName2);

    eventBus.unsubscribeBySubscriptionId(subscriptionId1);

    assert.lengthOf(eventBus.getHandledEvents(), 1);
    assert.include(eventBus.getHandledEvents(), eventName2);

    eventBus.unsubscribeBySubscriptionId(subscriptionId2);

    assert.lengthOf(eventBus.getHandledEvents(), 0);
  });

  it("List handled events", () => {
    const eventBus = new EventBus();
    const eventName1 = "test-event1";
    const eventName2 = "test-event2";

    eventBus.subscribe(eventName1, sinon.fake());
    eventBus.subscribe(eventName2, sinon.fake());

    assert.lengthOf(eventBus.getHandledEvents(), 2);
    assert.include(eventBus.getHandledEvents(), eventName1);
    assert.include(eventBus.getHandledEvents(), eventName2);
  });

  it("Publish event", () => {
    const eventBus = new EventBus();
    const eventName = "test-event1";

    const handler = sinon.fake();

    eventBus.subscribe(eventName, handler);

    const eventPayload = "event-payload";
    eventBus.publish(eventName, eventPayload);

    assert.isTrue(handler.calledOnceWithExactly(eventPayload));
  });
});
