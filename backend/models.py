from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    pets = relationship("Pet", back_populates="owner")


class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    species_id = Column(Integer, nullable=False)  # 1=Flambit, 2=Aquapup, 3=Leafling
    evolution_stage = Column(Integer, default=0)  # 0=baby, 1=teen, 2=adult

    # Stats (0–100)
    hunger = Column(Float, default=80.0)
    happiness = Column(Float, default=80.0)
    energy = Column(Float, default=80.0)
    health = Column(Float, default=100.0)
    experience = Column(Float, default=0.0)
    level = Column(Integer, default=1)

    # State
    is_sleeping = Column(Boolean, default=False)
    is_alive = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="pets")
