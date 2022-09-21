import type { Config } from "@jest/types";
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
};
export default config;
