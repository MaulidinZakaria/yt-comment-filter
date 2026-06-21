from fastapi import APIRouter
from pydantic import BaseModel
from services.classifier_service import classify_batch

router = APIRouter()

class BatchRequest(BaseModel):
    texts: list[str]

import time

@router.post("/predict-batch")
def predict_batch(payload: BatchRequest):
    start = time.time()

    predictions = classify_batch(payload.texts)

    elapsed = time.time() - start

    print(
        f"Processed {len(payload.texts)} comments "
        f"in {elapsed:.4f} seconds"
    )

    return {
        "results": [
            {
                "label": item["label"],
                "score": item["score"]
            }
            for item in predictions
        ]
    } 