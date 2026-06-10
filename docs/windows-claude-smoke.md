# Windows Claude Smoke Test

Use this when validating the Anthropic/Claude path on a Windows experimental
build. The app has two related but separate Claude surfaces:

- **Model provider auth**: Settings > Models > Anthropic. This controls the
  desktop chat/model provider runtime.
- **Claude Code agent CLI auth**: the `claude` command used in terminal/agent
  panes. This is controlled by Claude Code itself and may still require
  `claude /login` or `claude login` in that CLI environment.

Seeing Anthropic marked `Active` in Settings means the model-provider status is
connected. It does not guarantee that a separately launched Claude Code CLI
session is logged in.

## Preconditions

- Install the Windows experimental build.
- Sign in to Superset normally.
- Use a test project/workspace and avoid production secrets.
- Confirm `claude --version` works in a normal PowerShell session.

## Provider Auth Smoke

1. Open Settings > Models.
2. For Anthropic, sign in with Claude or save a valid Anthropic API key.
3. Confirm the Anthropic row shows `Active`.
4. Open the built-in chat/model picker and select an Anthropic model.
5. Send a harmless prompt such as:

   ```text
   Reply with the exact text: windows claude provider smoke ok
   ```

6. If this fails, capture the visible error and whether Settings still says
   `Active`.

## Claude Code Agent Smoke

1. Open a workspace terminal or agent pane that launches Claude Code.
2. Run:

   ```powershell
   claude --version
   ```

3. Ask Claude Code a harmless prompt.
4. If the terminal says `Not logged in to Anthropic. Run /login first.`, run the
   Claude Code login flow inside that CLI environment and retry.
5. Record whether Settings > Models > Anthropic remained `Active` while the CLI
   still required login. That points to CLI auth state, not model-provider auth.

## What To Attach

- Screenshot of Settings > Models with secrets obscured.
- The exact surface that failed: built-in chat/model picker or Claude Code agent
  terminal.
- Redacted error text.
- Output of `claude --version`.
- Whether `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, or Bedrock env vars were
  configured, without sharing their values.
