import { getSettings } from "./storage";
import { scanAndQueue } from "./filters/comment-filter";
import {
  setRole,
  setFilterMode,
  setIsEnabled,
  getRole,
  getFilterMode,
} from "./state";
import { extractVideoMetadata } from "./services/video-metadata-service";

export function initializeMessageListener() {
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message?.action === "runFilter") {
        const settings = await getSettings();

        setRole(settings.role);
        setFilterMode(settings.filterMode);
        setIsEnabled(settings.isEnabled);

        setTimeout(() => {
          if (settings.role === "viewer") {
            scanAndQueue(settings.role, settings.filterMode);
          }
        }, 100);
      }
      if (message?.action === "setRole") {
        setRole(message.role);

        setTimeout(() => {
          if (getRole() === "viewer") {
            scanAndQueue(getRole(), getFilterMode());
          }
        }, 100);
      }
      if (message?.action === "setMode") {
        if (message.filterMode) {
          setFilterMode(message.filterMode);
        }

        if (typeof message.isEnabled === "boolean") {
          setIsEnabled(message.isEnabled);
        }

        if (getRole() === "viewer") {
          scanAndQueue();
        }
      }
      if (message?.action === "GET_VIDEO_METADATA") {
        const metadata = extractVideoMetadata();
        sendResponse(metadata);
        return true;
      }
    },
  );
}
