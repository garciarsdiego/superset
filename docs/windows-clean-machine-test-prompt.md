# Windows Clean Machine Test Prompt

Use this prompt with a separate agent running on a clean Windows machine after
installing the experimental Windows build. The goal is to produce a structured
smoke-test report without requiring the tester to know the codebase.

## Human Setup

1. Use a Windows machine or VM that did not previously run Superset.
2. Install the latest `Superset-*-x64.exe` artifact from the
   `Windows Experimental Installer` workflow.
3. Install Codex Desktop with Computer Use enabled, or use another agent that
   can inspect the desktop, run PowerShell commands, and write a Markdown file.
4. Use disposable test credentials where possible.
5. Do not paste production API keys or long-lived personal secrets into the
   report.
6. Save the final report as `superset-windows-clean-machine-report.md`.

## Agent Prompt

```text
You are testing the experimental Windows port of Superset on a clean Windows
machine. Your job is to execute a practical end-to-end smoke test, document
what works, capture exact error messages, and save a Markdown report named
`superset-windows-clean-machine-report.md` on the Desktop.

Important rules:
- Do not modify Superset source code.
- Do not use destructive cleanup commands.
- Do not expose full API keys, OAuth tokens, cookies, or personal secrets in
  the report. Redact secrets as `sk-...`, `gho_...`, or `[REDACTED]`.
- Prefer exact timestamps, paths, versions, and observed behavior.
- If a step cannot be completed, continue with the next independent step.
- Include screenshots only if the local environment makes that easy; otherwise,
  written observations are enough.
- If Computer Use is listed but fails to initialize before listing apps or
  windows, record the exact plugin/bootstrap error, mark only the Computer Use
  phase as blocked by the test environment, and continue testing Superset with
  PowerShell plus manual UI instructions.

Report structure:

# Superset Windows Clean Machine Test Report

## Environment
- Date/time:
- Windows edition and version:
- CPU architecture:
- RAM:
- Installed Superset version:
- Installer filename:
- Install path:
- User account type: admin / standard
- Network type: home / work / corporate VPN / other

## Installation
Test:
- Launch installer.
- Install with default options.
- Confirm whether Windows SmartScreen or antivirus warns.
- Confirm whether the app launches automatically.

Record:
- Pass/fail:
- Time to install:
- Any warnings:
- Any unexpected prompts:

## First Launch
Test:
- Launch Superset from Start Menu.
- Launch Superset from desktop shortcut if present.
- Close and reopen the app.
- Reboot Windows and launch again if practical.

Record:
- Pass/fail:
- Cold launch time:
- Warm launch time:
- Any blank windows, crashes, or long hangs:
- Whether the app starts required background services by itself:

## Login And Account Sync
Test:
- Sign in with GitHub or the available supported provider.
- Complete OAuth in the browser.
- Confirm the app receives the callback.
- Quit and relaunch the app.
- Confirm the session persists.
- Sign out if UI supports it, then sign in again.

Record:
- Pass/fail:
- Callback URL host/port observed:
- Any ERR_CONNECTION_REFUSED or browser callback failure:
- Whether logout works:
- Whether session persists after restart:

## Provider Setup
Test OpenAI:
- Connect OpenAI through subscription or API key, whichever is available.
- Start a new chat/session.
- Send: "Say exactly: OpenAI provider smoke test OK"
- Confirm a valid response.

Test Anthropic/Claude:
- Connect Anthropic through subscription or API key, whichever is available.
- Start a new chat/session.
- Send: "Say exactly: Claude provider smoke test OK"
- Confirm a valid response.
- Watch for "Not logged in to Anthropic. Run /login first."

Record:
- OpenAI pass/fail:
- Anthropic pass/fail:
- Auth method used for each provider:
- Any mismatch between Settings showing Active and chat failing:

## Local Project Workflow
Test:
- Create a small temporary folder on Desktop named `superset-smoke-project`.
- In Superset, open that folder as a workspace/project if supported.
- Ask the connected agent to create a simple `hello.txt`.
- Ask it to create a small `index.html`.
- Ask it to run a safe command such as `Get-Date` or `dir`.
- Confirm the files exist on disk.

Record:
- Pass/fail:
- Whether file writes work:
- Whether terminal commands work:
- Whether paths with spaces work:
- Any permission prompts:

## Terminal And Shell Behavior
Test:
- Open any built-in terminal or agent terminal.
- Run:
  - `pwd` or `Get-Location`
  - `node --version` if Node is installed
  - `git --version` if Git is installed
  - `echo SUPSERSET_WINDOWS_SMOKE_OK`
- If the app supports multiple shells, test PowerShell and cmd.

Record:
- Pass/fail:
- Default shell:
- Shell startup time:
- Any hook errors, especially syntax errors involving `.cmd`, Bash, or
  `SUPERSET_HOME_DIR`:

## Computer Use / Desktop Control
Test:
- If the app exposes Computer Use or desktop automation, ask the agent to open
  Notepad, type one line, and close without saving.
- Ask the agent to inspect a visible app window title.
- If Computer Use fails before any desktop action, record the exact bootstrap
  error and continue with the other phases.

Record:
- Pass/fail:
- Whether permissions are requested:
- Any focus, keyboard layout, or accessibility issues:
- Any plugin/package/export error:

## Performance
Test:
- Observe app responsiveness during normal use.
- Open Task Manager and record approximate CPU/RAM for Superset while idle.
- Send three short chat prompts in a row and note perceived latency.
- Switch between Settings, chat, project view, and terminal.

Record:
- Idle CPU:
- Idle RAM:
- CPU/RAM during chat:
- UI responsiveness: good / acceptable / slow / unusable
- Any obvious cause, such as Docker, background sync, antivirus scan, or heavy
  indexing:

## Offline And Network Edge Cases
Test:
- Disconnect internet temporarily if practical.
- Launch Superset.
- Reconnect internet.
- Try a provider request after reconnecting.

Record:
- Pass/fail:
- Whether errors are understandable:
- Whether reconnect recovers without restart:

## Uninstall / Reinstall
Test:
- Uninstall Superset using Windows Apps settings or the uninstaller.
- Confirm whether user data is preserved or removed.
- Reinstall Superset.
- Launch again.

Only perform data cleanup if the installer explicitly offers a cleanup option.
Do not manually delete unknown user folders.

Record:
- Pass/fail:
- Uninstall path used:
- Whether cleanup option exists:
- Whether reinstall works:
- Whether old login/session data remains:

## Files And Logs
Find and record likely app data/log locations. Do not paste secrets.

Check common paths:
- `%APPDATA%`
- `%LOCALAPPDATA%`
- `%USERPROFILE%\.superset`
- The Superset install directory

Record:
- Relevant paths that exist:
- Log filenames:
- Last 30 non-secret lines of logs related to any failure:

## Final Verdict
Choose one:
- Ready for broader experimental testers
- Usable with known issues
- Blocked by critical issue

## Issues Found
For each issue, use this format:

### Issue N: Short title
- Severity: critical / high / medium / low
- Area: installer / auth / provider / terminal / performance / uninstall / UI
- Reproduction steps:
- Expected:
- Actual:
- Logs or screenshots:
- Workaround:

## Suggested Next Tests
List anything that should be tested next but was not covered on this machine.
```

## Recommended Triage

After receiving the report:

1. File each critical or high severity failure as a GitHub issue.
2. Attach the report to the relevant tracking issue.
3. Compare clean-machine results with local developer-machine results.
4. Repeat the same prompt on at least one machine with a non-admin Windows user.
5. Repeat on a Windows path containing spaces and non-ASCII characters.
