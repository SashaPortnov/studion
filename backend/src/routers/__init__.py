from fastapi import APIRouter
from .message import router as messageRouter

router = APIRouter()
router.include_router(messageRouter, prefix="/messages", tags=["Messages"])
