from fastapi import APIRouter
from pydantic import BaseModel
from services.classifier_service import classify_text

router = APIRouter()

class CommentRequest(BaseModel):
    text: str

@router.post("/predict")
def predict_comment(payload: CommentRequest):
    result = classify_text(payload.text)
    return {
        "input": payload.text,
        "label": result["label"],
        "score": result["score"]
    }
