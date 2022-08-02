import type { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  roots: ["<rootDir>"],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: ["^.+\\.(test|spec)\\.ts$"],
  moduleDirectories: ["src", "node_modules"],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths),
  },
};
export default config;
