/**
 * Represents a function that accepts any number of arguments.
 *
 * This type defines a function signature where:
 *
 * - The function can take any number of arguments of any type.
 * - The function does not return a value (`void`).
 */
export type FunctionWithArgs = (...args: unknown[]) => void;

/**
 * Watches an element for swipe gestures and triggers the appropriate callback based on the swipe direction.
 *
 * This function listens for touch or mouse events on the specified element to detect left or right swipes. It triggers
 * a callback when a swipe exceeding a specified distance (default: 50px) is detected in either direction.
 *
 * @param {Element} element - The element to monitor for swipe gestures.
 * @param {FunctionWithArgs} leftCallback - The function to execute when a left swipe is detected.
 * @param {FunctionWithArgs} rightCallback - The function to execute when a right swipe is detected.
 * @param {number} [minDistance=50] - The minimum swipe distance, in pixels, required to trigger a callback. Default is
 *   `50`
 * @returns {{ destroy: () => void }} A handle whose `destroy` removes every listener this call attached
 */
export const listenForSwipe = (
  element: Element,
  leftCallback: FunctionWithArgs,
  rightCallback: FunctionWithArgs,
  minDistance = 50
): { destroy: () => void } => {
  let touchStart: number | undefined;
  let initialTouch: number | undefined;
  let touchEnd: number | undefined;
  let touching = false;

  const resetTouch = () => {
    touchEnd = undefined;
    touching = false;
    initialTouch = undefined;
    touchStart = undefined;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length < 1) return;
    touchEnd = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const diff = initialTouch && touchEnd ? initialTouch - touchEnd : 0;

    // the user moved less than specified minDistance (default: 50px) so open nav or link
    if (diff <= -minDistance) {
      rightCallback(e);
    } else if (diff >= minDistance) {
      leftCallback(e);
    }
    resetTouch();
    element.removeEventListener("touchmove", handleTouchMove);
    element.removeEventListener("touchend", handleTouchEnd);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (touching) return;
    touching = true;
    initialTouch = e?.touches[0]?.clientX;
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchmove", handleTouchMove);
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (touchStart - event.clientX <= -50) {
      rightCallback(event);
    } else if (touchStart - event.clientX >= 50) {
      leftCallback(event);
    }
    resetTouch();
    element.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (touching) return;
    touching = true;
    touchStart = event.clientX;
    element.addEventListener("mouseup", handleMouseUp, { capture: true });
  };

  element.addEventListener("mousedown", handleMouseDown);
  element.addEventListener("touchstart", handleTouchStart);

  // the standard teardown handle — without it these outer listeners were unremovable for the page's lifetime
  const destroy = () => {
    element.removeEventListener("mousedown", handleMouseDown);
    element.removeEventListener("touchstart", handleTouchStart);
    element.removeEventListener("touchmove", handleTouchMove);
    element.removeEventListener("touchend", handleTouchEnd);
    element.removeEventListener("mouseup", handleMouseUp, { capture: true });
    resetTouch();
  };
  return { destroy };
};
