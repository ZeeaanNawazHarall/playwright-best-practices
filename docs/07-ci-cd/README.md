# CI/CD

> **Source**: All pipeline configurations and recommendations in this section are sourced directly from the [official Playwright CI documentation](https://playwright.dev/docs/ci) and the [sharding documentation](https://playwright.dev/docs/test-sharding). Where something goes beyond official documentation, it is labeled as a **note** or **architectural decision**.

---

## What CI Needs from Playwright

Three things must happen on every CI run:

```bash
npm ci                              # install dependencies from lock file
npx playwright install --with-deps  # install browsers + OS-level dependencies
npx playwright test                 # run tests
```

`--with-deps` installs the system libraries that Chromium, Firefox, and WebKit need on Linux (fonts, media codecs, etc.). Without it, browsers will fail to launch on a clean Linux runner.

Use `npm ci` instead of `npm install` on CI — it installs exactly what is in `package-lock.json` without updating it, making builds reproducible.

---

## Config Settings That Matter on CI

Some `playwright.config.ts` settings only make sense when toggled by the `CI` environment variable, which is automatically set to `'true'` by GitHub Actions, Azure Pipelines, and most other CI platforms.

```typescript
// playwright.config.ts
export default defineConfig({
  forbidOnly: !!process.env.CI,          // fail if test.only was committed
  retries: process.env.CI ? 2 : 0,       // retry flaky tests on CI only
  workers: process.env.CI ? 1 : undefined, // serialize on CI for stability
});
```

From the official docs on workers: "set workers to '1' in CI environments to prioritize stability and reproducibility."

> **Note**: `workers: 1` serializes all tests. If your CI machine has enough resources and your tests are properly isolated, you can increase this — but `1` is the safe default when getting started.

---

## GitHub Actions

### Standard workflow

The official Playwright-recommended workflow for GitHub Actions:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: lts/*

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**`if: ${{ !cancelled() }}`** — uploads the report even when tests fail. `if: always()` would also work but uploads even when the job is manually cancelled, which wastes storage.

**`timeout-minutes: 60`** — prevents a hung test from consuming runner minutes indefinitely.

### Passing secrets to tests

Store credentials as [GitHub Actions secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) and inject them as environment variables:

```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    APP_URL: ${{ secrets.APP_URL }}
    TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

Access in your config or fixtures via `process.env.TEST_USERNAME`. Never hardcode credentials in the workflow file or in test code.

### Using the official Docker image

Instead of installing Node and browsers separately, use Playwright's pre-built Docker image. It has all browsers and system dependencies already installed.

```yaml
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.52.0-noble
      options: --user 1001

    steps:
      - uses: actions/checkout@v5

      - name: Install dependencies
        run: npm ci

      - name: Run Playwright tests
        run: npx playwright test
```

`--user 1001` avoids running as root inside the container, which can cause file permission issues with the host runner.

The image tag must match your installed Playwright version — if your `package.json` has `@playwright/test: ^1.52.0`, use `mcr.microsoft.com/playwright:v1.52.0-noble`.

### Testing against a deployed URL

When Playwright tests run after a deployment (e.g. a preview environment on every PR), pass the deployed URL via environment variable:

```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    BASE_URL: ${{ steps.deploy.outputs.url }}
```

```typescript
// playwright.config.ts
use: {
  baseURL: process.env.BASE_URL ?? 'https://staging.example.com',
},
```

### Do not cache browser binaries

From the official docs:

> "Caching browser binaries is not recommended, since the amount of time it takes to restore the cache is comparable to the time it takes to download the binaries."

Skip `actions/cache` for the Playwright browser directory. It does not save meaningful time and adds complexity.

---

## Azure Pipelines

### Basic pipeline

The official Azure Pipelines configuration from Playwright docs:

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: ubuntu-latest

steps:
  - task: UseNode@1
    inputs:
      version: '22'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx playwright install --with-deps
    displayName: 'Install Playwright browsers'

  - script: npx playwright test
    displayName: 'Run Playwright tests'
    env:
      CI: 'true'
```

`CI: 'true'` is set explicitly here — Azure Pipelines does not set it automatically the same way GitHub Actions does.

### Publishing test results in Azure DevOps

Azure DevOps can parse JUnit XML and display pass/fail counts natively in the pipeline summary. This requires two changes.

**Step 1** — add the JUnit reporter in `playwright.config.ts`:

```typescript
reporter: [
  ['html', { open: 'never' }],
  ['junit', { outputFile: 'test-results/e2e-junit-results.xml' }],
],
```

**Step 2** — add the `PublishTestResults` task after the test step:

```yaml
- script: npx playwright test
  displayName: 'Run Playwright tests'
  env:
    CI: 'true'

- task: PublishTestResults@2
  displayName: 'Publish test results'
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'test-results/e2e-junit-results.xml'
  condition: succeededOrFailed()
```

`condition: succeededOrFailed()` ensures results are published even when tests fail — otherwise you would only see results for passing runs.

### Publishing the HTML report as an artifact

```yaml
- task: PublishPipelineArtifact@1
  displayName: 'Upload Playwright HTML report'
  inputs:
    targetPath: playwright-report
    artifact: playwright-report
    publishLocation: pipeline
  condition: succeededOrFailed()
```

### Passing secrets in Azure Pipelines

Add variables in the pipeline settings as secret variables, then reference them:

```yaml
- script: npx playwright test
  displayName: 'Run Playwright tests'
  env:
    CI: 'true'
    TEST_USERNAME: $(TEST_USERNAME)
    TEST_PASSWORD: $(TEST_PASSWORD)
    APP_URL: $(APP_URL)
```

Variables defined as secrets in Azure Pipelines are masked in logs automatically.

### Using the Docker image on Azure Pipelines

```yaml
pool:
  vmImage: ubuntu-latest

container: mcr.microsoft.com/playwright:v1.52.0-noble

steps:
  - script: npm ci
  - script: npx playwright test
    env:
      CI: 'true'
```

---

## Sharding (Running Tests in Parallel Across Multiple Machines)

Sharding splits your test suite across multiple CI jobs. Each job runs a slice of the suite, and results are merged at the end.

The `--shard` flag takes the form `x/y` where `x` is the current job's index (1-based) and `y` is the total number of shards:

```bash
npx playwright test --shard=1/4  # job 1 of 4
npx playwright test --shard=2/4  # job 2 of 4
npx playwright test --shard=3/4  # job 3 of 4
npx playwright test --shard=4/4  # job 4 of 4
```

From the docs: "Enable `fullyParallel: true` in config for test-level distribution; without it, sharding operates at the file level and requires evenly-sized test files for optimal balance."

### GitHub Actions — sharded workflow with merged report

This uses the blob reporter on each shard, then merges all shards into a single HTML report.

**Step 1** — configure blob reporter for CI:

```typescript
// playwright.config.ts
reporter: process.env.CI ? 'blob' : 'html',
```

**Step 2** — the workflow:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  playwright-tests:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
      - name: Upload blob report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: blob-report
          retention-days: 1

  merge-reports:
    if: ${{ !cancelled() }}
    needs: [playwright-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
      - name: Download blob reports
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true
      - name: Merge into HTML report
        run: npx playwright merge-reports --reporter html ./all-blob-reports
      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        with:
          name: html-report--attempt-${{ github.run_attempt }}
          path: playwright-report
          retention-days: 14
```

`fail-fast: false` on the matrix prevents one failing shard from immediately cancelling all other shards — you want all shards to finish so the merge job has complete data.

### Azure Pipelines — sharding with matrix

```yaml
strategy:
  matrix:
    shard1:
      SHARD_INDEX: 1
      SHARD_TOTAL: 3
    shard2:
      SHARD_INDEX: 2
      SHARD_TOTAL: 3
    shard3:
      SHARD_INDEX: 3
      SHARD_TOTAL: 3

steps:
  - script: npm ci
  - script: npx playwright install --with-deps
  - script: npx playwright test --shard=$(SHARD_INDEX)/$(SHARD_TOTAL)
    env:
      CI: 'true'
```

---

## Recommended `.gitignore` Entries

```
# Test artifacts — never commit these
test-results/
playwright-report/
blob-report/
allure-results/
allure-report/

# Auth state — contains session tokens
playwright/.auth/

# Environment files
.env
```

---

## Checklist Before First CI Run

> **Architectural decision** — not from Playwright docs. A practical pre-flight list based on common first-run failures.

- [ ] `playwright.config.ts` has `forbidOnly: !!process.env.CI`
- [ ] `playwright.config.ts` has `retries: process.env.CI ? 2 : 0`
- [ ] `playwright.config.ts` has `workers: process.env.CI ? 1 : undefined`
- [ ] Credentials are in CI secrets, not in config or test files
- [ ] `playwright/.auth/` is in `.gitignore`
- [ ] `test-results/` and `playwright-report/` are in `.gitignore`
- [ ] The workflow file uses `npx playwright install --with-deps`, not just `npx playwright install`
- [ ] Artifact upload uses `if: ${{ !cancelled() }}` (GitHub) or `condition: succeededOrFailed()` (Azure)
- [ ] JUnit reporter is configured if using Azure DevOps test result publishing
