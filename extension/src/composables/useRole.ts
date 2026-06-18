import { Role } from "@/types";
import { ref } from "vue";

const role = ref<Role>("role");

export function useRole() {
  const loadRole = async () => {
    const data = await chrome.storage.local.get("role");

    if (data.role === "viewer" || data.role === "owner") {
      role.value = data.role;
    } else {
      role.value = "role";
    }
  };

  const setRole = async (newRole: Role) => {
    role.value = newRole;

    await chrome.storage.local.set({
      role: newRole,
    });

    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const activeTab = tabs[0];

    if (activeTab?.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: "setRole",
        role: newRole,
      });
    }
  };

  const clearRole = async () => {
    role.value = "role";

    await chrome.storage.local.remove("role");

    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const activeTab = tabs[0];

    if (activeTab?.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: "setRole",
        role: "role",
      });
    }
  };

  return {
    role,
    loadRole,
    setRole,
    clearRole,
  };
}
