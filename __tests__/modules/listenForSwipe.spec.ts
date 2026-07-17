import { listenForSwipe } from "../../src";

const LEFT_CALLBACK = vi.fn();
const RIGHT_CALLBACK = vi.fn();

//class mouseEvent extends MouseEvent {
//  mouseType: string;
//  clientX: number;
//  constructor(type, { mouseType = "", ...MouseEventInit } = {}) {
//    super(type, MouseEventInit);
//    this.mouseType = mouseType;
//    // continue with https://developer.mozilla.org/en-US/docs/Web/API/mouseEvent/mouseEvent#Arguments
//    Object.defineProperty(this, "clientX", {
//      writable: true,
//    });
//  }
//}

describe("listenForSwipe", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("will call the correct callback when the user swipes right with mouse events", () => {
    const element = document.createElement("div");
    const mouseDown = new MouseEvent("mousedown", { clientX: 50 });
    const mouseUp = new MouseEvent("mouseup", { clientX: 100 });

    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(mouseDown);
    element.dispatchEvent(mouseUp);
    expect(RIGHT_CALLBACK).toBeCalledTimes(1);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });

  it("will call the correct callback when the user swipes left with mouse events", () => {
    const element = document.createElement("div");
    const mouseDown = new MouseEvent("mousedown", { clientX: 100 });
    const mouseUp = new MouseEvent("mouseup", { clientX: 50 });
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(mouseDown);
    element.dispatchEvent(mouseUp);
    expect(LEFT_CALLBACK).toBeCalledTimes(1);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
  });

  it("will not fire a callback if the movement right is not over the 50px threshold with mouse events", () => {
    const element = document.createElement("div");
    const mouseDown = new MouseEvent("mousedown", { clientX: 100 });
    const mouseUp = new MouseEvent("mouseup", { clientX: 80 });
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(mouseDown);
    element.dispatchEvent(mouseUp);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });

  it("will not fire a callback if the movement left is not over the 50px threshold with mouse events", () => {
    const element = document.createElement("div");
    const mouseDown = new MouseEvent("mousedown", { clientX: 100 });
    const mouseUp = new MouseEvent("mouseup", { clientX: 80 });
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(mouseDown);
    element.dispatchEvent(mouseUp);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });

  it("will call the correct callback when the user swipes right with touch events", () => {
    const element = document.createElement("div");
    const touchStart = new TouchEvent("touchstart", { touches: [{ clientX: 50 } as Touch] });
    const touchMove = new TouchEvent("touchmove", { touches: [{ clientX: 150 } as Touch] });
    const touchEnd = new TouchEvent("touchend");
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchMove);
    element.dispatchEvent(touchEnd);
    expect(RIGHT_CALLBACK).toBeCalledTimes(1);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });

  it("will call the correct callback when the user swipes left with touch events", () => {
    const element = document.createElement("div");
    const touchStart = new TouchEvent("touchstart", { touches: [{ clientX: 150 } as Touch] });
    const touchMove = new TouchEvent("touchmove", { touches: [{ clientX: 50 } as Touch] });
    const touchEnd = new TouchEvent("touchend");
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchMove);
    element.dispatchEvent(touchEnd);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
    expect(LEFT_CALLBACK).toBeCalledTimes(1);
  });

  it("will not fire a callback if the movement right is not over the 50px threshold with touch events", () => {
    const element = document.createElement("div");
    const touchStart = new TouchEvent("touchstart", { touches: [{ clientX: 100 } as Touch] });
    const touchMove = new TouchEvent("touchmove", { touches: [{ clientX: 80 } as Touch] });
    const touchEnd = new TouchEvent("touchend");
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchMove);
    element.dispatchEvent(touchEnd);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });

  it("will not fire a callback if the movement left is not over the 50px threshold with touch events", () => {
    const element = document.createElement("div");
    const touchStart = new TouchEvent("touchstart", { touches: [{ clientX: 80 } as Touch] });
    const touchMove = new TouchEvent("touchmove", { touches: [{ clientX: 100 } as Touch] });
    const touchEnd = new TouchEvent("touchend");
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchMove);
    element.dispatchEvent(touchEnd);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });

  it("returns a destroy handle that removes all swipe listeners", () => {
    const element = document.createElement("div");
    const handle = listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    handle.destroy();
    element.dispatchEvent(new MouseEvent("mousedown", { clientX: 100 }));
    element.dispatchEvent(new MouseEvent("mouseup", { clientX: 200 }));
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
    expect(() => handle.destroy()).not.toThrow(); // idempotent
  });
});
