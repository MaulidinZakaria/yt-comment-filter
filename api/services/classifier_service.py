import torch
from models.loader import get_model

tokenizer, model = get_model()
labels = ["normal", "judol"]  # urutan sesuai training

def classify_text(text: str):
    batch = tokenizer(
        text,
        padding=True,
        truncation=True,
        max_length=128,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model(
            input_ids=batch["input_ids"],
            attention_mask=batch["attention_mask"]
        )
        probs = torch.softmax(outputs.logits, dim=-1)
        score, idx = torch.max(probs, dim=-1)

    return {
        "label": labels[idx.item()],
        "score": float(score.item())
    }
