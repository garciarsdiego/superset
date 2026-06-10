# Security Policy

This fork is an unofficial experimental Windows channel for Superset Desktop.

## Reporting a Vulnerability

Do not open a public issue for vulnerabilities, secrets, tokens, private logs,
or exploits.

For vulnerabilities that also affect the upstream project, report them to the
upstream Superset project first:

https://github.com/superset-sh/superset/security

For Windows-fork-specific issues such as installer behavior, local file
handling, shell quoting, path traversal, process cleanup, or credential leakage
that appears unique to this fork, contact the fork maintainer privately through
GitHub before publishing details.

## Experimental Builds

Windows artifacts from this fork may be unsigned. Treat them as experimental:

- Download installers only from this repository's Releases page.
- Verify the release notes and artifact name before installing.
- Do not paste API keys, auth tokens, private logs, or credentials into public
  issues.
- Prefer redacted logs when reporting installer, auth, terminal, or agent
  behavior.

## Scope

This fork does not remove or bypass upstream licensing, entitlement, or
paid-feature controls. Reports asking for bypasses are out of scope.
