# Windows Shell And Hook Expectations

The native Windows port should not require Bash, WSL, or Git Bash for normal
desktop use. Those shells are supported when the user chooses them, but Windows
defaults should work with Windows-native shells and app-generated `.cmd` hooks.

## Supported Shells

- PowerShell Desktop: `powershell.exe`
- PowerShell 7+: `pwsh.exe`
- Command Prompt: `cmd.exe`
- WSL shells: only when WSL is installed and selected by the user
- Git Bash/MSYS shells: only when installed and selected by the user

Do not assume `bash.exe` is on `PATH` for packaged Windows builds.

## Agent Notification Hooks

On Windows, Superset writes:

- `%USERPROFILE%\.superset\hooks\notify.cmd`
- `%USERPROFILE%\.superset\hooks\notify.mjs`

`notify.cmd` is the Windows-native entrypoint. It:

- Uses batch `set "NAME=value"` syntax so paths with spaces or parentheses are
  preserved.
- Prefers the packaged Electron executable as the Node runtime with
  `ELECTRON_RUN_AS_NODE=1`.
- Allows `SUPERSET_NOTIFY_NODE` to override the Node runtime for diagnostics.
- Falls back to adjacent packaged Node paths or `node.exe` on `PATH`.
- Invokes `notify.mjs`, which performs the actual JSON parsing and hook dispatch.

Non-Windows builds continue to use the POSIX `notify.sh` hook.

## Smoke Checks

For a Windows packaged build:

1. Confirm `notify.cmd` exists under `%USERPROFILE%\.superset\hooks`.
2. Confirm the file contains `set "NODE_EXE=...Superset.exe"` or a valid
   diagnostic override path.
3. Confirm paths with spaces, such as `C:\Program Files\Superset\Superset.exe`,
   remain quoted with batch `set "NAME=value"` syntax.
4. Launch a Claude/Codex agent from Superset and verify hook events arrive in
   the app without requiring WSL/Git Bash.

If a user explicitly selects Git Bash or WSL, failures should be triaged as that
shell integration path, not as the native Windows default.
