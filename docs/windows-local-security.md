# Windows Experimental Port: Local Security Notes

This document is a public-safe threat model for local credentials and control
channels used by the experimental Windows build. It is intended for testers and
maintainers; do not paste raw local app data into issues or PR comments.

## Scope

The Windows build runs the same local desktop architecture as the other desktop
builds: the Electron app coordinates local helper processes over loopback
network endpoints, named pipes, or local sockets. Those helpers are protected by
high-entropy local bearer tokens stored under the user's Superset home directory.

The intended security boundary is the current operating-system user profile.
This model is not designed to protect against malware, administrator access,
debuggers, process injection, or another account that can already read the
current user's profile.

## Files That May Contain Local Secrets

Treat the following as sensitive and do not attach them raw to public issues:

- `%USERPROFILE%\.superset\host\<organizationId>\manifest.json`
  - Written by the desktop host-service manifest code at
    `apps/desktop/src/main/lib/host-service-manifest.ts`.
  - Written by the CLI host launcher at `packages/cli/src/lib/host/manifest.ts`.
  - May contain a local loopback endpoint, process id, organization id, start
    time, and a local host-service bearer token.
- `%USERPROFILE%\.superset\host\<organizationId>\pty-daemon-manifest.json`
  - Written by `packages/host-service/src/daemon/manifest.ts`.
  - May contain daemon process/socket state and handoff metadata.
- `%USERPROFILE%\.superset\terminal-host.token`
  - Written by `apps/desktop/src/main/terminal-host/auth-token.ts`.
  - Contains the local terminal-host IPC token.
- Per-organization logs such as `host-service.log`
  - Should not contain API keys or local bearer tokens, but can include local
    paths, process ids, command environment context, and error details.

## Current Hardening

- Superset home directories are created with private-directory intent
  (`0700`) where the runtime/platform supports POSIX-style modes.
- Local token and manifest files are created with private-file intent (`0600`).
- Existing manifest/token files are now chmod-repaired after write or read in
  the Windows experimental port code paths where a stale file could have been
  created with weaker permissions.
- Terminal-host parse-error logs redact token-like key/value pairs before
  logging malformed NDJSON previews.

On Windows, Node's `mode`/`chmod` behavior does not provide a complete ACL
model. Windows testers should rely on the user profile boundary and avoid
sharing raw files from `%USERPROFILE%\.superset`. A future hardening pass may add
explicit Windows ACL validation if upstream maintainers want stronger local-user
isolation guarantees.

## Safe Diagnostic Sharing

When reporting Windows port bugs:

- Prefer screenshots of app UI, installer logs, and command output with secrets
  redacted.
- Replace any token, API key, bearer value, cookie, or `sk-...` value with
  `[REDACTED]`.
- Replace local usernames and private project paths if they are not necessary to
  reproduce the bug.
- Do not upload the full `.superset` directory.
- Do not paste full `manifest.json`, `pty-daemon-manifest.json`, or
  `terminal-host.token` contents.
- It is usually safe to share whether a file exists, its redacted path shape, and
  the failing command/error message.

## Issue #7 Decision Status

This pass closes the obvious low-risk parity gap by normalizing private file
modes after writes for desktop host-service manifests, pty-daemon manifests, and
terminal-host tokens. It does not claim that POSIX modes are equivalent to
Windows ACL hardening. Keep issue #7 open if the next decision is whether to add
Windows-specific ACL checks or an automated redacted diagnostics exporter.
