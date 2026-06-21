import time

import torch
from services.preprocessing import preprocess_text
from models.loader import get_model

tokenizer, model = get_model()
labels = ["normal", "judol"]  # urutan sesuai training

def classify_text(text: str):
    text = preprocess_text(text)
    
    batch = tokenizer(
        text,
        padding=True,
        truncation=True,
        max_length=256,
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

import time

def classify_batch(texts: list[str]):
    # start = time.time()

    texts = [preprocess_text(t) for t in texts]

    # print("Preprocess:", time.time() - start)

    # start = time.time()

    batch = tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=256,
        return_tensors="pt"
    )

    # print("Tokenizer:", time.time() - start)

    # start = time.time()

    with torch.no_grad():
        outputs = model(
            input_ids=batch["input_ids"],
            attention_mask=batch["attention_mask"]
        )

        probs = torch.softmax(
            outputs.logits,
            dim=-1
        )

        scores, indices = torch.max(
            probs,
            dim=-1
        )

    # print("Inference:", time.time() - start)

    results = []

    for score, idx in zip(scores, indices):
        results.append({
            "label": labels[idx.item()],
            "score": float(score.item())
        })

    return results