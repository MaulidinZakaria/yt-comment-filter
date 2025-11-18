from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict_route import router as predict_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # izinkan semua origin dulu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(predict_router, prefix="/api", tags=["Prediction"])
