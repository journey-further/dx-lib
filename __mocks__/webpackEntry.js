import { elementReady, elementRemoved, elementUpdated, emitEvent, useSPA } from "../dist";
import { runScript, reset, STATE } from "./common";

import style from "./style.scss";

const jfExperiment = {
  ticketId: "RAB_011160",
  variant: "A",
};

export const insertBlock = () => {
  const hasProducts = !!document.querySelector(".ProductListingSummaryInformation__Container");
  if (!hasProducts) runScript("A");
};

export const applyChanges = async () => {
  try {
    console.log("applying");
    reset();

    STATE.updated = elementUpdated("h1.CategoryHeading__SearchText span", insertBlock, "RAB_011160--updated", {
      characterData: true,
    });
    STATE.ready = elementReady(".ProductListingSummaryInformation__Container", reset, "RAB_011160--ready");
    STATE.removed = elementRemoved(".ProductListingSummaryInformation__Container", insertBlock, "RAB_011160--removed");

    // insert on page load
    if (!!document.querySelector(".NoResultsText")) insertBlock();
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
};

(async () => {
  try {
    const Test = useSPA("RAB_011160");

    Test.init({
      apply: applyChanges,
      style: style,
      reset: reset,
      location: ["/search", "/home"],
    });

    // waitForSearchContainerChange();

    // Reset the test
    // Test.reset();

    // Remove the test completely
    // Test.destroy();

    // Store the test for later use
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
})();
