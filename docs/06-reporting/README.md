# Reporting

> **Sources**:
> - Built-in reporters and trace viewer: [playwright.dev/docs/test-reporters](https://playwright.dev/docs/test-reporters), [playwright.dev/docs/trace-viewer](https://playwright.dev/docs/trace-viewer)
> - Allure: [allurereport.org/docs/playwright](https://allurereport.org/docs/playwright/), [allurereport.org/docs/playwright-configuration](https://allurereport.org/docs/playwright-configuration/)
>
> Where something goes beyond official documentation, it is labeled as a **note** or **architectural decision**.

---

## Overview

Playwright provides two built-in reporting tools — the **HTML reporter** and the **Trace Viewer** — that cover most debugging needs out of the box. **Allure** is a popular third-party reporter that produces richer, more stakeholder-friendly reports with history, categories, and environment information.

| Tool | What it's for | Requires setup |
|------|--------------|----------------|
| HTML reporter | Post-run summary with screenshots, videos, and traces linked inline | No — built in |
| Trace Viewer | Deep-dive debugging of a single test failure — every action, snapshot, and network request | No — built in, traces must be enabled |
| Allure | Team dashboards, trend tracking, CI publishing, stakeholder-facing reports | Yes — install `allure-playwright` |

---

## HTML Reporter

The HTML reporter generates a self-contained folder that can be opened as a web page. It links screenshots, videos, and traces directly to each test result.

### Configuration

```typescript
// playwright.config.ts
reporter: [
  ['html', { open: 'never' }],
  ['list'],
],
```

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `open` | `'always'` \| `'never'` \| `'on-failure'` | `'on-failure'` | When to auto-open the report after a run |
| `outputFolder` | string | `'playwright-report'` | Directory for the generated report |

### Viewing the report

```bash
npx playwright show-report
```

Point to a custom output folder:

```bash
npx playwright show-report my-report
```

### What the report shows

- Pass / fail / flaky / skipped counts per run
- Per-test result with duration
- Attached screenshots (when `screenshot: 'only-on-failure'` or `'on'`)
- Attached video recordings (when `video: 'retain-on-failure'` or `'on'`)
- Attached trace file with a direct "open trace" link

The HTML report is self-contained — the entire folder can be zipped and shared, or uploaded as a CI artifact without needing a running server.

### Saving as a CI artifact

```yaml
# GitHub Actions example
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

`if: always()` ensures the artifact is uploaded even when the test run fails.

---

## Trace Viewer

The Trace Viewer is a GUI tool for inspecting a recorded trace — a full timeline of every action a test performed. From the official docs:

> "Playwright Trace Viewer is a GUI tool that helps you explore recorded Playwright traces after the script has run."

It is most useful when a test fails on CI and you cannot reproduce it locally. The trace contains everything that happened — no `console.log` or video scrubbing required.

### Enabling traces

Configure in `playwright.config.ts`:

```typescript
use: {
  trace: 'on-first-retry',
},
```

All valid `trace` values:

| Value | When trace is recorded |
|-------|----------------------|
| `'off'` | Never |
| `'on'` | Every test run |
| `'on-first-retry'` | First retry of a failing test only |
| `'on-all-retries'` | Every retry attempt |
| `'retain-on-failure'` | Every test, deleted if test passes |
| `'retain-on-first-failure'` | First run only, deleted if test passes |

`'on-first-retry'` is the recommended default — you get a trace when it matters without generating files for every passing test.

For debugging a specific failure locally, run with `--trace on`:

```bash
npx playwright test --trace on
```

### Opening a trace

From the HTML report, click the trace icon next to any test result.

From the command line:

```bash
npx playwright show-trace path/to/trace.zip
```

From a remote URL (processed entirely in-browser, no data is transmitted):

```bash
npx playwright show-trace https://example.com/trace.zip
```

Or open [trace.playwright.dev](https://trace.playwright.dev) and drag-drop the `.zip` file.

### What the trace contains

The Trace Viewer has the following panels:

| Panel | What it shows |
|-------|--------------|
| **Actions** | Every action in the test — click, fill, goto — with the locator used, duration, and DOM state before/after |
| **Snapshots** | DOM captures at three points per action: before invocation, during input, and after completion. Highlights the exact element and click position |
| **Screenshots** | Film strip timeline showing the visual state at each action |
| **Source** | The test code line that corresponds to the selected action |
| **Call** | Action metadata — duration, locator, strict mode status, keys pressed |
| **Log** | Full internal Playwright log — scrolling, waiting steps, every interaction |
| **Errors** | Failure message with a red indicator on the timeline |
| **Console** | Browser console logs and test file logs |
| **Network** | Every request — type, status, method, headers, request/response payload |
| **Metadata** | Browser type, viewport size, test duration |

### Using the timeline to debug

The film strip at the top is the most efficient debugging entry point:

1. Find the screenshot just before the failure
2. Click it — the Actions panel jumps to that point
3. Check the Snapshots panel — was the element visible? Was the form field filled?
4. Check the Network panel — did the expected API call complete?

This flow replaces hours of adding `console.log` statements and re-running tests.

---

## Allure Reporter

Allure is a third-party reporter that produces rich HTML reports with test history trends, categories, environment information, and links to issue trackers. It is widely used in enterprise and CI-integrated environments.

> **Note on prerequisites**: Allure requires **Java** to be installed. The `allure-commandline` npm package bundles the Allure CLI binary, which is a Java application. Java must be present on any machine — local or CI — that generates the report.

### Installation

```bash
npm install --save-dev allure-playwright allure-commandline
```

- `allure-playwright` — the Playwright reporter that writes raw results to `allure-results/`
- `allure-commandline` — the CLI that converts raw results into the HTML report

### Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['allure-playwright'],
  ],
});
```

With options:

```typescript
reporter: [
  ['list'],
  [
    'allure-playwright',
    {
      resultsDir: 'allure-results',
      detail: true,
      suiteTitle: true,
    },
  ],
],
```

### All configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resultsDir` | string | `'allure-results'` | Directory where raw results are written after a test run |
| `detail` | boolean | `true` | When `true`, Allure automatically creates steps for Playwright API calls, hooks, and assertions |
| `suiteTitle` | boolean | `true` | When `true`, groups each test into a suite named after its file |
| `links` | object | — | URL templates for issue tracker integration (`issue`, `tms`, `jira` types) |
| `categories` | array | — | Custom categories to classify failures by error pattern |
| `environmentInfo` | object | — | Key-value pairs shown on the report's main page (e.g. browser version, env name) |

### Generating the report

Running tests writes raw XML files to `allure-results/`. A second step converts them into the HTML report.

```bash
# Step 1 — run tests (writes to allure-results/)
npx playwright test

# Step 2 — generate HTML report
npx allure generate allure-results --clean -o allure-report

# Step 3 — open report in browser
npx allure open allure-report
```

Or combine steps 2 and 3:

```bash
npx allure serve allure-results
```

### Recommended npm scripts

> **Architectural decision** — not from official docs. Adding these scripts to `package.json` prevents teammates from needing to remember the full allure commands.

```json
{
  "scripts": {
    "test": "playwright test",
    "report:allure:generate": "allure generate allure-results --clean -o allure-report",
    "report:allure:open": "allure open allure-report",
    "report:allure:serve": "allure serve allure-results",
    "report:html": "playwright show-report"
  }
}
```

### Environment information

`environmentInfo` lets you embed context — branch name, build number, base URL — directly in the report. Useful when the same Allure history receives results from multiple environments.

```typescript
reporter: [
  [
    'allure-playwright',
    {
      environmentInfo: {
        Environment: process.env.TEST_ENV ?? 'local',
        Branch: process.env.GIT_BRANCH ?? 'unknown',
        BaseURL: process.env.BASE_URL ?? 'https://staging.example.com',
      },
    },
  ],
],
```

### Issue tracker links

Link test failures directly to tickets:

```typescript
reporter: [
  [
    'allure-playwright',
    {
      links: {
        issue: {
          nameTemplate: 'Issue #%s',
          urlTemplate: 'https://github.com/your-org/your-repo/issues/%s',
        },
        tms: {
          nameTemplate: 'TMS-%s',
          urlTemplate: 'https://your-tms.example.com/testcase/%s',
        },
      },
    },
  ],
],
```

Then in your test:

```typescript
import { allure } from 'allure-playwright';

test('login redirects on failure', async ({ page }) => {
  allure.issue('123');   // links to GitHub issue #123
  allure.tms('TC-456'); // links to test case TC-456
  // ...
});
```

### `.gitignore` entries

```
allure-results/
allure-report/
```

Raw results and generated reports should not be committed. Publish them as CI artifacts instead.

---

## Running Multiple Reporters Together

You can run any combination of reporters simultaneously. The recommended setup for most projects:

```typescript
reporter: [
  ['list'],                                           // live terminal output
  ['html', { open: 'never' }],                       // post-run HTML report
  ['allure-playwright', { resultsDir: 'allure-results' }],  // Allure raw results
  ...(process.env.CI ? [['junit', { outputFile: 'results.xml' }] as const] : []),  // JUnit for Azure DevOps / Jenkins on CI
],
```

### What each reporter adds

| Reporter | Who reads it | When |
|----------|-------------|------|
| `list` | Developer at the terminal | During the run |
| `html` | Developer investigating a failure | After the run, locally or as a CI artifact |
| `allure-playwright` | Team / stakeholders | After the run, served from CI or a shared server |
| `junit` | CI system (Azure DevOps, Jenkins) | After the run, parsed automatically by the CI platform |

---

## Choosing Between HTML and Allure

| | Playwright HTML | Allure |
|---|---|---|
| Setup required | None | `npm install` + Java |
| Trace viewer integration | Built in — one click | Not built in |
| Test history / trends | No | Yes |
| Environment info on report | No | Yes |
| Stakeholder-friendly UI | Moderate | High |
| CI publishing | Upload folder as artifact | Requires Allure server or static hosting |
| Best for | Fast local debugging | Team dashboards and trend analysis |

Use both together — they serve different audiences. The HTML report with trace viewer is your debugging tool. Allure is your team's visibility tool.
