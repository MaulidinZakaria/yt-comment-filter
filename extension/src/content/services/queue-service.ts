import {
  predictionCache,
  batchQueue,
  scheduledIds,
  batchTimer,
  setBatchTimer,
} from "../state";

import { getCommentIdFromElement } from "../dom/comment-id";
import type { PredictionItem } from "../../types";
import { applyCachedPredictions } from "../filters/comment-filter";
import { predictCommentsViewer } from "./prediction-service";
import { PredictionResponse } from "./../../types/index";

const BATCH_DELAY = 100;

export function queuePrediction(commentElement: Element) {
  const id = getCommentIdFromElement(commentElement);

  if (predictionCache.has(id)) return;
  if (scheduledIds.has(id)) return;

  const text = commentElement.textContent?.trim() ?? "";

  batchQueue.push({
    id,
    text,
  });

  scheduledIds.add(id);

  if (!batchTimer) {
    const timer = window.setTimeout(() => {
      setBatchTimer(null);
      runBatchPrediction();
    }, BATCH_DELAY);

    setBatchTimer(timer);
  }
}

export async function runBatchPrediction() {
  chrome.runtime.sendMessage({
    type: "BATCH_START",
  });

  const queue: PredictionItem[] = [...batchQueue];

  batchQueue.length = 0;
  scheduledIds.clear();

  if (!queue.length) return;

  const uniqueItems: PredictionItem[] = [];
  const seen = new Set<string>();

  for (const item of queue) {
    if (seen.has(item.id)) continue;

    seen.add(item.id);
    uniqueItems.push(item);
  }

  const itemsToPredict = uniqueItems.filter(
    (item) => !predictionCache.has(item.id),
  );

  if (!itemsToPredict.length) return;

  try {
    const results: PredictionResponse[] = await predictCommentsViewer(
      itemsToPredict.map((item) => item.text),
    );

    if (results.length !== itemsToPredict.length) {
      throw new Error("Prediction length mismatch");
    }

    itemsToPredict.forEach((item, index) => {
      const result = results[index];

      const label = result.label.toLowerCase();

      predictionCache.set(item.id, label === "judol");
    });

    chrome.runtime.sendMessage({
      type: "BATCH_PREDICTION_RESULT",
      results: results.map((r) => r.label.toLowerCase() === "judol"),
    });
  } catch {
    itemsToPredict.forEach((item) => {
      predictionCache.set(item.id, false);
    });
  } finally {
    chrome.runtime.sendMessage({
      type: "BATCH_END",
    });

    // console.log("Prediction finished", predictionCache.size);
  }

  applyCachedPredictions();
}
