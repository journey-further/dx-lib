/**
 * Watch an element for user swipe gestures and fire the correct callback depending which direction the user swiped
 *
 * @param element The element we want to watch for swipes on
 * @param leftCallback The callback to execute when the user swipes left
 * @param rightCallback The callback to execute when the user swipes right
 */
export const listenForSwipe = (element, leftCallback, rightCallback) => {
    let touchStart;
    let initialTouch;
    let touchEnd;
    let touching = false;
    const resetTouch = () => {
        touchEnd = undefined;
        touching = false;
        initialTouch = undefined;
        touchStart = undefined;
    };
    const handleTouchMove = (e) => {
        if (e.touches.length < 1)
            return;
        touchEnd = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        const diff = initialTouch && touchEnd ? initialTouch - touchEnd : 0;
        // the user moved less that 50px so open nav or link
        if (diff <= -50) {
            rightCallback(e);
        }
        else if (diff >= 50) {
            leftCallback(e);
        }
        resetTouch();
        element.removeEventListener("touchmove", handleTouchMove);
        element.removeEventListener("touchend", handleTouchEnd);
    };
    const handleTouchStart = (e) => {
        var _a;
        if (touching)
            return;
        touching = true;
        initialTouch = (_a = e === null || e === void 0 ? void 0 : e.touches[0]) === null || _a === void 0 ? void 0 : _a.clientX;
        element.addEventListener("touchend", handleTouchEnd);
        element.addEventListener("touchmove", handleTouchMove);
    };
    const handleMouseUp = (event) => {
        if (touchStart - event.clientX <= -50) {
            rightCallback(event);
        }
        else if (touchStart - event.clientX >= 50) {
            leftCallback(event);
        }
        resetTouch();
        element.removeEventListener("mouseup", handleMouseUp);
    };
    const handleMouseDown = (event) => {
        if (touching)
            return;
        touching = true;
        touchStart = event.clientX;
        element.addEventListener("mouseup", handleMouseUp, { capture: true });
    };
    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("touchstart", handleTouchStart);
};
