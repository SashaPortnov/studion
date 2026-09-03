from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.schemas import Message
from src.models.dto.message import MessageCreateDTO, MessageDTO


class MessageService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, payload: MessageCreateDTO) -> MessageDTO:
        message = Message(text=payload.text)
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return MessageDTO.model_validate(message)

    async def get_all(self) -> list[MessageDTO]:
        result = await self.session.scalars(
            select(Message).order_by(Message.created_at.desc(), Message.id.desc())
        )
        return [MessageDTO.model_validate(message) for message in result.all()]
