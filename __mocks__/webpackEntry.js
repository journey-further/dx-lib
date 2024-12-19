// eslint-ignore-next-line
import { elementReady, useMutationObserver, useSPA } from "../dist";

const STATE = {
  test: useSPA("test"),
  observer: useMutationObserver("observer--init"),
};

const applyChanges = () => {
  console.log("APPLYING!");
  if (!!document.querySelector(".test--element")) {
    console.log("already inserted");
    return;
  }
  document.querySelector("main").insertAdjacentHTML("afterbegin", `<div class="test--element"></div>`);
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
  await timeout(3);

  console.clear();

  const r = elementReady(
    ".abc",
    () => {
      console.log("READY!");
    },
    "abc"
  );

  // elementReady(
  //   ".abcd",
  //   () => {
  //     console.log("READY!");
  //   },
  //   "abcd"
  // );

  // add elem
  console.log("add a new element");
  const element = document.createElement("div");
  // element.ready = ["abc"];
  element.classList.add("abc");
  console.log(element);
  document.querySelector("body").insertAdjacentElement("beforeend", element);

  await timeout(1);

  r.stop();

  await timeout(1);

  console.log("add another element");
  document.querySelector("body").insertAdjacentHTML("beforeend", `<div class="abc"></div>`);

  await timeout(3);

  r.init();

  await timeout(1);
  // console.log("add another element again");
  // document.querySelector("body").insertAdjacentHTML("beforeend", `<div class="abc"></div>`);

  // await timeout(1);

  // r.destroy();

  // await timeout(1);

  // console.log("adding final element");
  // document.querySelector("body").insertAdjacentHTML("beforeend", `<div class="abc"></div>`);
};

init();
// STATE.test.init({
//   apply: applyChanges,
//   pageMatch: {
//     match: /duet/,
//     type: "pathname",
//     condition: () => !!document.querySelector("app-ghd-breadcrumb"),
//     timeout: 1000,
//   },
//   alwaysReset: true,
// });
