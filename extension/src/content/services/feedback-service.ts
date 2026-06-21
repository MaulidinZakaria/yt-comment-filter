export async function sendFalsePositive(payload: any) {
  return fetch("http://127.0.0.1:8000/api/feedback/false-positive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
