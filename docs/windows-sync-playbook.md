# Windows Port Upstream Sync Playbook

Use this playbook to keep the Windows port close to `superset-sh/main`.

## Goals

- Minimize long-lived drift from upstream.
- Resolve conflicts while preserving upstream behavior.
- Keep the upstream PR branch clean.
- Keep fork-only release/community docs out of the upstream PR branch.

## Branch Roles

- `windows-native-port`: upstream PR branch.
- `windows-experimental`: fork release/community branch.
- `codex/*`: short-lived work branches.

## Weekly Sync

```powershell
cd "C:\path\to\superset"
git switch windows-native-port
git fetch origin main
git fetch fork windows-native-port
git status --short --branch
git rev-list --left-right --count windows-native-port...origin/main
```

If upstream has moved, create a local backup:

```powershell
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
git branch "codex/backup-windows-native-port-$stamp" windows-native-port
```

Rebase the upstream PR branch:

```powershell
git rebase origin/main
```

Resolve conflicts with this bias:

- Preserve upstream behavior unless Windows requires otherwise.
- Keep Windows adaptations narrowly scoped.
- Avoid fork-only messaging or release docs in `windows-native-port`.
- Add/update tests when conflict resolution changes behavior.

Continue:

```powershell
git add <resolved-files>
$env:GIT_EDITOR = "true"
git rebase --continue
```

Validate:

```powershell
bun run --cwd apps/desktop typecheck
bun test apps/desktop/src/main/lib/agent-setup/agent-wrappers.test.ts apps/desktop/scripts/windows-native-build-prereqs.test.ts apps/desktop/src/renderer/lib/terminal/launch-command.test.ts apps/desktop/src/renderer/lib/external-app-platforms.test.ts apps/desktop/src/renderer/lib/file-manager-labels.test.ts apps/desktop/src/renderer/lib/script-file-imports.test.ts
```

Push:

```powershell
git push --force-with-lease fork windows-native-port
```

## Update Experimental Branch

After `windows-native-port` is healthy:

```powershell
git switch windows-experimental
git rebase windows-native-port
git push --force-with-lease fork windows-experimental
```

If fork-only docs conflict, keep the fork docs on `windows-experimental` and do
not copy them back to `windows-native-port`.

## PR Hygiene

After every sync, update the upstream draft PR with:

- Upstream base commit.
- Conflict resolution notes.
- Tests run.
- Remaining known issues.

Use CodeRabbit only after the branch is conflict-free:

```text
@coderabbitai full review
```
