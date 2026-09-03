from pydantic import BaseModel
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class PetCreate(BaseModel):
    name: str
    species_id: int


class PetOut(BaseModel):
    id: int
    name: str
    species_id: int
    evolution_stage: int
    hunger: float
    happiness: float
    energy: float
    health: float
    experience: float
    level: int
    is_sleeping: bool
    is_alive: bool
    created_at: datetime
    last_updated: datetime
    owner_id: int

    model_config = {"from_attributes": True}


class PetAction(BaseModel):
    action: str
