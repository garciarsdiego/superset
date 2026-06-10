import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const TOKEN_FILE_MODE = 0o600;

function repairTokenFileMode(tokenPath: string): void {
	try {
		chmodSync(tokenPath, TOKEN_FILE_MODE);
	} catch {
		// Best-effort hardening; Windows may rely on profile ACLs instead.
	}
}

export function ensureAuthToken(
	tokenPath: string,
	logInfo: (message: string) => void = () => {},
): string {
	if (existsSync(tokenPath)) {
		repairTokenFileMode(tokenPath);
		return readFileSync(tokenPath, "utf-8").trim();
	}

	const token = randomBytes(32).toString("hex");
	writeFileSync(tokenPath, token, { mode: TOKEN_FILE_MODE });
	repairTokenFileMode(tokenPath);
	logInfo("Generated new auth token");
	return token;
}
