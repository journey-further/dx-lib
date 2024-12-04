// eslint-ignore-next-line
import { useMutationObserver, useSPA } from "../dist";

const STATE = {
  test: useSPA("123"),
  observer: useMutationObserver("xyz"),
};

const applyChanges = () => {
  console.log("APPLYING!");
  if (!!document.querySelector(".test--element")) {
    console.log("already inserted");
    return;
  }
  document.querySelector("main").insertAdjacentHTML("afterbegin", `<div class="test--element"></div>`);
};

STATE.test.init({
  apply: applyChanges,
  style: ".test--element { background:red;height:100px;width:100vw;}",
  pageMatch: /ghd-duet/g,
  watchForRemoval: ".test--element",
  removeOnPageChange: ".test--element",
});

STATE.observer.observe();
