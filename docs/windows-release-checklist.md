# Windows Experimental Release Checklist

Use this checklist for fork releases from `windows-experimental`.

## 1. Confirm Base

Record:

- Upstream repository: `superset-sh/superset`
- Upstream base commit:
- Windows port commit:
- Release branch:
- Release tag:
- Windows version tested:

Commands:

```powershell
cd "C:\path\to\superset"
git fetch origin main
git status --short --branch
git rev-parse origin/main
git rev-parse HEAD
```

## 2. Validate Prerequisites

```powershell
cd "C:\path\to\superset"
bun -e "import { checkWindowsNativeBuildPrerequisites } from './apps/desktop/scripts/windows-native-build-prereqs.ts'; console.log(JSON.stringify(checkWindowsNativeBuildPrerequisites(), null, 2));"
```

Expected:

```json
{
  "checked": true,
  "missing": [],
  "ok": true
}
```

## 3. Run Tests

The automatic baseline is the `Windows Port CI` workflow:

- Pushes to `windows-experimental`.
- Pushes to `windows-native-port`.
- Pull requests targeting either branch.
- Manual `workflow_dispatch` runs.

It runs desktop typecheck and focused Windows port tests on `windows-latest`.

For local verification:

```powershell
cd "C:\path\to\superset"
bun run --cwd apps/desktop typecheck
bun test apps/desktop/src/main/lib/agent-setup/agent-wrappers.test.ts apps/desktop/scripts/windows-native-build-prereqs.test.ts apps/desktop/src/renderer/lib/terminal/launch-command.test.ts apps/desktop/src/renderer/lib/external-app-platforms.test.ts apps/desktop/src/renderer/lib/file-manager-labels.test.ts apps/desktop/src/renderer/lib/script-file-imports.test.ts
```

Add broader tests when the release touches host-service, pty-daemon, CLI, auth,
or installer behavior.

## 4. Build Installer

Preferred automated path:

1. Open GitHub Actions.
2. Select `Windows Experimental Installer`.
3. Run the workflow on `windows-experimental` or a specific SHA/tag.
4. Download `superset-windows-experimental-installer` from artifacts.

Local fallback:

```powershell
cd "C:\path\to\superset"
bun run --cwd apps/desktop install:deps
bun run --cwd apps/desktop prebuild
bun run --cwd apps/desktop build --win --x64
```

Expected:

```text
apps/desktop/release/Superset-<version>-x64.exe
```

If only the electron-builder packaging step needs to be retried:

```powershell
cd "C:\path\to\superset"
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
bun run --cwd apps/desktop scripts/run-electron-builder.ts --publish never --win --x64
```

## 5. Smoke Test Installer

Test:

- Fresh install.
- Reinstall over existing install.
- Optional uninstall/cleanup path.
- Launch after install.
- GitHub login.
- Open an existing project.
- Create a workspace.
- Run at least one supported agent CLI.
- Validate Claude/Codex notification hook behavior.
- Toggle diagnostic settings that affect analytics/updater/sync.

Capture:

- Screenshots for installer and first launch.
- Any Windows Defender/SmartScreen warnings.
- Logs for failed auth, terminal, or agent startup.

## 6. Draft Release Notes

Include:

- Experimental/unofficial disclaimer.
- Upstream base commit.
- Windows port commit.
- Installer artifact name and checksum.
- What changed.
- Known issues.
- Tests run.
- How to report bugs.

Suggested title:

```text
Windows Experimental Build <date>
```

## 7. Publish

Before publishing:

- Confirm artifact is attached.
- Confirm artifact came from the manual `Windows Experimental Installer`
  workflow or from a locally documented equivalent.
- Confirm known issues are explicit.
- Confirm README links point to the release.
- Confirm no secrets or local paths are included in release notes.

After publishing:

- Open or update a tracking issue for release feedback.
- Add release notes to `docs/windows-port-audit.md`.
- Announce with clear experimental wording.
