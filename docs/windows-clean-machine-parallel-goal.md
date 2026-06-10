# Windows Clean Machine Parallel `/goal`

Copy the block below into Codex 2 on the clean Windows test machine. It is
designed for a coordinator agent using subagents to increase coverage and speed
without letting multiple agents fight over the same desktop UI.

```text
/goal Run a coordinated, subagent-assisted clean-machine validation of the experimental Windows port of Superset. Use Computer Use for real UI workflows, PowerShell for environment/log/process checks, and subagents for independent test domains. Produce a complete evidence-backed Markdown report at `%USERPROFILE%\Desktop\superset-windows-clean-machine-report.md` and per-domain subagent notes under `%USERPROFILE%\Desktop\superset-windows-test-evidence`.

Context:
- This is an unofficial experimental Windows port of Superset.
- Treat the test as release smoke testing for a Windows installer.
- The machine should be considered a clean user environment.
- Use the actual installed app. Do not inspect or modify Superset source code.
- Use Computer Use for UI workflows when available.
- Use PowerShell for system inspection, logs, files, timings, and process checks.
- Redact all secrets: API keys, OAuth tokens, cookies, account identifiers, email addresses if needed, and credential-like values.
- Continue independent test phases even if one phase fails.

Critical coordination rule:
- Computer Use controls a shared desktop and must be treated as a single-writer resource.
- Do not let multiple subagents click/type/control the desktop at the same time.
- The coordinator owns the UI lock.
- Subagents may request UI observations, but only the coordinator performs or authorizes UI actions.
- Subagents can run independent PowerShell inspection, analyze logs, draft report sections, and reason about failures in parallel.

If Computer Use fails:
- Record the exact Computer Use bootstrap/plugin error.
- Mark only the Computer Use/desktop automation phase as `Blocked by test environment`.
- Continue all other Superset tests using manual UI instructions plus PowerShell.
- Treat package/export/bootstrap errors from Codex plugins as Codex test-environment failures unless Superset directly triggered them.

Workspace for evidence:
1. Create:
   `%USERPROFILE%\Desktop\superset-windows-test-evidence`
2. Save subagent notes there:
   - `00-coordinator-log.md`
   - `01-environment-installer.md`
   - `02-auth-providers.md`
   - `03-workspace-terminal-hooks.md`
   - `04-performance-reliability.md`
   - `05-uninstall-logs-security.md`
3. Save screenshots there if easy:
   - `screenshots\`
4. Save redacted command outputs there if useful:
   - `commands\`

Coordinator responsibilities:
1. Create and maintain `00-coordinator-log.md`.
2. Spawn subagents for independent domains.
3. Own all Computer Use UI interactions unless explicitly safe.
4. Assign each subagent a narrow scope and expected output file.
5. Merge subagent findings into the final report.
6. Ensure every phase is marked Pass, Fail, Skipped, or Blocked by test environment.
7. Ensure every failure has reproduction steps, expected behavior, actual behavior, severity, and evidence.
8. Ensure secrets are redacted before finalizing.

Recommended subagents:

Subagent A: Environment And Installer
Scope:
- Windows version/build, hardware, user path, install state.
- Installer file/path.
- Installation behavior, SmartScreen, Defender, UAC, install duration.
- Start Menu/Desktop shortcut presence.

Allowed actions:
- PowerShell inspection.
- Ask coordinator for UI observations during installer flow.

Output:
- `%USERPROFILE%\Desktop\superset-windows-test-evidence\01-environment-installer.md`

Subagent B: Auth And Providers
Scope:
- Login/OAuth callback.
- Session persistence.
- Logout/sign-in again if available.
- OpenAI provider smoke test.
- Anthropic/Claude provider smoke test.
- Specifically watch for:
  `Not logged in to Anthropic. Run /login first.`
  `ERR_CONNECTION_REFUSED`

Allowed actions:
- Ask coordinator to perform UI/provider actions.
- Analyze logs and settings states.
- Prepare redacted findings.

Output:
- `%USERPROFILE%\Desktop\superset-windows-test-evidence\02-auth-providers.md`

Subagent C: Workspace, Terminal, And Hooks
Scope:
- Create/open test workspace:
  `%USERPROFILE%\Desktop\superset-smoke-project`
- File writes/reads through the app.
- Terminal/shell behavior.
- PowerShell/cmd command execution.
- Hook errors involving `.cmd`, Bash, `SUPERSET_HOME_DIR`, parentheses, or Windows shell syntax.

Allowed actions:
- PowerShell commands.
- Ask coordinator for app/terminal UI actions.
- Inspect created files.

Output:
- `%USERPROFILE%\Desktop\superset-windows-test-evidence\03-workspace-terminal-hooks.md`

Subagent D: Performance And Reliability
Scope:
- Launch timings.
- Idle CPU/RAM.
- CPU/RAM during chat.
- UI responsiveness.
- Background processes: Superset, Electron, Docker, antivirus/indexing if visible.
- Short stability soak while switching settings/chat/workspace/terminal.
- Offline/reconnect behavior if practical.

Allowed actions:
- PowerShell process sampling.
- Ask coordinator to perform UI navigation and chat prompts.
- Record subjective plus measured performance.

Output:
- `%USERPROFILE%\Desktop\superset-windows-test-evidence\04-performance-reliability.md`

Subagent E: Uninstall, Logs, App Data, And Security Hygiene
Scope:
- App data/log locations:
  `%APPDATA%`
  `%LOCALAPPDATA%`
  `%USERPROFILE%\.superset`
  install directory
- Redacted log excerpts for failures.
- Uninstall/reinstall behavior.
- Cleanup option behavior.
- Check whether sampled logs contain obvious secrets.
- Record unsigned-build warnings without treating expected unsigned warnings as fatal.

Allowed actions:
- PowerShell file/process inspection.
- Ask coordinator for uninstall/reinstall UI actions after other phases complete.
- Do not manually delete app data unless the installer/uninstaller explicitly offers cleanup and the coordinator approves.

Output:
- `%USERPROFILE%\Desktop\superset-windows-test-evidence\05-uninstall-logs-security.md`

Execution order:

Phase 0: Evidence Setup
- Coordinator creates the evidence folder.
- Coordinator starts `00-coordinator-log.md`.
- Coordinator records start time.
- Coordinator checks whether subagent support is available.
- If subagents are unavailable, run the same domains sequentially and state that in the report.

Phase 1: Dispatch Read-Only Subagents
- Start Subagent A, D, and E first because they can collect system/process/path data mostly without UI.
- In parallel, coordinator verifies Computer Use availability.
- If Computer Use is unavailable, record the exact error and continue.

Phase 2: Installer And Launch
- Coordinator performs UI actions.
- Subagent A records installer/install evidence.
- Subagent D records launch timing.

Tests:
1. If Superset is not installed, run the installer using default options.
2. Observe SmartScreen, Defender, antivirus, and UAC.
3. Confirm install completion.
4. Launch from Start Menu.
5. Launch from desktop shortcut if present.
6. Close and relaunch.
7. Reboot once if practical; otherwise mark skipped with reason.

Pass criteria:
- Install completes.
- App launches to a usable window.
- Relaunch works.
- No permanent blank window or crash loop.

Phase 3: Auth And Provider Workflows
- Start or continue Subagent B.
- Coordinator performs actual UI login/provider flows.
- Subagent B records observations and exact failures.
- Subagent D records provider latency/performance.

Tests:
1. Sign in with GitHub or available supported provider.
2. Complete OAuth in browser.
3. Confirm app receives local callback.
4. Quit and relaunch.
5. Confirm session persists.
6. Sign out and sign in again if UI supports it.
7. Configure OpenAI.
8. Send:
   `Say exactly: OpenAI provider smoke test OK`
9. Configure Anthropic/Claude.
10. Send:
   `Say exactly: Claude provider smoke test OK`
11. Restart Superset and send one short prompt through each configured provider.

Pass criteria:
- OAuth completes without local callback refusal.
- Settings active state matches chat usability.
- OpenAI works.
- Claude works or failure is clearly documented.
- Sessions persist after restart.

Phase 4: Workspace, Files, Terminal, Hooks
- Start or continue Subagent C.
- Coordinator performs UI actions where needed.
- Subagent C performs PowerShell verification.

Tests:
1. Create:
   `%USERPROFILE%\Desktop\superset-smoke-project`
2. Open it in Superset if supported.
3. Ask the agent/app to create `hello.txt` with:
   `Superset Windows smoke test OK`
4. Ask it to create a minimal `index.html`.
5. Verify files exist and contents are correct with PowerShell.
6. Open app terminal if available.
7. Run:
   `Get-Location`
   `Get-Date`
   `echo SUPERSET_WINDOWS_SMOKE_OK`
   `git --version` if Git is installed
   `node --version` if Node is installed
8. If both PowerShell and cmd are available, test both.
9. Watch for hook errors, especially Bash trying to parse Windows `.cmd` syntax.

Pass criteria:
- Workspace opens.
- File reads/writes work.
- Terminal commands execute.
- Windows paths with spaces work.
- No `.cmd` hook is incorrectly parsed by Bash.

Phase 5: Computer Use / Desktop Automation
- Coordinator owns this phase.
- Subagent D may observe/report.

Tests:
1. Ask the app/agent to open Notepad.
2. Type:
   `Superset Computer Use smoke test OK`
3. Close Notepad without saving.
4. Identify one visible window title.

Pass criteria:
- Desktop control works.
- Correct window receives input.
- Permission prompts are understandable.

If blocked:
- Record exact plugin/bootstrap error.
- Mark phase as `Blocked by test environment`, not Superset failure.

Phase 6: Performance, Reliability, Offline/Reconnect
- Subagent D leads measurement.
- Coordinator performs UI prompts/navigation.

Tests:
1. Measure idle CPU/RAM for Superset-related processes.
2. Send three short chat prompts in a row.
3. Switch among settings, chat, workspace/project, terminal, provider settings.
4. Observe responsiveness for at least 5 minutes.
5. Check for heavy background processes.
6. If practical, disconnect internet temporarily.
7. Observe offline behavior.
8. Reconnect and retry provider request.

Pass criteria:
- UI remains usable.
- No runaway idle CPU/RAM.
- Offline errors are understandable.
- Reconnect recovers without reinstall.

Phase 7: Logs, App Data, Security Hygiene
- Subagent E leads.

Tests:
1. Locate relevant data/log paths.
2. Collect redacted excerpts for failures.
3. Check sampled logs for obvious unredacted secrets.
4. Record install directory and app data directories.

Pass criteria:
- Logs/data paths are discoverable.
- Failure logs are useful.
- No obvious secrets in sampled report excerpts.

Phase 8: Uninstall / Reinstall
- Run after core functionality tests.
- Coordinator performs UI uninstall/reinstall.
- Subagent E records results.

Tests:
1. Uninstall through Windows Apps settings or normal uninstaller.
2. Record whether cleanup/data removal option exists.
3. If offered by installer/uninstaller, test cleanup option.
4. Reinstall from same installer.
5. Launch Superset again.
6. Record whether previous session/provider data remains.

Pass criteria:
- Uninstall completes.
- Reinstall completes.
- App launches after reinstall.
- Cleanup/preservation behavior is clear.

Subagent output requirements:
Each subagent note must include:
- Scope.
- Commands/actions performed.
- Pass/fail/skipped/blocker summary.
- Evidence paths.
- Issues found.
- Exact errors.
- Redaction note.
- Recommendations.

Final report requirements:
Create `%USERPROFILE%\Desktop\superset-windows-clean-machine-report.md` with:

# Superset Windows Clean Machine Test Report

## Summary
- Final verdict: Ready for broader experimental testers / Usable with known issues / Blocked by critical issue
- Overall pass/fail:
- Total test duration:
- Top 3 risks:
- Computer Use status:
- Subagents used:

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
| Phase | Result | Owner | Notes |
| --- | --- | --- | --- |
| Evidence setup | Pass/Fail/Skipped | Coordinator | ... |
| Installation | Pass/Fail/Skipped | Subagent A | ... |
| Launch lifecycle | Pass/Fail/Skipped | A/D | ... |
| Login/OAuth | Pass/Fail/Skipped | Subagent B | ... |
| OpenAI | Pass/Fail/Skipped | Subagent B | ... |
| Anthropic/Claude | Pass/Fail/Skipped | Subagent B | ... |
| Workspace/files | Pass/Fail/Skipped | Subagent C | ... |
| Terminal/hooks | Pass/Fail/Skipped | Subagent C | ... |
| Computer Use | Pass/Fail/Blocked | Coordinator/D | ... |
| Performance | Pass/Fail/Skipped | Subagent D | ... |
| Offline/reconnect | Pass/Fail/Skipped | Subagent D | ... |
| Logs/app data/security | Pass/Fail/Skipped | Subagent E | ... |
| Uninstall/reinstall | Pass/Fail/Skipped | Subagent E | ... |

## Detailed Findings
For each phase:
- Steps performed:
- Expected:
- Actual:
- Evidence:
- Logs/screenshots:

## Issues Found
For each issue:
### Issue N: Short title
- Severity: critical / high / medium / low
- Area: installer / auth / provider / terminal / hooks / performance / uninstall / UI / logs / test-environment
- Reproduction steps:
- Expected:
- Actual:
- Evidence:
- Workaround:
- Suggested GitHub labels:

## Performance Notes
- Cold launch time:
- Warm launch time:
- Idle CPU/RAM:
- Chat CPU/RAM:
- UI responsiveness:
- Background process observations:

## Paths And Evidence
- Evidence folder:
- Subagent notes:
- Screenshot paths:
- App data paths:
- Install paths:
- Log paths:
- Redacted log excerpts:

## Recommendations
- Should this build be shared with more testers? yes/no
- Must-fix before broader testing:
- Nice-to-have improvements:
- Suggested next machine/profile to test:

Completion criteria:
- Final report exists on Desktop.
- Evidence folder exists on Desktop.
- Every phase has Pass, Fail, Skipped, or Blocked status.
- Every failure has exact observed behavior and reproduction steps.
- Secrets are redacted.
- Subagent notes are included or the report explains why subagents were unavailable.
- Final message to the user states the final verdict and report path.
```

## Notes For The Human Tester

- If the coordinator asks you to perform manual UI steps because Computer Use is
  unavailable, do them slowly and report exactly what you see.
- Use disposable accounts/keys where possible.
- Do not share full tokens, cookies, or provider keys back into GitHub issues.
- Bring back both the final report and the evidence folder if possible.
