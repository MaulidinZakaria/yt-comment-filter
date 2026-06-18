export function injectStyles() {
  if (
    document.getElementById(
      "sa-filter-styles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id = "sa-filter-styles";

  style.textContent = `
    .sa-filtered-hideText {
      position: relative;
      width: 100% !important;
      display: block !important;
    }

    .sa-filtered-hideText > span {
      opacity: 0 !important;
    }

    .sa-filtered-hideText::after {
      content: "Komentar disembunyikan karena terindikasi promosi judi online";
      color: #dc2626;
      font-style: italic;

      position: absolute;
      top: 0;
      left: 0;
    }

    .sa-filtered-showLabel::after {
      content: "⚠ Komentar terindikasi promosi judi online";
      display: block;

      margin-top: 4px;

      color: #dc2626;
      font-size: 12px;
      font-style: italic;
    }

    .sa-filtered-ownerHighlight {
      outline: 2px dashed #f59e0b;
      background-color: #fef3c7;
      border-radius: 8px;
    }
  `;

  document.head.appendChild(style);
}