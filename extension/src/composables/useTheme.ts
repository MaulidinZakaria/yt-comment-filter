import { ref } from "vue";

const isDark = ref(false);

export function useTheme() {
  const loadTheme = async () => {
    const { theme } = await chrome.storage.local.get("theme");

    isDark.value = theme === "dark";

    document.documentElement.classList.toggle("dark", isDark.value);
  };

  const toggleTheme = async () => {
    isDark.value = !isDark.value;

    document.documentElement.classList.toggle("dark", isDark.value);

    await chrome.storage.local.set({
      theme: isDark.value ? "dark" : "light",
    });
  };

  return {
    isDark,
    loadTheme,
    toggleTheme,
  };
}
