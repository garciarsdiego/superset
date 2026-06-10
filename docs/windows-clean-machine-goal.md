# Windows Clean Machine `/goal`

Copy the block below into Codex on the clean Windows test machine. It assumes
Computer Use is available and that the experimental Superset installer is
already installed, or available in Downloads.

```text
/goal Test the experimental Windows port of Superset end-to-end on this clean Windows machine using Computer Use, PowerShell, and normal user workflows. Produce a detailed Markdown report on the Desktop named `superset-windows-clean-machine-report.md`, with exact observations, failures, logs, timings, and a final readiness verdict.

Context:
- You are testing an unofficial experimental Windows port of Superset.
- Treat this as release smoke testing for a Windows installer.
- The machine should be considered a clean user environment.
- Use Computer Use to operate the actual UI whenever possible.
- Use PowerShell for environment inspection, file checks, logs, and timings.
- Do not modify Superset source code.
- Do not perform destructive cleanup outside normal installer/uninstaller flows.
- Do not expose secrets. Redact API keys, OAuth tokens, cookies, email addresses if needed, and any credential-like values.

Computer Use fallback:
- If Computer Use is listed but fails to initialize, do not stop the Superset
  smoke test.
- Record the exact Computer Use error in the report.
- Mark only Phase 8 as `Blocked by test environment`.
- Continue every other phase using PowerShell plus manual UI instructions for
  the human tester.
- Treat Computer Use bootstrap/package/export errors as Codex environment
  failures unless Superset itself is directly involved in triggering them.

Required final artifact:
- Save a Markdown file at:
  `%USERPROFILE%\Desktop\superset-windows-clean-machine-report.md`
- The report must be useful even if no one has access to this machine later.
- Include pass/fail for every phase.
- Include exact error text, screenshots paths if any, relevant log paths, and reproduction steps for every failure.

Testing principles:
- Prefer real user workflows over internal assumptions.
- If one phase blocks, document the blocker and continue with independent phases.
- Measure subjective performance, but also collect CPU/RAM where practical.
- Use disposable credentials where possible.
- Never paste full secrets into the report.
- When using Computer Use, observe the actual visible app state before concluding.

Phase 0: Prepare Test Run
1. Record the current date/time.
2. Record Windows version using PowerShell.
3. Record CPU architecture, RAM, username path, and whether the username/path contains spaces or non-ASCII characters.
4. Confirm whether Superset is already installed.
5. Locate the installer if present, likely in Downloads.
6. Start a timer for the overall test.

Evidence to collect:
- Windows edition/version/build.
- CPU architecture.
- RAM.
- Current username path.
- Installer filename and path, if available.
- Whether this appears to be a clean install.

Phase 1: Installation
1. If Superset is not installed, run the installer through the normal Windows UI.
2. Use default installer options unless the UI offers a relevant cleanup/reinstall option.
3. Observe whether SmartScreen, Defender, antivirus, or UAC appears.
4. Record installation duration.
5. Confirm whether Superset launches automatically after install.

Pass criteria:
- Installer completes without crash.
- App is installed in a normal user-accessible location.
- Any security warning is understandable and not catastrophic for an unsigned experimental build.

Failure evidence:
- Exact warning/error text.
- Screenshot path if possible.
- Installer log path if visible.

Phase 2: Launch And App Lifecycle
1. Launch Superset from Start Menu.
2. If a desktop shortcut exists, launch from it too.
3. Close Superset normally.
4. Relaunch Superset.
5. If practical, reboot Windows and launch once more.
6. Observe whether background services start automatically.
7. Measure cold launch and warm launch times.

Pass criteria:
- App opens to a usable window.
- Relaunch works.
- No blank permanent window.
- No crash loop.

Record:
- Cold launch time.
- Warm launch time.
- Any window flashing, blank screens, long hangs, service startup issues.

Phase 3: Login And OAuth Callback
1. Open Superset settings/account area.
2. Start login with the supported provider, preferably GitHub if available.
3. Complete login in browser.
4. Observe callback behavior.
5. Confirm the app becomes authenticated.
6. Quit and relaunch Superset.
7. Confirm session persists.
8. If sign out is available, sign out and sign in again.

Pass criteria:
- OAuth completes.
- Browser callback reaches the local app.
- No `ERR_CONNECTION_REFUSED`.
- Session persists after restart.
- Logout works if UI exposes it.

Record:
- Provider used.
- Callback URL host and port, redacting tokens/state if needed.
- Any refused connection or timeout.
- Whether logout/resync is possible.

Phase 4: Provider Setup - OpenAI
1. Open provider/model settings.
2. Configure OpenAI through the available method: subscription login or API key.
3. Start a new chat/session with an OpenAI model.
4. Send exactly:
   `Say exactly: OpenAI provider smoke test OK`
5. Confirm whether the response is correct.
6. Restart Superset and send one more short OpenAI prompt.

Pass criteria:
- Settings show OpenAI active.
- Chat can use OpenAI.
- Provider still works after restart.

Record:
- Auth method used, without secrets.
- Model used if visible.
- Response latency estimate.
- Any provider mismatch between settings and chat.

Phase 5: Provider Setup - Anthropic/Claude
1. Open provider/model settings.
2. Configure Anthropic/Claude through the available method: subscription login or API key.
3. Start a new chat/session with a Claude model.
4. Send exactly:
   `Say exactly: Claude provider smoke test OK`
5. Watch specifically for:
   `Not logged in to Anthropic. Run /login first.`
6. Restart Superset and send one more short Claude prompt.

Pass criteria:
- Settings show Anthropic active.
- Chat can use Claude.
- No mismatch where settings say active but chat says not logged in.
- Provider still works after restart.

Record:
- Auth method used, without secrets.
- Model used if visible.
- Response latency estimate.
- Exact error text if Claude fails.

Phase 6: Workspace And File Operations
1. Create a temporary folder on Desktop:
   `%USERPROFILE%\Desktop\superset-smoke-project`
2. Open that folder/workspace in Superset if the UI supports it.
3. Ask the connected agent to create a file named `hello.txt` containing:
   `Superset Windows smoke test OK`
4. Ask the agent to create a minimal `index.html` file.
5. Confirm both files exist on disk with PowerShell.
6. Ask the agent to read back the contents of `hello.txt`.

Pass criteria:
- Folder opens.
- Agent can write files.
- Files appear in the expected Windows path.
- Paths with spaces in the user profile do not break file access.

Record:
- Exact project path.
- Files created.
- Any permission prompts.
- Any path escaping or slash/backslash issue.

Phase 7: Terminal And Shell Behavior
1. Open Superset's terminal or an agent terminal if available.
2. Run safe commands:
   - `Get-Location`
   - `Get-Date`
   - `echo SUPERSET_WINDOWS_SMOKE_OK`
   - `git --version` if Git exists
   - `node --version` if Node exists
3. If the app supports cmd and PowerShell separately, test both.
4. Watch for hook errors involving `.cmd`, Bash, `SUPERSET_HOME_DIR`, or syntax near `(`.

Pass criteria:
- Terminal opens.
- Commands execute.
- Windows shell syntax is handled correctly.
- No Bash parsing of Windows `.cmd` hook snippets.

Record:
- Default shell.
- Command outputs.
- Terminal startup time.
- Any hook or shell syntax errors.

Phase 8: Computer Use / Desktop Automation
1. If Superset exposes Computer Use or desktop automation, ask the agent to open Notepad.
2. Ask it to type:
   `Superset Computer Use smoke test OK`
3. Ask it to close Notepad without saving.
4. Ask it to identify the title of one visible window.
5. If Computer Use fails before listing apps/windows, record the bootstrap
   error and continue with the rest of the test plan.

Pass criteria:
- Desktop control works.
- Keyboard/mouse actions execute in the intended window.
- Permission prompts are understandable.

Record:
- Whether Computer Use is available.
- Whether permissions were requested.
- Any focus, keyboard layout, or accessibility issue.
- Any plugin/bootstrap error, including package export errors.

Phase 9: Performance And Responsiveness
1. With Superset idle, use Task Manager or PowerShell to estimate Superset CPU/RAM.
2. Send three short chat prompts in a row using the configured provider.
3. Switch between settings, chat, workspace/project view, terminal, and provider settings.
4. Observe responsiveness for at least 5 minutes.
5. Note whether Docker Desktop, antivirus, sync/indexing, or other heavy processes are running.

Pass criteria:
- UI remains responsive.
- Chat use is practical.
- CPU/RAM are not obviously runaway while idle.

Record:
- Idle CPU/RAM estimate.
- CPU/RAM during chat if practical.
- Subjective responsiveness: good / acceptable / slow / unusable.
- Any likely cause of slowness.

Phase 10: Offline And Reconnect
1. If practical, disconnect internet temporarily.
2. Launch or use Superset while offline.
3. Observe error handling.
4. Reconnect internet.
5. Retry a provider request.

Pass criteria:
- Offline errors are understandable.
- Reconnect works without full reinstall.
- App does not get permanently stuck.

Record:
- Offline behavior.
- Reconnect behavior.
- Whether restart was required.

Phase 11: Logs And App Data
1. Locate relevant app data and logs without deleting anything.
2. Check common paths:
   - `%APPDATA%`
   - `%LOCALAPPDATA%`
   - `%USERPROFILE%\.superset`
   - Superset install directory
3. Record paths that exist.
4. For failures, include the last relevant non-secret log lines.

Pass criteria:
- App data/log locations are discoverable.
- Logs do not contain obvious unredacted secrets in the sampled lines.

Record:
- Existing app data paths.
- Log filenames.
- Last 30 relevant failure lines, redacted.

Phase 12: Uninstall And Reinstall
Only run this phase after the main functionality tests are complete.

1. Uninstall Superset through Windows Apps settings or the normal uninstaller.
2. Record whether the uninstaller offers a cleanup/data removal option.
3. If the installer/uninstaller explicitly offers cleanup, test that option.
4. Reinstall Superset from the same installer.
5. Launch Superset again.
6. Record whether previous session/provider data remains.

Pass criteria:
- Uninstall completes.
- Reinstall completes.
- App launches after reinstall.
- Cleanup option behavior is clear.

Record:
- Uninstall path used.
- Whether data was preserved or cleared.
- Whether reinstall restored functionality.

Phase 13: Final Report
Create `%USERPROFILE%\Desktop\superset-windows-clean-machine-report.md` with this structure:

# Superset Windows Clean Machine Test Report

## Summary
- Final verdict: Ready for broader experimental testers / Usable with known issues / Blocked by critical issue
- Overall pass/fail:
- Top 3 risks:
- Total test duration:

## Environment
- Date/time:
- Windows edition/version/build:
- CPU architecture:
- RAM:
- Username/profile path:
- Superset installer filename:
- Superset install path:
- Clean machine confidence: high / medium / low

## Phase Results
Create a table:
| Phase | Result | Notes |
| --- | --- | --- |
| Installation | Pass/Fail/Skipped | ... |
| Launch lifecycle | Pass/Fail/Skipped | ... |
| Login/OAuth | Pass/Fail/Skipped | ... |
| OpenAI | Pass/Fail/Skipped | ... |
| Anthropic/Claude | Pass/Fail/Skipped | ... |
| Workspace/files | Pass/Fail/Skipped | ... |
| Terminal/shell | Pass/Fail/Skipped | ... |
| Computer Use | Pass/Fail/Skipped | ... |
| Performance | Pass/Fail/Skipped | ... |
| Offline/reconnect | Pass/Fail/Skipped | ... |
| Logs/app data | Pass/Fail/Skipped | ... |
| Uninstall/reinstall | Pass/Fail/Skipped | ... |

## Detailed Observations
For each phase, include:
- Steps performed:
- Expected:
- Actual:
- Evidence:
- Logs/screenshots:

## Issues Found
For each issue:
### Issue N: Short title
- Severity: critical / high / medium / low
- Area: installer / auth / provider / terminal / performance / uninstall / UI / logs
- Reproduction steps:
- Expected:
- Actual:
- Evidence:
- Workaround:

## Performance Notes
- Idle CPU/RAM:
- Chat CPU/RAM:
- Launch timings:
- Subjective responsiveness:

## Paths And Logs
- App data paths:
- Install paths:
- Log paths:
- Relevant redacted log excerpts:

## Recommendations
- Should this build be shared with more testers? yes/no
- Must-fix before broader testing:
- Nice-to-have improvements:
- Suggested next machine/profile to test:

Completion criteria:
- The Markdown report exists on the Desktop.
- Every phase is marked Pass, Fail, or Skipped.
- Every failure includes reproduction steps and exact observed behavior.
- Secrets are redacted.
- You provide a short final message telling the user where the report was saved and the final verdict.
```

## After The Report Comes Back

1. Convert each critical/high issue into a GitHub issue.
2. Attach the report to the matching tracking issue.
3. Compare results with the local developer-machine test.
4. Repeat on a standard non-admin Windows user.
5. Repeat on a Windows profile path containing spaces and non-ASCII characters.
