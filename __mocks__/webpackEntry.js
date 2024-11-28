import { SPA } from "../dist";

const STATE = {
  test: new SPA("GHD_123456", {
    apply: applyChanges,
    style: ".test--element { background:red;height:100px;width:100vw;}",
    pageMatch: /ghd-duet/g,
    watchForRemoval: ".test--element",
    removeOnPageChange: ".test--element",
  }),
};

const applyChanges = () => {
  console.log("APPLYING!");
  if (!!document.querySelector(".test--element")) {
    console.log("already inserted");
    return;
  }
  document.querySelector("main").insertAdjacentHTML("afterbegin", `<div class="test--element"></div>`);
};

STATE.test.init();
STATE.test.details();
