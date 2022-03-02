module.exports = {
  testEnvironment: "jsdom",
  // testEnvironmentOptions: { "resources": "usable" },
  "transform": {
    "^.+\\.ts$": [
      "esbuild-jest",
      {
        sourcemap: true
      }
    ]
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
}
