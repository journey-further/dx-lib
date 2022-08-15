// rollup.config.js
import { nodeResolve } from "@rollup/plugin-node-resolve";
import ttypescript from "ttypescript";
import tsPlugin from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";

export default {
  input: ["./src/index.ts"],
  output: {
    dir: "dist",
    format: "es",
    exports: "named",
    preserveModules: true,
    preserveModulesRoot: "src",
  },
  plugins: [tsPlugin({ typescript: ttypescript }), json(), nodeResolve()],
};
