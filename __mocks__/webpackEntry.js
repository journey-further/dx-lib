import { elementReady, elementUpdated, emitEvent, useSPA } from "../dist";
// import { runScript } from "./common";

// import style from "./styles/variantA.scss";

const runScript = () => {
  console.log("RUNNING SCRIPT!");
};

const STATE = {
  mensApiURL:
    "https://www.russellandbromley.co.uk/ccstore/v1/assembler/pages/Default/services/guidedsearch/ccstoreui/v1/search?N=2053886397&Ns=&No=0&Nr=AND%28product.active%3A1%2CNOT%28record.type%3AStore%29%29&Nrpp=2&Ntt=&Nf=",
  womensApiURL:
    "https://www.russellandbromley.co.uk/ccstore/v1/assembler/pages/Default/services/guidedsearch/ccstoreui/v1/search?N=2148360829&Ns=&No=0&Nr=AND%28product.active%3A1%2CNOT%28record.type%3AStore%29%29&Nrpp=2&Ntt=&Nf=",
  // observer: useMutationObserver("RAB_011160---search-container"),
};
const jfExperiment = {
  ticketId: "RAB_011160",
  variant: "A",
};

// const waitForSearchContainerChange = () => {
//   if (!!STATE.observer.details.isObserving) STATE.observer.disconnect();
//   console.log("watching for changes");
//   /** @type {Element} The target element to listen for changes to */
//   const target = document.querySelector(".CategoryHeading");
//   if (!!!target) {
//     console.log("no watch target");
//     return;
//   }

//   /** @type {MutationObserverInit} The MutationObserver options */
//   const config = { childList: true, subtree: true };

//   /** @type {MutationCallback} The callback */
//   const callback = (mutations) => {
//     mutations.forEach((mutation) => {
//       // Add your conditions to check the mutation
//       // console.log("mutation: ", mutation);
//       // if (mutation.addedNodes.length == 0) return;
//       console.log(mutation);
//       applyChanges();
//     });
//   };

//   /** Trigger the observer */
//   STATE.observer.observe(target, config, callback);
// };

const applyChanges = async () => {
  try {
    document.querySelectorAll(".RAB_011160---trending-product-container").forEach((element) => element?.remove());

    elementUpdated(
      "h1.CategoryHeading__SearchText span",
      () => {
        runScript(jfExperiment, STATE);
      },
      "RAB_011160--updated"
    );

    if (document.querySelector(".ProductListingSummaryInformation__Container")) {
      // waitForSearchContainerChange();

      console.log("Search product found!!");
      reset();

      return;
    }

    await runScript(jfExperiment, STATE);
  } catch (e) {
    emitEvent("error", jfExperiment, e);
  }
};

const reset = () => {
  console.log("RESEEEET");
  document.querySelector(".RAB_011160---trending-product-container")?.remove();
};

(async () => {
  try {
    // const domLoaded = await waitForElement(".CategoryHeading");

    // if (!domLoaded) {
    //   console.log("Search container not loaded!!");

    //   return;
    // }

    const Test = useSPA("RAB_011160");

    Test.init({
      apply: applyChanges,
      // style: style,
      reset: reset,
      location: /search/,
    });

    STATE.Test = Test;

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
