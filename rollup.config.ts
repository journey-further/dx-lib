// rollup.config.js
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default {
  input: "./src/index.ts",
  output: {
    dir: "dist",
    format: "es",
    exports: "named",
    preserveModules: true,
    preserveModulesRoot: "src",
  },
  plugins: [typescript(), json(), nodeResolve()],
};
