import type { Role, FilterMode, PredictionItem } from "../types";

export const predictionCache = new Map<string, boolean>();

export let batchQueue: PredictionItem[] = [];

export const scheduledIds = new Set<string>();

export let batchTimer: number | null = null;

export let currentRole: Role = "viewer";

export let currentFilterMode: FilterMode = "hideWithText";

export let currentIsEnabled: boolean = true;

export let isProcessing = false;

export let isUpdating = false;

/* =========================
 * Role
 * ========================= */

export function setRole(role: Role) {
  currentRole = role;
}

export function getRole() {
  return currentRole;
}

export function setFilterMode(mode: FilterMode) {
  currentFilterMode = mode;
}

export function getFilterMode() {
  return currentFilterMode;
}

export function setIsEnabled(isEnabled: boolean) {
  currentIsEnabled = isEnabled;
}

/* =========================
 * Processing
 * ========================= */

export function setProcessing(value: boolean) {
  isProcessing = value;
}

export function setUpdating(value: boolean) {
  isUpdating = value;
}

/* =========================
 * Batch Prediction
 * ========================= */

export function setBatchTimer(timer: number | null) {
  batchTimer = timer;
}


