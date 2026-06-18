export function getAllCommentTextNodes(): Element[] {
  return Array.from(
    document.querySelectorAll(
      "#content #content-text"
    )
  );
}

export function findCommentContainer(
  element: Element
): Element | null {
  return (
    element.closest(
      "ytd-comment-renderer"
    ) ||
    element.closest(
      "ytd-comment-thread-renderer"
    )
  );
}

export function getVisibleCommentCount(): number {
  return getAllCommentTextNodes().length;
}