import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const TEST_HOME = path.join(os.tmpdir(), `desktop-host-manifest-test-${process.pid}`);
const TEST_ORG = "org-host-manifest-test";

process.env.SUPERSET_HOME_DIR = TEST_HOME;

const {
	manifestDir,
	readManifest,
	removeManifest,
	writeManifest,
} = await import("./host-service-manifest");

function manifestPath(): string {
	return path.join(manifestDir(TEST_ORG), "manifest.json");
}

function fileMode(filePath: string): number {
	return fs.statSync(filePath).mode & 0o777;
}

function baseManifest() {
	return {
		pid: 12345,
		endpoint: "http://127.0.0.1:49152",
		authToken: "manifest-secret",
		startedAt: 1700000000000,
		organizationId: TEST_ORG,
	};
}

beforeEach(() => {
	fs.rmSync(TEST_HOME, { recursive: true, force: true });
	fs.mkdirSync(TEST_HOME, { recursive: true });
});

afterEach(() => {
	removeManifest(TEST_ORG);
	fs.rmSync(TEST_HOME, { recursive: true, force: true });
});

describe("HostServiceManifest", () => {
	test("write + read round-trips required fields", () => {
		writeManifest(baseManifest());
		expect(readManifest(TEST_ORG)).toEqual(baseManifest());
	});

	test("writes private manifest files where POSIX modes are supported", () => {
		writeManifest(baseManifest());

		expect(fs.existsSync(manifestPath())).toBe(true);
		if (process.platform !== "win32") {
			expect(fileMode(manifestDir(TEST_ORG))).toBe(0o700);
			expect(fileMode(manifestPath())).toBe(0o600);
		}
	});

	test("repairs an existing manifest file mode where POSIX modes are supported", () => {
		fs.mkdirSync(manifestDir(TEST_ORG), { recursive: true, mode: 0o777 });
		fs.writeFileSync(manifestPath(), JSON.stringify(baseManifest()), {
			mode: 0o666,
		});

		writeManifest({ ...baseManifest(), pid: 67890 });

		expect(readManifest(TEST_ORG)?.pid).toBe(67890);
		if (process.platform !== "win32") {
			expect(fileMode(manifestPath())).toBe(0o600);
		}
	});
});
