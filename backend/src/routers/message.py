from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import get_session
from src.models.dto.message import MessageCreateDTO, MessageDTO
from src.services.message import MessageService

router = APIRouter()


@router.post("", response_model=MessageDTO, status_code=status.HTTP_201_CREATED)
async def create(
    payload: MessageCreateDTO, session: AsyncSession = Depends(get_session)
) -> MessageDTO:
    service = MessageService(session)
    return await service.create(payload=payload)


@router.get("", response_model=list[MessageDTO])
async def get_all(session: AsyncSession = Depends(get_session)) -> list[MessageDTO]:
    service = MessageService(session)
    return await service.get_all()
