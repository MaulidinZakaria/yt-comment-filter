from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict_route import router as predict_router
from routes.predict_batch_route import router as predict_batch_router
from routes.feedback_route import router as feedback_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # izinkan semua origin dulu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(predict_router, prefix="/api", tags=["Prediction"])
app.include_router(predict_batch_router, prefix="/api", tags=["Prediction"])
app.include_router(
    feedback_router,
    prefix="/api"
)