from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.courses import router as courses_router
from app.routes.daily_tasks import router as daily_tasks_router
from app.routes.push_subscriptions import router as push_subscriptions_router


app = FastAPI(
    title="Ratteb API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(daily_tasks_router)
app.include_router(push_subscriptions_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Ratteb API is running",
    }