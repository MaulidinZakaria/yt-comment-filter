import { predictCommentsOwner } from "@/content/services/prediction-service";
import {
  getAllComments,
  getChannelInfo,
  getOwnerVideos,
  rejectComments,
} from "./youtube-api";
import { logoutYoutube } from "./youtube-auth";

const STORAGE_KEYS = {
  judolCount: "judolCount",
  scannedCount: "scannedCount",
};

function broadcast(message: any) {
  chrome.runtime.sendMessage(message).catch(() => {});
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  /**
   * Get Comment Stats
   */
  if (message.type === "GET_COMMENT_STATS") {
    (async () => {
      const data = await chrome.storage.session.get([
        STORAGE_KEYS.judolCount,
        STORAGE_KEYS.scannedCount,
      ]);

      sendResponse({
        judolCount: data[STORAGE_KEYS.judolCount] ?? 0,

        scannedCount: data[STORAGE_KEYS.scannedCount] ?? 0,
      });
    })();

    return true;
  }

  /**
   * Reset Comment Stats
   */
  if (message.type === "RESET_STATS") {
    (async () => {
      try {
        await chrome.storage.session.set({
          [STORAGE_KEYS.judolCount]: 0,
          [STORAGE_KEYS.scannedCount]: 0,
        });

        broadcast({
          type: "COMMENT_STATS_UPDATED",
          judolCount: 0,
          scannedCount: 0,
        });

        sendResponse({ ok: true });
      } catch (error: any) {
        sendResponse({
          error: error.message,
        });
      }
    })();

    return true;
  }

  /**
   * START SCAN
   */
  if (message.type === "BATCH_START") {
    broadcast({
      type: "COMMENT_STATS_STATUS",
      status: "loading",
    });

    sendResponse({
      ok: true,
    });

    return true;
  }

  /**
   * UPDATE COUNT
   */
  if (message.type === "BATCH_PREDICTION_RESULT") {
    (async () => {
      try {
        const judolCount = message.results.filter(Boolean).length;

        const scannedCount = message.results.length;

        const data = await chrome.storage.session.get([
          STORAGE_KEYS.judolCount,
          STORAGE_KEYS.scannedCount,
        ]);

        const newJudolCount = (data[STORAGE_KEYS.judolCount] ?? 0) + judolCount;

        const newScannedCount =
          (data[STORAGE_KEYS.scannedCount] ?? 0) + scannedCount;

        await chrome.storage.session.set({
          [STORAGE_KEYS.judolCount]: newJudolCount,

          [STORAGE_KEYS.scannedCount]: newScannedCount,
        });

        broadcast({
          type: "COMMENT_STATS_UPDATED",
          judolCount: newJudolCount,
          scannedCount: newScannedCount,
        });
      } catch (error) {
        console.error(error);
      }
    })();

    return true;
  }

  /**
   * END SCAN
   */
  if (message.type === "BATCH_END") {
    broadcast({
      type: "COMMENT_STATS_STATUS",
      status: "idle",
    });

    sendResponse({
      ok: true,
    });

    return true;
  }

  /**
   * CONNECT YOUTUBE
   */
  if (message.action === "connectYoutube") {
    (async () => {
      try {
        const channelInfo = await getChannelInfo();

        sendResponse({
          success: true,
          channel: channelInfo,
        });
      } catch (error: any) {
        sendResponse({
          success: false,
          error: error.message,
        });
      }
    })();

    return true;
  }

  /**
   * LOGOUT YOUTUBE
   */
  if (message.action === "logoutYoutube") {
    (async () => {
      try {
        const result = await logoutYoutube();

        sendResponse(result);
      } catch (error: any) {
        sendResponse({
          error: error.message,
        });
      }
    })();

    return true;
  }

  /**
   * GET CHANNEL
   */
  if (message.action === "getYoutubeChannel") {
    (async () => {
      try {
        const data = await chrome.storage.local.get("youtubeChannel");

        sendResponse({
          channel: data.youtubeChannel ?? null,
        });
      } catch (error: any) {
        sendResponse({
          error: error.message,
        });
      }
    })();

    return true;
  }

  /**
   * GET VIDEOS OF OWNER CHANNEL
   */
  if (message.action === "getOwnerVideos") {
    (async () => {
      try {
        const tokenResponse = await chrome.identity.getAuthToken({
          interactive: false,
        } as any);

        const token =
          typeof tokenResponse === "string"
            ? tokenResponse
            : tokenResponse.token;

        const videos = await getOwnerVideos(token as string);

        sendResponse({
          success: true,
          videos,
        });
      } catch (error: any) {
        sendResponse({
          success: false,
          error: error.message,
        });
      }
    })();

    return true;
  }

  /**
   * SCAN VIDEO
   */
  if (message.action === "scanVideo") {
    (async () => {
      try {
        const tokenResponse = await chrome.identity.getAuthToken({
          interactive: false,
        } as any);

        const token =
          typeof tokenResponse === "string"
            ? tokenResponse
            : tokenResponse.token;

        const comments = await getAllComments(message.videoId, token as string);

        if (comments.length === 0) {
          await chrome.storage.session.set({
            scanData: {
              videoId: message.videoId,
              results: [],
              scannedAt: Date.now(),
            },
          });

          sendResponse({
            success: true,
            results: [],
          });

          return;
        }

        const results = await predictCommentsOwner(comments);

        await chrome.storage.session.set({
          scanData: {
            videoId: message.videoId,
            results,
            scannedAt: Date.now(),
          },
        });

        sendResponse({
          success: true,
          results,
        });
      } catch (error: any) {
        console.error("[SCAN ERROR]", error);

        sendResponse({
          success: false,
          error: error?.message ?? String(error),
        });
      }
    })();

    return true;
  }

  if (message.action === "getScanResults") {
    (async () => {
      const data = await chrome.storage.session.get("scanData");

      sendResponse(data.scanData ?? null);
    })();

    return true;
  }

  if (message.action === "deleteComments") {
    (async () => {
      try {
        const tokenResponse = await chrome.identity.getAuthToken({
          interactive: true,
        });

        const token =
          typeof tokenResponse === "string"
            ? tokenResponse
            : tokenResponse.token;

        const results = await rejectComments(
          message.commentIds,
          token as string,
        );

        sendResponse({
          success: true,
          results,
        });
      } catch (error: any) {
        sendResponse({
          success: false,
          error: error.message,
        });
      }
    })();
    return true;
  }
});
