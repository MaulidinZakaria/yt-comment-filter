const roleSelect = document.getElementById("roleSelect");
const viewerOptions = document.getElementById("viewerOptions");
const filterModeRadios = document.getElementsByName("filterMode");
const runButton = document.getElementById("runButton");

// Load pengaturan awal
chrome.storage.sync.get(["userRole", "filterMode"], (data) => {
  const role = data.userRole || "viewer";
  const mode = data.filterMode || "hideWithText";

  roleSelect.value = role;
  viewerOptions.style.display = role === "viewer" ? "block" : "none";

  [...filterModeRadios].forEach((r) => {
    r.checked = r.value === mode;
  });
});

// Ganti role
roleSelect.addEventListener("change", () => {
  const role = roleSelect.value;
  chrome.storage.sync.set({ userRole: role });
  viewerOptions.style.display = role === "viewer" ? "block" : "none";
});

// Tombol Jalankan
runButton.addEventListener("click", async () => {
  const role = roleSelect.value;
  const selectedMode = [...filterModeRadios].find((r) => r.checked)?.value || "hideWithText";

  await chrome.storage.sync.set({
    userRole: role,
    filterMode: selectedMode,
  });

  // Kirim pesan ke content.js
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "runFilter" });
});
