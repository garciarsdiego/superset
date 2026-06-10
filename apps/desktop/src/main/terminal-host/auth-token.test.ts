import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureAuthToken } from "./auth-token";

let testDir: string | null = null;

function makeTokenPath(): string {
	testDir = mkdtempSync(join(tmpdir(), "terminal-host-token-test-"));
	return join(testDir, "terminal-host.token");
}

function fileMode(path: string): number {
	return statSync(path).mode & 0o777;
}

afterEach(() => {
	if (testDir) {
		rmSync(testDir, { recursive: true, force: true });
		testDir = null;
	}
});

describe("ensureAuthToken", () => {
	test("creates a high-entropy token file and avoids logging the token", () => {
		const tokenPath = makeTokenPath();
		const messages: string[] = [];

		const token = ensureAuthToken(tokenPath, (message) => messages.push(message));

		expect(token).toMatch(/^[a-f0-9]{64}$/);
		expect(readFileSync(tokenPath, "utf-8")).toBe(token);
		expect(messages).toEqual(["Generated new auth token"]);
		expect(messages.join("\n")).not.toContain(token);
		if (process.platform !== "win32") {
			expect(fileMode(tokenPath)).toBe(0o600);
		}
	});

	test("reuses existing token and repairs permissions where supported", () => {
		const tokenPath = makeTokenPath();
		writeFileSync(tokenPath, "existing-token\n", { mode: 0o666 });

		const token = ensureAuthToken(tokenPath);

		expect(token).toBe("existing-token");
		if (process.platform !== "win32") {
			expect(fileMode(tokenPath)).toBe(0o600);
		}
	});
});
