import { describe, expect, test } from "bun:test";
import {
	isTruthyRuntimeFlag,
	shouldDisableAutoUpdate,
} from "./desktop-runtime-flags";

describe("isTruthyRuntimeFlag", () => {
	test("accepts common truthy string values", () => {
		expect(isTruthyRuntimeFlag("1")).toBe(true);
		expect(isTruthyRuntimeFlag("true")).toBe(true);
		expect(isTruthyRuntimeFlag(" YES ")).toBe(true);
	});

	test("rejects falsey or missing values", () => {
		expect(isTruthyRuntimeFlag(undefined)).toBe(false);
		expect(isTruthyRuntimeFlag("")).toBe(false);
		expect(isTruthyRuntimeFlag("0")).toBe(false);
		expect(isTruthyRuntimeFlag("false")).toBe(false);
	});
});

describe("shouldDisableAutoUpdate", () => {
	test("honors the persisted runtime flag", () => {
		expect(
			shouldDisableAutoUpdate({
				runtimeDisabled: true,
				isWindows: false,
			}),
		).toBe(true);
	});

	test("honors the explicit runtime env override", () => {
		expect(
			shouldDisableAutoUpdate({
				runtimeDisabled: false,
				disableAutoUpdateEnv: "1",
				isWindows: false,
			}),
		).toBe(true);
	});

	test("disables updates for experimental Windows builds", () => {
		expect(
			shouldDisableAutoUpdate({
				runtimeDisabled: false,
				experimentalWindowsBuildEnv: "1",
				isWindows: true,
			}),
		).toBe(true);
	});

	test("does not apply the experimental Windows build flag to other platforms", () => {
		expect(
			shouldDisableAutoUpdate({
				runtimeDisabled: false,
				experimentalWindowsBuildEnv: "1",
				isWindows: false,
			}),
		).toBe(false);
	});
});
