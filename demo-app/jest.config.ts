import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  runner: "groups",
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
  setupFiles: ["dotenv/config"],
};
export default config;
