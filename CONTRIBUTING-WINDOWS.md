# Contributing to the Windows Experimental Channel

Thanks for helping validate Superset on Windows. This fork is intentionally
upstream-friendly: the best contributions make native Windows support easier to
review, test, release, and eventually maintain in the upstream project.

## Scope

Good changes usually fit one of these categories:

- Native Windows desktop runtime compatibility.
- Windows installer, uninstall, cleanup, or release behavior.
- Windows terminal, shell, process, path, or named-pipe behavior.
- Agent wrapper and notification-hook compatibility on Windows.
- Build, CI, release, or validation automation for Windows.
- Documentation that helps users install, test, or report useful bugs.

Avoid changes that:

- Rebrand the project as an official Windows edition.
- Remove or bypass upstream licensing, entitlement, or paid-feature controls.
- Create a long-term product fork unrelated to Windows parity.
- Change macOS/Linux behavior without a clear compatibility reason.

## Branches

- `windows-native-port` tracks the upstream PR-ready Windows port.
- `windows-experimental` is the public fork channel for docs, releases, issue
  templates, and experimental Windows packaging.
- `codex/*` branches are short-lived implementation branches.

Keep upstream-facing changes in `windows-native-port`. Keep fork-only
community/release operations in `windows-experimental`.

## Development Setup

Install:

- Bun
- Git and GitHub CLI
- Docker Desktop
- Caddy
- Visual Studio Build Tools 2022
- MSVC v143 C++ x64/x86 compiler tools
- MSVC v143 C++ x64/x86 Spectre-mitigated libraries
- Windows 10 or Windows 11 SDK

Run the native prerequisite preflight:

```powershell
cd "C:\path\to\superset"
bun -e "import { checkWindowsNativeBuildPrerequisites } from './apps/desktop/scripts/windows-native-build-prereqs.ts'; console.log(JSON.stringify(checkWindowsNativeBuildPrerequisites(), null, 2));"
```

## Validation Checklist

For most Windows port PRs, run the narrowest useful set:

```powershell
cd "C:\path\to\superset"
bun run --cwd apps/desktop typecheck
bun test apps/desktop/src/main/lib/agent-setup/agent-wrappers.test.ts apps/desktop/scripts/windows-native-build-prereqs.test.ts apps/desktop/src/renderer/lib/terminal/launch-command.test.ts apps/desktop/src/renderer/lib/external-app-platforms.test.ts apps/desktop/src/renderer/lib/file-manager-labels.test.ts apps/desktop/src/renderer/lib/script-file-imports.test.ts
```

For release candidates, also build the desktop app:

```powershell
cd "C:\path\to\superset"
bun run --cwd apps/desktop install:deps
bun run --cwd apps/desktop prebuild
bun run --cwd apps/desktop build --win --x64
```

## PR Expectations

Every PR should include:

- What changed.
- Why it is needed for Windows.
- Expected impact on macOS/Linux.
- Tests run.
- Screenshots or logs when the change affects installation, auth, terminal, or
  agent behavior.

Small PRs are strongly preferred. If a change spans multiple runtime areas,
split it into reviewable pieces when possible.

## Reporting Bugs

Use the Windows-specific issue templates when possible. The most useful reports
include:

- Superset build/version or commit SHA.
- Windows version.
- Install method.
- Shell and terminal involved.
- Agent/provider involved, if any.
- Exact command/log/error output.
- Whether the issue reproduces after restart or reinstall.

See `docs/windows-triage.md` for labels, milestones, and the public roadmap
tracking issues.
