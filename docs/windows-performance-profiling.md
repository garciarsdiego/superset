# Windows Performance Profiling

Use this procedure when a Windows tester reports slow launch, high idle CPU, or
high aggregate memory in the experimental desktop build.

## What To Measure

Capture three windows:

1. Cold launch: start Superset after a reboot or after all Superset processes
   have exited.
2. Warm relaunch: quit and reopen Superset after the first successful launch.
3. Idle: leave the app open for 60 seconds after the main window is usable.

Record:

- Time from launch to a targetable main window.
- Time from login to first usable project/workspace view.
- Whether the build has updater checks disabled by
  `SUPERSET_EXPERIMENTAL_WINDOWS_BUILD=1` or `SUPERSET_DISABLE_AUTO_UPDATE=1`.
- Whether analytics, cloud sync, or Electric sync diagnostic toggles are enabled.
- Visible child process roles: main/packaged process, renderers, GPU/utility
  helpers, host-service, terminal-host, pty-daemon, shell/agent child processes.

## Sampling Command

From the repository root on the test machine:

```powershell
cd "C:\path\to\superset"
powershell.exe -ExecutionPolicy Bypass -File .\scripts\windows-sample-performance.ps1 -Samples 12 -IntervalSeconds 5
```

The script writes:

- `superset-process-samples-<timestamp>.csv`
- `superset-process-summary-<timestamp>.md`

By default both files go to:

```text
%USERPROFILE%\Desktop\superset-performance-samples
```

The script redacts token-like command-line key/value pairs, but testers should
still inspect output before sharing it publicly.

## Process Attribution

Use these roles when triaging samples:

- `main-or-packaged`: Electron app process and startup orchestration.
- `renderer`: UI windows/web contents.
- `gpu` and `utility`: Chromium helpers.
- `host-service`: local service for v2 project/workspace operations.
- `terminal-host`: v1 persistent terminal host.
- `pty-daemon`: host-service PTY backend.
- `node-helper`: Node/Bun helpers spawned by the app or local development.
- `related`: child processes that are part of the Superset process tree but do
  not match a more specific role.

## Current Triage Notes

- Updater churn is a known possible source of noise for unsigned Windows
  artifacts. Experimental Windows installer builds now set
  `SUPERSET_EXPERIMENTAL_WINDOWS_BUILD=1`, which disables desktop auto-update
  checks on Windows.
- The clean-machine report showed a warm relaunch around 4.4 seconds, but also
  reported high aggregate memory and sustained CPU. That needs a fresh sample on
  the affected machine before deciding whether the cause is Electron/Chromium,
  host-service/pty-daemon, terminal startup, sync, analytics, or agent child
  processes.
- Local Docker/Caddy development services are not part of packaged desktop
  startup. If they appear in Task Manager during a packaged-build test, record
  them separately from Superset's process tree.

## Report Template

```text
Build/version:
Installer source:
Unsigned warning observed: yes/no
Updater disabled by experimental flag: yes/no/unknown
Analytics diagnostic toggle: on/off
Cloud sync diagnostic toggle: on/off
Electric sync diagnostic toggle: on/off
Cold launch time:
Warm launch time:
Idle CPU after 60s:
Largest role by memory:
Largest role by CPU/task manager observation:
Attached files: redacted summary md, optional redacted csv
```
