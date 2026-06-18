import type { ExtensionSettings, ScanResult } from "../types";

const DEFAULT_SETTINGS: ExtensionSettings = {
  role: "viewer",
  filterMode: "hideWithText",
  isEnabled: true,
};

export async function getSettings(): Promise<ExtensionSettings> {
  const data = (await chrome.storage.local.get([
    "role",
    "filterMode",
    "isEnabled",
  ])) as Partial<ExtensionSettings>;

  return {
    role: data.role ?? DEFAULT_SETTINGS.role,
    filterMode: data.filterMode ?? DEFAULT_SETTINGS.filterMode,
    isEnabled: data.isEnabled ?? DEFAULT_SETTINGS.isEnabled,
  };
}

export async function saveSettings(
  settings: Partial<ExtensionSettings>,
): Promise<void> {
  await chrome.storage.local.set(settings);
}

export async function clearSettings(): Promise<void> {
  await chrome.storage.local.remove(["role", "filterMode", "isEnabled"]);
}

const KEY = "scanResults";

export async function saveScanResults(results: ScanResult[]) {
  await chrome.storage.local.set({
    [KEY]: results,
  });
}

export async function getScanResults() {
  const data = await chrome.storage.local.get(KEY);

  return (data[KEY] as ScanResult[]) ?? [];
}
