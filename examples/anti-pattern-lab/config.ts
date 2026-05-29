/**
 * Anti-patterns #7 and #10: HTML reporter autoopen option and
 * testInfo.setTimeout hardcoded in a fixture.
 *
 * Source: https://playwright.dev/docs/test-reporters (anti-pattern #7)
 */

// ---------------------------------------------------------------------------
// #7 — HTML reporter autoopen option

// ❌ 'autoopen' is not a recognised option — it is silently ignored.
//    The HTML reporter falls back to its default: open: 'on-failure'.
//    On CI this causes the browser to open (or hang) after a failed run.
const badReporterConfig = [["html", { autoopen: false }]];

// ✅ The correct option is 'open'. Valid values: 'always' | 'never' | 'on-failure'.
const goodReporterConfig = [["html", { open: "never" }]];

// ---------------------------------------------------------------------------
// #10 — testInfo.setTimeout hardcoded in fixture

// ❌ This overrides playwright.config.ts timeout for every test that uses
//    the loggedInPage fixture — silently, with no record in the config file.
//    Developers reading the config won't see it. Debugging unexpected timeouts
//    requires hunting through every fixture file.

/*
export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ browser }, use, testInfo) => {
    testInfo.setTimeout(60000); // ← silently overrides config for all callers
    // ...
  },
});
*/

// ✅ Set the timeout in playwright.config.ts where it is visible to everyone.
//
// playwright.config.ts:
// export default defineConfig({
//   timeout: 60000,
// });
//
// If a specific project needs a longer budget (e.g. staging environment):
// projects: [
//   {
//     name: 'staging',
//     timeout: 120000, // documented, visible, scoped to this project
//   },
// ],
