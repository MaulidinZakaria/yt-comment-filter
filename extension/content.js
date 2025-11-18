async function checkCommentWithAPI(text) {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    return data.label === "judol"; // true jika terdeteksi
  } catch (e) {
    return false;
  }
}

function findCommentContainer(element) {
  return (
    element.closest("ytd-comment-thread-renderer") ||
    element.closest("ytd-comment-renderer") ||
    element
  );
}

function ensureOriginalState(comment) {
  if (!comment.dataset.originalHtml) {
    comment.dataset.originalHtml = comment.innerHTML;
    comment.dataset.originalText = comment.innerText || "";
  }

  const container = findCommentContainer(comment);
  if (container && !container.dataset.originalDisplayContainer) {
    container.dataset.originalDisplayContainer = container.style.display || "";
  }
}

function restoreAllContainers() {
  // tampilkan semua container yang pernah disembunyikan
  const hiddenContainers = document.querySelectorAll(
    "ytd-comment-thread-renderer[style*='display: none'], ytd-comment-renderer[style*='display: none']"
  );
  hiddenContainers.forEach((c) => {
    if (c.dataset.originalDisplayContainer !== undefined) {
      c.style.display = c.dataset.originalDisplayContainer;
    } else {
      c.style.removeProperty("display");
    }
  });
}

function restoreOriginal(comment) {
  const container = findCommentContainer(comment);

  if (comment.dataset.originalHtml) {
    comment.innerHTML = comment.dataset.originalHtml;
  }

  comment.style.removeProperty("border");
  comment.style.removeProperty("background-color");

  const warn = comment.querySelector(".warning-label");
  if (warn) warn.remove();

  if (container && container.dataset.originalDisplayContainer) {
    container.style.display = container.dataset.originalDisplayContainer;
  }

  delete comment.dataset.filterState;
}

async function applyModeToComment(comment, role, filterMode) {
  ensureOriginalState(comment);

  const textToCheck = (comment.dataset.originalText || "").toLowerCase();
  const isBlocked = await checkCommentWithAPI(textToCheck);

  if (!isBlocked) return;

  const container = findCommentContainer(comment);

  if (role === "viewer") {
    if (filterMode === "hideWithText") {
      comment.innerHTML =
        "<i style='color:red;'>Pesan ini dihapus, karena mengandung promosi judi online</i>";
      comment.dataset.filterState = "hideWithText";
    } else if (filterMode === "showWithLabel") {
      if (!comment.querySelector(".warning-label")) {
        const warning = document.createElement("div");
        warning.className = "warning-label";
        warning.innerHTML =
          "<i style='color:red;'>⚠ Komentar ini mengandung promosi judi online</i>";
        comment.appendChild(warning);
      }
      comment.dataset.filterState = "showWithLabel";
    } else if (filterMode === "hideCompletely") {
      if (container) {
        container.style.display = "none";
        container.dataset.filterState = "hideCompletely";
      }
    }
  } else if (role === "owner") {
    comment.style.border = "2px dashed orange";
    comment.style.backgroundColor = "#fff3cd";
    comment.title = "Komentar ini mengandung kata terlarang";
    comment.dataset.filterState = "ownerHighlight";
  }
}

async function filterComments(role, filterMode) {
  restoreAllContainers();

  const comments = document.querySelectorAll("#content #content-text");

  for (const comment of comments) {
    restoreOriginal(comment);
    await applyModeToComment(comment, role, filterMode);
  }
}

function initFilter() {
  chrome.storage.sync.get(["userRole", "filterMode"], async (data) => {
    const role = data.userRole || "viewer";
    const filterMode = data.filterMode || "hideWithText";
    await filterComments(role, filterMode);
  });
}

initFilter();

const observer = new MutationObserver((mutations) => {
  let found = false;
  for (const m of mutations) {
    if (m.addedNodes && m.addedNodes.length) {
      for (const n of m.addedNodes) {
        if (
          n.nodeType === 1 &&
          (n.matches?.("#content #content-text") ||
            n.querySelector?.("#content #content-text"))
        ) {
          found = true;
          break;
        }
      }
    }
    if (found) break;
  }
  if (found) initFilter();
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message) => {
  if (message && message.action === "runFilter") {
    initFilter();
  }
});
