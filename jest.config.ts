import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  roots: ["<rootDir>"],

  testEnvironment: "jsdom",
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
  testRegex: ["^.+\\.(test|spec)\\.ts$"],
  moduleDirectories: ["src", "node_modules"],
};
export default config;
