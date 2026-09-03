from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from .base import Base


class Message(Base):
    __tablename__ = "messages"
    text: Mapped[str] = mapped_column(String(1000), nullable=False)
