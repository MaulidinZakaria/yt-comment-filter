import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "CommentShield AI",
  description:
    "AI-powered YouTube comment filter that detects and moderates online gambling promotions.",
  version: pkg.version,
  icons: {
    48: "public/icon.png",
  },
  action: {
    default_icon: {
      48: "public/icon.png",
    },
    default_popup: "src/popup/index.html",
  },
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: ["https://*/*"],
    },
  ],
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  permissions: ["sidePanel", "contentSettings", "storage", "identity"],
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  host_permissions: [
    "https://www.googleapis.com/*",
    "http://127.0.0.1:8000/*",
    "http://localhost:8000/*",
  ],
  oauth2: {
    client_id:
      "334464574678-qnegegv0vojfng5ucjqmql0uclnvaqpi.apps.googleusercontent.com",
    scopes: ["https://www.googleapis.com/auth/youtube.force-ssl"],
  },
});
