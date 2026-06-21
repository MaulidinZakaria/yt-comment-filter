import { YoutubeVideo } from "@/types";
import { getYoutubeToken } from "./youtube-auth";

export async function getChannelInfo() {
  const token = await getYoutubeToken();

  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  const channel = data.items?.[0];

  if (!channel) {
    throw new Error("Channel not found");
  }

  const channelInfo = {
    channelId: channel.id,
    channelName: channel.snippet.title,
    channelUsername: channel.snippet.customUrl ?? "",
    thumbnail: channel.snippet.thumbnails?.default?.url ?? "",
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    connected: true,
  };

  await chrome.storage.local.set({
    youtubeChannel: channelInfo,
  });

  return channelInfo;
}

export async function getOwnerVideos(token: string): Promise<YoutubeVideo[]> {
  const cache = await chrome.storage.local.get([
    "ownerVideos",
    "ownerVideosUpdatedAt",
  ]);

  const cacheVideos = cache.ownerVideos as YoutubeVideo[] | undefined;

  const updatedAt: any = cache.ownerVideosUpdatedAt;

  if (cacheVideos && updatedAt && Date.now() - updatedAt < 5 * 60 * 1000) {
    return cacheVideos;
  }

  const storage = (await chrome.storage.local.get("youtubeChannel")) as {
    youtubeChannel?: {
      uploadsPlaylistId?: string;
    };
  };

  const uploadsPlaylistId = storage.youtubeChannel?.uploadsPlaylistId;

  if (!uploadsPlaylistId) {
    throw new Error("No uploadsPlaylistId in cache");
  }

  const allPlaylistItems: any[] = [];

  let nextPageToken = "";

  do {
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${
        nextPageToken ? `&pageToken=${nextPageToken}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!playlistResponse.ok) {
      throw new Error("Failed to fetch videos");
    }

    const playlistData = await playlistResponse.json();

    allPlaylistItems.push(...playlistData.items);

    nextPageToken = playlistData.nextPageToken ?? "";
  } while (nextPageToken);

  if (allPlaylistItems.length === 0) {
    return [];
  }

  const privacyStatusMap = new Map<string, string>();

  const videoIds = allPlaylistItems.map((item) => item.contentDetails.videoId);

  for (let i = 0; i < videoIds.length; i += 50) {
    const batchIds = videoIds.slice(i, i + 50).join(",");

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=status&id=${batchIds}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!videosResponse.ok) {
      throw new Error("Failed to fetch video status");
    }

    const videosData = await videosResponse.json();

    for (const video of videosData.items) {
      privacyStatusMap.set(video.id, video.status.privacyStatus);
    }
  }

  const videos = allPlaylistItems
    .filter((item) => {
      const videoId = item.contentDetails.videoId;

      return privacyStatusMap.get(videoId) === "public";
    })
    .map((item) => ({
      videoId: item.contentDetails.videoId,

      title: item.snippet.title,

      thumbnail:
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        "",

      publishedAt: item.contentDetails.videoPublishedAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  await chrome.storage.local.set({
    ownerVideos: videos,
    ownerVideosUpdatedAt: Date.now(),
  });

  return videos;
}

export async function getAllComments(videoId: string, token: string) {
  let nextPageToken = "";

  const comments: {
    commentId: string;
    authorName: string;
    channelId: string;
    commentText: string;
    publishedAt: string;
  }[] = [];

  do {
    const params = new URLSearchParams({
      part: "snippet,replies",
      videoId,
      maxResults: "100",
    });

    if (nextPageToken) {
      params.append("pageToken", nextPageToken);
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("YouTube API Error:", response.status, errorText);

      throw new Error(`Failed to fetch comments (${response.status})`);
    }

    const data = await response.json();

    for (const item of data.items) {
      const topComment = item.snippet.topLevelComment;

      comments.push({
        commentId: topComment.id,
        authorName: topComment.snippet.authorDisplayName,
        channelId: topComment.snippet.channelId,
        commentText: topComment.snippet.textOriginal,
        publishedAt: topComment.snippet.publishedAt,
      });

      const replies = item.replies?.comments ?? [];

      for (const reply of replies) {
        comments.push({
          commentId: reply.id,
          authorName: reply.snippet.authorDisplayName,
          channelId: reply.snippet.channelId,
          commentText: reply.snippet.textOriginal,
          publishedAt: reply.snippet.publishedAt,
        });
      }
    }

    nextPageToken = data.nextPageToken ?? "";
  } while (nextPageToken);

  return comments;
}

export async function rejectComments(commentIds: string[], token: string) {
  const results = [];

  for (const commentId of commentIds) {
    try {
      const response = await fetch(
        "https://www.googleapis.com/youtube/v3/comments/setModerationStatus",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: commentId,
            moderationStatus: "rejected",
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();

        throw new Error(error);
      }

      results.push({
        commentId,
        success: true,
      });
    } catch (error: any) {
      results.push({
        commentId,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}
