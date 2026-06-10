# Windows Experimental Triage

This document describes how the fork uses GitHub Issues, labels, milestones,
and Projects to keep the Windows experimental channel organized.

## Issue Intake

Use the Windows-specific templates for:

- Windows bugs.
- Installer issues.
- Agent/provider issues.
- Performance reports.
- Upstream parity gaps.

Ask for a smaller reproduction when reports do not include build, Windows
version, install method, steps, logs, or screenshots.

## Labels

Area labels:

- `windows`: Windows-specific work for the experimental port.
- `installer`: Installer, uninstall, cleanup, and launch-after-install.
- `auth`: Login, provider auth, account, and session behavior.
- `terminal`: Terminal, pty, shell launch, ConPTY, and command execution.
- `agent-wrapper`: Agent CLI wrappers, hooks, notification scripts, and provider runtime setup.
- `performance`: Startup, sync, terminal, installer, CPU, or memory performance.
- `ci`: GitHub Actions, automation, build matrix, or validation workflow.
- `release`: Experimental release notes, artifacts, checklist, or publish workflow.
- `security`: Security-sensitive Windows fork behavior or disclosure handling.

Flow labels:

- `triage`: Needs classification, prioritization, or routing.
- `needs-repro`: Needs a minimal reproduction, logs, or environment details.
- `good-first-test`: Good for contributors who can test or verify on Windows.
- `blocked-upstream`: Blocked by an upstream change, decision, issue, or release.
- `upstream-parity`: Behavior gap between Windows fork and upstream Superset.

Keep labels factual. Avoid using labels as commentary.

## Milestones

- `v0.1 Experimental Installer`: first usable Windows experimental installer.
- `v0.2 Runtime Parity`: core Windows behavior parity across auth, terminal, agents, workspaces, sync, and settings.
- `v0.3 CI + Release Automation`: automated validation, build artifacts, and release flow.
- `v1.0 Upstream Candidate`: low-drift, documented, tested, maintainable port ready for upstream adoption discussion.

Milestones intentionally do not have due dates until the release process is
repeatable.

## Tracking Issues

Public roadmap trackers:

- https://github.com/garciarsdiego/superset/issues/1
- https://github.com/garciarsdiego/superset/issues/2
- https://github.com/garciarsdiego/superset/issues/3
- https://github.com/garciarsdiego/superset/issues/4

Use these as parent discussion points. Link specific bug reports or PRs from the
appropriate tracker.

## GitHub Project

The repository has Issues and Projects enabled.

Project board:

- https://github.com/users/garciarsdiego/projects/1

The board starts with the four roadmap tracking issues and these fields:

- Status: Todo, In Progress, Done.
- Area: Installer, Auth, Terminal, Agent, Performance, CI, Release, Docs, Upstream.
- Priority: P0, P1, P2, P3.
- Upstream impact: Fork only, Upstream candidate, Blocked upstream.

Suggested views:

- Roadmap by milestone.
- Triage by label.
- Release readiness.
- Upstream parity.

If a new maintainer needs to manage Projects through GitHub CLI, authorize the
local token once:

```powershell
gh auth refresh -s project
```
