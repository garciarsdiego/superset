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
5. Confirm the artifact includes `SHA256SUMS.txt`.

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
apps/desktop/release/SHA256SUMS.txt
```

The automated workflow generates `SHA256SUMS.txt` for `.exe`, `.blockmap`, and
`latest*.yml` files and uploads it with the installer artifact. For local
fallback builds, generate the checksum before sharing the installer:

```powershell
cd "C:\path\to\superset\apps\desktop\release"
Get-ChildItem -File |
  Where-Object { $_.Extension -in ".exe", ".blockmap", ".yml" } |
  Sort-Object Name |
  ForEach-Object {
    $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
    "{0}  {1}" -f $hash.Hash.ToLowerInvariant(), $_.Name
  } |
  Set-Content -LiteralPath .\SHA256SUMS.txt -Encoding ascii
```

Publish the checksum next to the installer and include this tester command in
release notes:

```powershell
cd "$env:USERPROFILE\Downloads"
$expected = (Select-String -Path .\SHA256SUMS.txt -Pattern 'Superset-.*-x64\.exe').Line.Split(' ')[0]
$actual = (Get-FileHash -Algorithm SHA256 -LiteralPath .\Superset-<version>-x64.exe).Hash.ToLowerInvariant()
if ($actual -ne $expected) { throw "Checksum mismatch" }
```

Experimental Windows artifacts built by the `Windows Experimental Installer`
workflow set `SUPERSET_EXPERIMENTAL_WINDOWS_BUILD=1`, which disables desktop
auto-update checks for that build. This prevents unsigned manual artifacts from
polling the upstream release channel for missing Windows `latest.yml` metadata.

For a local experimental package build, set the same flag before `prebuild`:

```powershell
$env:SUPERSET_EXPERIMENTAL_WINDOWS_BUILD = "1"
```

If only the electron-builder packaging step needs to be retried:

```powershell
cd "C:\path\to\superset"
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
bun run --cwd apps/desktop scripts/run-electron-builder.ts --publish never --win --x64
```

## 5. Smoke Test Installer

Before testing:

- Confirm the build is clearly labeled unsigned unless real code signing was
  configured for this release.
- Expect possible Windows SmartScreen, Defender, antivirus, or UAC warnings.
- Do not use production secrets, irreplaceable projects, or data that cannot be
  restored from backup.

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
- Unsigned-build warning and expected SmartScreen/Defender/UAC friction.
- Upstream base commit.
- Windows port commit.
- Installer artifact name and checksum.
- PowerShell SHA256 verification command.
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
- Confirm `SHA256SUMS.txt` is attached or the checksum is published in release
  notes.
- Confirm artifact came from the manual `Windows Experimental Installer`
  workflow or from a locally documented equivalent.
- Confirm known issues are explicit.
- Confirm README links point to the release.
- Confirm no secrets or local paths are included in release notes.

After publishing:

- Open or update a tracking issue for release feedback.
- Add release notes to `docs/windows-port-audit.md`.
- Announce with clear experimental wording.
