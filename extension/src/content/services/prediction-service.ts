const BATCH_API = "http://127.0.0.1:8000/api/predict-batch";

export async function predictCommentsViewer(texts: string[]) {
  const response = await fetch(BATCH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texts,
    }),
  });

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  const data = await response.json();

  return data.results ?? [];
}

export async function predictCommentsOwner(
  comments: {
    commentId: string;
    authorName: string;
    commentText: string;
    publishedAt: string;
  }[],
) {
  const response = await fetch(BATCH_API, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      texts: comments.map((c) => c.commentText),
    }),
  });

  const data = await response.json();

  return comments.map((comment, index) => ({
    ...comment,
    prediction: data.results[index].label,
    score: data.results[index].score,
  }));
}
