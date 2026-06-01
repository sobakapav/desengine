import { defineConfig, devices } from "playwright/test"
import {
  assertBrowserVerificationRunner,
  resolveBrowserVerificationRuntime,
} from "./test/helpers/browser-verification"

assertBrowserVerificationRunner(process.env)
const runtime = resolveBrowserVerificationRuntime()

export default defineConfig({
  testDir: "test/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "test-results/e2e",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: runtime.baseURL,
    channel: runtime.browserChannel,
    trace: "retain-on-failure",
  },
  webServer: runtime.mode === "externalServer"
    ? undefined
    : {
        command: `npm run dev -- --hostname 127.0.0.1 --port ${runtime.e2ePort}`,
        url: runtime.readinessURL,
        timeout: 180_000,
        reuseExistingServer: false,
        env: {
          ...process.env,
          ALLOWLIST_BASE_URL: runtime.fixtureAccessEnabled ? "http://127.0.0.1:9/" : "",
          ALLOWLIST_SALT: runtime.fixtureAccessEnabled ? runtime.fixtureAccessSalt : "",
          DESENGINE_ALLOWLIST_BASE_URL: "",
          DESENGINE_ALLOWLIST_SALT: "",
          LLM_PROVIDER: "deepseek",
          OPENAI_API_KEY: "",
          OPENAI_MODEL: "",
          OPENAI_BASE_URL: "",
          DEEPSEEK_API_KEY: "",
          DEEPSEEK_MODEL: "deepseek-test",
          DEEPSEEK_BASE_URL: "https://api.deepseek.example",
          GEMINI_API_KEY: "",
          GEMINI_MODEL: "",
          GEMINI_BASE_URL: "",
          ONBOARDING_REPO_URL: "",
          DESENGINE_ONBOARDING_REPO_URL: "",
        },
      },
})
