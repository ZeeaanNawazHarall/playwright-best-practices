# Configuration

> **Source**: All options in this section are sourced directly from the [official Playwright configuration reference](https://playwright.dev/docs/test-configuration) and the [reporters documentation](https://playwright.dev/docs/test-reporters). Where something goes beyond what Playwright documents, it is labeled as a **note** or **architectural decision**.

---

## The Config File

Playwright looks for a `playwright.config.ts` file at the project root. Always wrap your config with `defineConfig()` — it provides TypeScript autocompletion for every option.

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // top-level options go here
  testDir: './tests',
  reporter: 'html',

  use: {
    // browser and page options go here
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

**Important**: Top-level options (like `retries`, `timeout`, `workers`) control the test runner. The `use:` block controls the browser and page. Do not mix them — `retries` inside `use:` does nothing.

---

## Top-Level Options

### `testDir`

Directory where Playwright looks for test files, relative to the config file.

```typescript
testDir: './tests',
```

### `fullyParallel`

When `true`, all tests in all files run in parallel. When `false`, tests within a single file run serially while files run in parallel.

```typescript
fullyParallel: true,
```

Playwright's default is `false`. Setting it to `true` is the recommended approach for most suites because it uses workers more efficiently. Requires tests to be independent — see [docs/08-flaky-tests](../08-flaky-tests/README.md) for isolation patterns.

### `forbidOnly`

Fails the run if any `test.only()` was accidentally committed to CI.

```typescript
forbidOnly: !!process.env.CI,
```

`test.only()` is useful locally for debugging a single test. `forbidOnly` prevents that from silently skipping the rest of the suite on CI.

### `retries`

Maximum number of retry attempts for a failing test.

```typescript
retries: process.env.CI ? 2 : 0,
```

`0` locally keeps feedback fast — you want to see the failure immediately, not wait for two retries. `2` on CI adds resilience against network flakiness and timing issues specific to CI environments. Retries are not a substitute for fixing a flaky test — see [docs/08-flaky-tests](../08-flaky-tests/README.md).

### `workers`

Maximum number of parallel worker processes.

```typescript
workers: process.env.CI ? 1 : undefined,  // undefined = Playwright decides locally
```

`undefined` lets Playwright choose based on available CPU cores. On CI, setting `1` serializes execution — useful when CI machines have limited resources or when tests share a single test account that cannot handle concurrent sessions. Accepts a percentage string like `'50%'`.

### `timeout`

Maximum time a single test can run, in milliseconds. Default is `30000` (30 seconds).

```typescript
timeout: 60000, // 60 seconds
```

Override per test with `test.setTimeout(ms)` or per fixture with `testInfo.setTimeout(ms)`.

### `outputDir`

Where Playwright writes test artifacts (screenshots, videos, traces).

```typescript
outputDir: 'test-results/',
```

Default is `test-results`. Add it to `.gitignore`.

### `globalSetup` and `globalTeardown`

Run a file once before all tests start and once after all tests finish. Not the same as fixtures — these run outside any test context.

```typescript
globalSetup: require.resolve('./global-setup'),
globalTeardown: require.resolve('./global-teardown'),
```

Common uses: seeding a test database, starting a mock server, cleaning up external resources.

### `testMatch` and `testIgnore`

Control which files Playwright treats as test files.

```typescript
// Default — matches .spec.ts, .test.ts, etc.
testMatch: '**/*.{spec,test}.{ts,js}',

// Exclude a folder
testIgnore: '**/utils/**',
```

---

## The `use:` Block

Settings in `use:` apply to every test in every project unless overridden at the project level.

### `baseURL`

Sets the base URL for `page.goto('/')` calls. With `baseURL` set, relative paths work:

```typescript
use: {
  baseURL: 'https://www.example.com',
},
```

```typescript
// In a test — goes to https://www.example.com/login
await page.goto('/login');
```

### `trace`

Controls when Playwright records a trace. Traces contain a full timeline of every action, screenshot, network request, and console message — essential for debugging CI failures.

| Value | When trace is recorded |
|-------|----------------------|
| `'off'` | Never |
| `'on'` | Every test |
| `'on-first-retry'` | Only on the first retry of a failing test |
| `'on-all-retries'` | On every retry attempt |
| `'retain-on-failure'` | Every test, but deleted if the test passes |
| `'retain-on-first-failure'` | First run only, deleted if the test passes |

```typescript
use: {
  trace: 'on-first-retry',
},
```

`'on-first-retry'` is the recommended default — you get a trace when a test fails and retries, without generating trace files for every passing test.

Open a trace file with:

```bash
npx playwright show-trace path/to/trace.zip
```

### `screenshot`

```typescript
use: {
  screenshot: 'only-on-failure',
},
```

| Value | When screenshot is taken |
|-------|------------------------|
| `'off'` | Never |
| `'on'` | Every test |
| `'only-on-failure'` | Only when the test fails |

### `video`

```typescript
use: {
  video: 'retain-on-failure',
},
```

| Value | When video is recorded |
|-------|----------------------|
| `'off'` | Never |
| `'on'` | Every test |
| `'retain-on-failure'` | Every test, but deleted if the test passes |
| `'on-first-retry'` | Only on the first retry |

### `testIdAttribute`

Configures which HTML attribute `getByTestId()` targets. Default is `data-testid`.

```typescript
use: {
  testIdAttribute: 'data-test',
},
```

After this, `page.getByTestId('login-button')` matches `<button data-test="login-button">`. Set this once and use `getByTestId()` consistently rather than writing raw `locator('[data-test="..."]')` throughout your tests.

### `headless`

```typescript
use: {
  headless: true,  // default
},
```

`true` by default. Set to `false` for local debugging with a visible browser. Do not change this in the shared config — override it via CLI flag (`--headed`) or a local config file instead.

### `viewport`

```typescript
use: {
  viewport: { width: 1280, height: 720 },
},
```

Default is `{ width: 1280, height: 720 }`. Use `devices` presets for mobile emulation (see Projects below).

### `storageState`

Applies a saved auth session to every page. Typically set at the project level rather than globally so that unauthenticated tests can override it.

```typescript
use: {
  storageState: 'playwright/.auth/user.json',
},
```

See [docs/04-authentication](../04-authentication/README.md) for the full auth strategy.

### `ignoreHTTPSErrors`

```typescript
use: {
  ignoreHTTPSErrors: true,
},
```

Useful for local environments with self-signed certificates. Do not set this for tests running against production.

---

## Projects

Projects let you run the same tests across different browsers, viewports, or configurations. Each project can override anything in the top-level `use:` block.

### Multiple browsers

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

`devices['Desktop Chrome']` is a preset that sets `viewport`, `userAgent`, `deviceScaleFactor`, and other options to match that browser's typical configuration.

### Mobile emulation

```typescript
projects: [
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
],
```

### Setup project with dependencies

A setup project runs before others. Use it for authentication (see [docs/04-authentication](../04-authentication/README.md)) or any one-time preparation step.

```typescript
projects: [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],
  },
],
```

### Per-project timeouts

```typescript
projects: [
  {
    name: 'slow-browser',
    use: { ...devices['Desktop Firefox'] },
    timeout: 60000,  // Firefox needs more time
  },
],
```

---

## Reporters

### Built-in reporters

| Reporter | Best for |
|----------|----------|
| `list` | Local development — one line per test (default locally) |
| `dot` | CI — minimal output, one character per test (default on CI) |
| `line` | A compromise — single line updated in place |
| `html` | After a run — self-contained HTML report with traces, screenshots |
| `json` | Machine-readable output for custom tooling |
| `junit` | CI systems that parse JUnit XML (Jenkins, Azure DevOps) |
| `github` | GitHub Actions — inline failure annotations on the PR diff |
| `blob` | Merging reports from sharded CI runs |

### Configuring reporters

```typescript
reporter: 'html',
```

### Multiple reporters simultaneously

```typescript
reporter: [
  ['html', { open: 'never' }],
  ['list'],
  ['json', { outputFile: 'test-results.json' }],
],
```

When using multiple reporters, use the array of arrays format. Each inner array is `[reporterName, optionsObject]`.

### CI vs local

```typescript
reporter: process.env.CI ? 'dot' : 'list',
```

Or conditionally add the GitHub reporter:

```typescript
reporter: [
  ['html', { open: 'never' }],
  ...(process.env.CI ? [['github'] as const] : [['list'] as const]),
],
```

### HTML reporter options

```typescript
reporter: [
  ['html', {
    open: 'never',           // 'always' | 'never' | 'on-failure'
    outputFolder: 'my-report',
  }],
],
```

Open the generated report:

```bash
npx playwright show-report
npx playwright show-report my-report
```

### JUnit reporter (Azure DevOps)

Azure DevOps can parse JUnit XML to display test results natively.

```typescript
reporter: [
  ['junit', { outputFile: 'results.xml' }],
  ['html', { open: 'never' }],
],
```

---

## Timeouts

Playwright has three independent timeout settings.

### Test timeout

How long a single test can take before it is marked as failed. Default: `30000` ms.

```typescript
// playwright.config.ts
timeout: 30000,
```

```typescript
// Override for one test
test('slow operation', async ({ page }) => {
  test.setTimeout(90000);
  // ...
});
```

### Expect timeout

How long `expect` assertions wait for their condition to become true. Default: `5000` ms.

```typescript
expect: {
  timeout: 5000,
},
```

```typescript
// Override for one assertion
await expect(locator).toBeVisible({ timeout: 10000 });
```

### Navigation timeout

Separate from test timeout — how long `page.goto()` and `page.waitForURL()` wait. Configured via `navigationTimeout` in the `use:` block.

```typescript
use: {
  navigationTimeout: 30000,
},
```

### Relationship between timeouts

The test timeout is the outer boundary — if the test timeout expires, the test fails regardless of whether an assertion or navigation is still running. Keep `expect.timeout` and `navigationTimeout` lower than your test timeout so you get a meaningful error message (assertion failed) rather than just "test timed out."

---

## Environment-Aware Configuration

> **Architectural decision** — this pattern is not prescribed by Playwright but is standard practice.

Use a separate config file for local overrides — checked in but only used locally:

```typescript
// playwright.config.ts — committed
export default defineConfig({
  use: {
    headless: true,
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
});
```

Run with a specific config:

```bash
npx playwright test --config=playwright.local.config.ts
```

Or use environment variable checks inline:

```typescript
use: {
  headless: !process.env.HEADED,     // HEADED=1 npx playwright test
  baseURL: process.env.BASE_URL ?? 'https://staging.example.com',
},
```

---

## `webServer`

Launches a local development server before the test run and shuts it down after.

```typescript
webServer: {
  command: 'npm run start',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
},
```

`reuseExistingServer: true` reuses a server already running on that port (useful locally). On CI it is `false` so each run starts fresh.

Multiple servers:

```typescript
webServer: [
  {
    command: 'npm run start:frontend',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'npm run start:api',
    url: 'http://localhost:4000/health',
    reuseExistingServer: !process.env.CI,
  },
],
```

---

## Annotated Production Config

A realistic `playwright.config.ts` combining the patterns above:

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,

  expect: {
    timeout: 5000,
  },

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['junit', { outputFile: 'results.xml' }] as const] : []),
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://staging.example.com',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Auth setup runs first
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Test projects depend on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```
