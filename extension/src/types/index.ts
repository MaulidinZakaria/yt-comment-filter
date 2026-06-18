export type Role = "role" | "viewer" | "owner";

export type FilterMode = "hideWithText" | "showWithLabel";

export interface ExtensionSettings {
  role: Role;
  filterMode: FilterMode;
  isEnabled: boolean;
}

export interface PredictionItem {
  id: string;
  text: string;
}

export interface PredictionResponse {
  label: string;
  score: number;
}

export interface ScanResult {
  commentId: string;
  authorName: string;
  commentText: string;
  score: number;
  prediction: "judol" | "normal";
  publishedAt: string;
}

export interface YoutubeChannel {
  channelId: string;
  channelName: string;
  channelUsername: string;
  thumbnail: string;
  connected: boolean;
}

export interface YoutubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
}
