# Security Policy

## Scope

This repository is a documentation and example-code resource. It does not run a production service, store user data, or handle authentication beyond public test credentials.

**Public test credentials** in `.env.example` files (SauceDemo `standard_user` / `secret_sauce`) are intentionally public — they are the official credentials published on [saucedemo.com](https://www.saucedemo.com) for testing purposes. These are not a security concern.

## Reporting a Vulnerability

If you find a security issue in this repository — for example:

- A CI workflow that could be exploited to exfiltrate secrets or execute arbitrary code
- Example code that is labeled as ✅ recommended but introduces a real security vulnerability
- A dependency with a known CVE

**Please do not open a public GitHub issue.** Instead, use [GitHub's private vulnerability reporting](../../security/advisories/new) to disclose it confidentially.

Include:
- A description of the vulnerability
- The file(s) and line(s) affected
- Steps to reproduce or exploit
- Your assessment of the impact

I will acknowledge the report within 7 days and aim to resolve confirmed issues within 30 days.

## Out of Scope

- The SauceDemo application itself — report issues to Sauce Labs directly
- Playwright framework vulnerabilities — report to [microsoft/playwright](https://github.com/microsoft/playwright/security)
