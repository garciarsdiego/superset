# Windows Clean Machine Report - 2026-06-10

This document summarizes the second-machine Windows smoke test for the
experimental Windows port. It intentionally avoids copying raw local app-data
files, tokens, cookies, or unredacted logs.

## Source

- Tester machine: Windows 10 Pro, x64, Intel Core i7-8750H, ~16 GB RAM
- Installer: `Superset-1.12.5-x64.exe`
- Install path: `%LOCALAPPDATA%\Programs\Superset`
- Final verdict from tester: usable with known issues
- Clean-machine confidence: medium, because prior Superset app data existed
  before the coordinated run

## Passed

- Installer completed and created Start Menu/Desktop entries.
- App launched, closed, and relaunched.
- Warm relaunch was approximately 4.4 seconds to a targetable window.
- Existing session persisted across relaunch.
- OpenAI provider smoke prompt returned the expected response.
- Workspace file write/read worked after granting folder access.
- Windows-native `.cmd` wrapper test with parentheses passed.
- Computer Use worked after plugin-cache recovery.
- Uninstall and reinstall completed successfully.

## Issues Opened

| Issue | Area | Priority | Notes |
| --- | --- | --- | --- |
| [#5](https://github.com/garciarsdiego/superset/issues/5) | Installer/code signing | P0 | Installer, app executable, and uninstaller are unsigned. |
| [#6](https://github.com/garciarsdiego/superset/issues/6) | Updater/release | P1 | Experimental build logs missing `latest.yml` update metadata. |
| [#7](https://github.com/garciarsdiego/superset/issues/7) | Security/app data | P0 | Review Windows local token storage, ACLs, and diagnostics redaction. |
| [#8](https://github.com/garciarsdiego/superset/issues/8) | Performance | P1 | High aggregate memory and sustained CPU after launch. |
| [#9](https://github.com/garciarsdiego/superset/issues/9) | Auth/provider UX | P1 | Claude provider smoke flow was not completed through the UI. |
| [#10](https://github.com/garciarsdiego/superset/issues/10) | Terminal/docs | P3 | Document Bash/WSL expectations and keep hooks Windows-native. |

## Triage Notes

- The build is good enough for technical experimental testers with explicit
  caveats, but not for broad nontechnical testing.
- Code signing and local token/app-data security are the two release blockers.
- The updater issue should be fixed or muted before more testers because it
  creates visible noise and confusing logs.
- The Claude provider result is inconclusive rather than a proven provider
  failure: OpenAI passed, but Claude routing/setup did not produce a clean
  provider smoke response.
- Performance needs a second reproduction on a truly fresh Windows profile and
  a lower-spec machine before deciding whether it is a port bug, startup
  workload, or environmental load.

## Follow-Up Plan

1. Reproduce P0 issues locally or on a fresh Windows profile.
2. Decide whether v0.1 remains unsigned with checksum warnings or waits for
   signing.
3. Disable/fix experimental updater behavior.
4. Add a redacted diagnostics export path before asking testers for logs.
5. Run a focused Claude-provider test with known auth setup.
6. Repeat the clean-machine goal on a truly fresh Windows 11 profile.
