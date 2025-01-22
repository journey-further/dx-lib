// eslint-ignore-next-line
import { elementReady, elementRemoved, elementUpdated, useMutationObserver } from "../dist";

const STATE = {
  observer: useMutationObserver("obs"),
  observer2: useMutationObserver("obs2"),
};

// STATE.test.init({
//   apply: applyChanges,
//   style: ".test--element { background:red;height:100px;width:100vw;}",
//   pageMatch: /ghd-duet/g,
//   watchForRemoval: ".test--element",
//   removeOnPageChange: ".test--element",
// });

// STATE.observer.observe();

const timeout = (s = 1) => {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
};

const init = async () => {
  // await timeout(2);

  // console.clear();

  const r = elementReady(
    ".abc",
    () => {
      console.log("READY!");
    },
    "ready"
  );

  // elementRemoved(
  //   ".abc",
  //   () => {
  //     console.log("REMOVED!");
  //   },
  //   "remove"
  // );

  // const u = elementUpdated(
  //   ".abc",
  //   (el) => {
  //     console.log("updated!!", el);
  //   },
  //   "update",
  //   {
  //     attributes: true,
  //     textContent: true,
  //     attributeFilter: ["class"],
  //   }
  // );

  // add elem

  console.log("add a new element");
  const element = document.createElement("div");
  // element.ready = ["abc"];
  element.classList.add("abc");
  element.textContent = "hello";
  // element.insertAdjacentHTML("beforeend", `<div class="abc"></div>`);
  // console.log(element);
  document.querySelector("body").insertAdjacentElement("beforeend", element);

  const targets = document.querySelectorAll("nav a");
  STATE.observer.observe(targets, { childList: false, attributes: true, attributeFilter: ["class"] }, (mutations) => {
    console.log("MUTATION");
    console.log(mutations);
  });

  await timeout(1);

  document.querySelectorAll("nav a")[2]?.classList.add("test");
  document.querySelectorAll("nav a")[1]?.classList.add("test2");

  // console.clear();
  console.log("updating element");
  document.querySelector(".abc")?.classList.add("test");
  document.querySelector(".abc")?.setAttribute("data-test", true);
  document.querySelector(".abc").textContent = "yes";

  // r.stop();

  await timeout(0.5);
  document.querySelector(".abc").insertAdjacentHTML("beforeend", "<span>test</span>");

  await timeout(0.5);
  document.querySelector(".abc")?.remove();

  console.log("add another element");
  document.querySelector("body").insertAdjacentHTML("beforeend", `<div class="abc"></div>`);

  await timeout(1);

  r.pause();

  STATE.observer.disconnect();

  // u.destroy();

  // r.init();

  await timeout(1);

  r.init();

  // u.init();
  // console.log("add another element again");
  // document.querySelector("body").insertAdjacentHTML("beforeend", `<div class="abc"></div>`);

  // await timeout(1);

  // r.destroy();

  // await timeout(1);

  // console.log("adding final element");
  // document.querySelector("body").insertAdjacentHTML("beforeend", `<div class="abc"></div>`);
};

init();
