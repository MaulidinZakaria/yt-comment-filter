import {
  predictionCache,
  currentRole,
  currentFilterMode,
  currentIsEnabled,
  isProcessing,
  setProcessing,
  getCache,
} from "../state";

import { getAllCommentTextNodes } from "../dom/comment-dom";

import { getCommentIdFromElement } from "../dom/comment-id";

import type { Role, FilterMode } from "@/types";
import { queuePrediction } from "../services/queue-service";

export function applyCommentFilter(
  commentNode: Element,
  isBlocked: boolean,
  role: Role,
  filterMode: FilterMode,
) {
  commentNode.classList.remove("sa-filtered-hideText", "sa-filtered-showLabel");

  if (!isBlocked) return;

  if (role === "viewer") {
    if (filterMode === "hideWithText") {
      commentNode.classList.add("sa-filtered-hideText");
    }

    if (filterMode === "showWithLabel") {
      commentNode.classList.add("sa-filtered-showLabel");
    }
  }
}

export function clearCommentStyles() {
  document
    .querySelectorAll("ytd-comment-renderer,ytd-comment-thread-renderer")
    .forEach((element) => {
      element.classList.remove("sa-filtered-ownerHighlight");
    });

  document.querySelectorAll("#content #content-text").forEach((element) => {
    element.classList.remove("sa-filtered-hideText", "sa-filtered-showLabel");
  });
}

export function scanAndQueue(
  role: Role = currentRole,
  filterMode: FilterMode = currentFilterMode,
) {
  if (role === "owner") {
    return;
  }

  if (!currentIsEnabled) {
    clearCommentStyles();
    return;
  }

  if (isProcessing) return;

  setProcessing(true);

  clearCommentStyles();

  const cache = getCache();
  const comments = getAllCommentTextNodes();

  for (const comment of comments) {
    const id = getCommentIdFromElement(comment);

    if (predictionCache.has(id)) {
      applyCommentFilter(comment, cache.get(id) ?? false, role, filterMode);
    } else {
      queuePrediction(comment);
    }
  }

  setProcessing(false);
}

export function applyCachedPredictions(
  role: Role = currentRole,
  filterMode: FilterMode = currentFilterMode,
) {
  if (!currentIsEnabled) {
    clearCommentStyles();
    return;
  }
  const comments = getAllCommentTextNodes();

  for (const comment of comments) {
    const id = getCommentIdFromElement(comment);

    if (!predictionCache.has(id)) continue;

    applyCommentFilter(
      comment,
      predictionCache.get(id) ?? false,
      role,
      filterMode,
    );
  }
}
