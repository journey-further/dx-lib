import { RBTest } from "../dist";

const Test = new RBTest("test", {
  apply: () => {
    console.log("apply!");
  },
  pageMatch: "test",
});
Test.init();
