from fastapi import APIRouter
from datetime import datetime
from pathlib import Path
import csv

from schemas.feedback import (
    FalsePositiveRequest,
)

router = APIRouter()

CSV_PATH = Path(
    "datasets/false_positive.csv"
)


@router.post(
    "/feedback/false-positive"
)
async def save_false_positive(
    payload: FalsePositiveRequest,
):
    CSV_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_exists = CSV_PATH.exists()

    with open(
        CSV_PATH,
        "a",
        newline="",
        encoding="utf-8",
    ) as file:
        writer = csv.writer(file)

        if not file_exists:
            writer.writerow([
                "timestamp",
                "channel_id",
                "channel_name",
                "video_id",
                "video_title",
                "comment_id",
                "comment_text",
                "original_prediction",
                "corrected_label",
            ])

        for item in payload.comments:
            writer.writerow([
                datetime.now().isoformat(),

                item.channelId,
                item.channelName,

                item.videoId,
                item.videoTitle,

                item.commentId,
                item.commentText,

                item.originalPrediction,
                item.correctedLabel,
            ])

    return {
        "success": True,
        "saved": len(payload.comments),
    }