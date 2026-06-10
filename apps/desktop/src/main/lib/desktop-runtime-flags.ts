import { env } from "main/env.main";
import {
	type DesktopRuntimeFlags,
	getPostHogKeyOrNull,
	normalizeDesktopRuntimeFlags,
	shouldDisableAutoUpdate,
} from "shared/desktop-runtime-flags";
import { PLATFORM } from "shared/constants";
import { appState } from "./app-state";

export function getDesktopRuntimeFlags(): DesktopRuntimeFlags {
	try {
		return normalizeDesktopRuntimeFlags(appState.data.desktopRuntimeFlags);
	} catch {
		return normalizeDesktopRuntimeFlags(undefined);
	}
}

export function isAutoUpdateDisabledByRuntimeFlags(): boolean {
	return shouldDisableAutoUpdate({
		runtimeDisabled: getDesktopRuntimeFlags().disableAutoUpdate,
		disableAutoUpdateEnv: process.env.SUPERSET_DISABLE_AUTO_UPDATE,
		experimentalWindowsBuildEnv:
			process.env.SUPERSET_EXPERIMENTAL_WINDOWS_BUILD,
		isWindows: PLATFORM.IS_WINDOWS,
	});
}

export function getMainPostHogKey(key: string | undefined): string | null {
	return getPostHogKeyOrNull(key, {
		disabled: getDesktopRuntimeFlags().disableAnalytics,
	});
}

export function getMainApiUrl(): string {
	return env.NEXT_PUBLIC_API_URL;
}
