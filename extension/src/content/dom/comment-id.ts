function simpleHash(text: string): string {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return (hash >>> 0).toString(36);
}

export function getCommentIdFromElement(
  commentElement: Element
): string {
  const container = commentElement.closest(
    "ytd-comment-thread-renderer, ytd-comment-renderer, ytd-comment-view-model"
  );

  if (!container) {
    const text =
      commentElement.textContent?.trim() ?? "";

    return `hash:${simpleHash(text)}`;
  }

  const link = container.querySelector(
    "a[href*='lc=']"
  );

  if (link instanceof HTMLAnchorElement) {
    try {
      const url = new URL(
        link.href,
        location.origin
      );

      const commentId =
        url.searchParams.get("lc");

      if (commentId) {
        return `cid:${commentId}`;
      }
    } catch {
      // ignore
    }
  }

  const text =
    commentElement.textContent?.trim() ?? "";

  return `hash:${simpleHash(text)}`;
}