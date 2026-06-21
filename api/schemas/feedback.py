from pydantic import BaseModel
from typing import List

class FalsePositiveItem(BaseModel):
    commentId: str
    commentText: str
    originalPrediction: str
    correctedLabel: str

    videoId: str
    videoTitle: str

    channelId: str
    channelName: str


class FalsePositiveRequest(BaseModel):
    comments: List[FalsePositiveItem]