import { ScanResult } from "@/types";

export function exportJudolCsv(results: ScanResult[], videoTitle: string) {
  const judolResults = results.filter((item) => item.prediction === "judol");

  if (judolResults.length === 0) {
    throw new Error("Tidak ada komentar judol untuk diekspor");
  }

  const headers = [
    "Comment ID",
    "Author",
    "Comment",
    "Score",
    "Prediction",
    "Published At",
  ];

  const rows = judolResults.map((item) => [
    item.commentId,
    item.authorName,
    `"${item.commentText.replace(/"/g, '""')}"`,
    item.score.toFixed(4),
    item.prediction,
    item.publishedAt,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const safeTitle = videoTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50)
    .replace(/^-|-$/g, "");

  const today = new Date().toISOString().split("T")[0];

  const filename = `commentshield-${safeTitle}-${today}.csv`;

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
