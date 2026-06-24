export function getAllCommentTextNodes(): Element[] {
  return Array.from(
    document.querySelectorAll(
      ["#content #content-text", "ytd-comment-view-model #content-text"].join(
        ",",
      ),
    ),
  );
}

export function findCommentContainer(element: Element): Element | null {
  return (
    element.closest(
      [
        "ytd-comment-renderer",
        "ytd-comment-thread-renderer",
        "ytd-comment-view-model",
        "ytm-comment-view-model",
      ].join(","),
    ) ?? null
  );
}

export function getVisibleCommentCount(): number {
  return getAllCommentTextNodes().length;
}
