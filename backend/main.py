import os
import asyncio
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from .database import engine, get_db
from . import models, schemas
from .auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES,
)
from .game_logic import apply_time_decay, perform_action, SPECIES
from .websocket_manager import manager

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TomagochiWeb API", version="1.0.0")

_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/register", response_model=schemas.UserOut)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.post("/api/pets", response_model=schemas.PetOut)
def create_pet(
    pet_data: schemas.PetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if pet_data.species_id not in SPECIES:
        raise HTTPException(status_code=400, detail="Invalid species ID")

    db.refresh(current_user)
    if len(current_user.pets) >= 3:
        raise HTTPException(status_code=400, detail="You can have at most 3 pets")

    pet = models.Pet(
        name=pet_data.name,
        species_id=pet_data.species_id,
        owner_id=current_user.id,
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet


@app.get("/api/pets", response_model=List[schemas.PetOut])
def get_my_pets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pets = db.query(models.Pet).filter(models.Pet.owner_id == current_user.id).all()
    for pet in pets:
        apply_time_decay(pet, db)
    return pets


@app.get("/api/pets/{pet_id}", response_model=schemas.PetOut)
def get_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    apply_time_decay(pet, db)
    return pet


@app.post("/api/pets/{pet_id}/action")
def pet_action(
    pet_id: int,
    action_data: schemas.PetAction,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pet = db.query(models.Pet).filter(
        models.Pet.id == pet_id,
        models.Pet.owner_id == current_user.id,
    ).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    result = perform_action(pet, action_data.action, db)
    db.refresh(pet)

    pet_data = schemas.PetOut.model_validate(pet).model_dump(mode="json")

    background_tasks.add_task(
        manager.send_pet_update,
        current_user.id,
        {"type": "pet_update", "pet": pet_data},
    )

    return {**result, "pet": pet_data}


@app.delete("/api/pets/{pet_id}")
def delete_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pet = db.query(models.Pet).filter(
        models.Pet.id == pet_id,
        models.Pet.owner_id == current_user.id,
    ).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    db.delete(pet)
    db.commit()
    return {"message": "Pet deleted"}


@app.get("/api/community", response_model=List[schemas.PetOut])
def get_community_pets(db: Session = Depends(get_db)):
    return db.query(models.Pet).filter(models.Pet.is_alive.is_(True)).all()


@app.get("/api/species")
def get_species():
    return SPECIES


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            await asyncio.sleep(30)
            await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
