from datetime import datetime, timezone
from sqlalchemy.orm import Session
from . import models


SPECIES = {
    1: {"name": "Flambit",  "type": "fire",  "color": "#FF6B35"},
    2: {"name": "Aquapup",  "type": "water", "color": "#4ECDC4"},
    3: {"name": "Leafling", "type": "grass", "color": "#95E07A"},
}

DECAY_RATES = {
    "hunger":    0.8,
    "happiness": 0.5,
    "energy":    0.3,
}

XP_PER_LEVEL = 100
EVOLUTION_LEVELS = {1: 5, 2: 15}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def apply_time_decay(pet: models.Pet, db: Session) -> models.Pet:
    if not pet.is_alive:
        return pet

    now = _now()
    last = pet.last_updated
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)

    elapsed_minutes = min((now - last).total_seconds() / 60.0, 60)

    if pet.is_sleeping:
        pet.energy = min(100.0, pet.energy + elapsed_minutes * 1.5)
        pet.hunger = max(0.0, pet.hunger - elapsed_minutes * 0.3)
    else:
        pet.hunger    = max(0.0, pet.hunger    - elapsed_minutes * DECAY_RATES["hunger"])
        pet.happiness = max(0.0, pet.happiness - elapsed_minutes * DECAY_RATES["happiness"])
        pet.energy    = max(0.0, pet.energy    - elapsed_minutes * DECAY_RATES["energy"])

    if pet.hunger < 10:
        pet.health = max(0.0, pet.health - elapsed_minutes * 1.0)
    elif pet.hunger > 30:
        pet.health = min(100.0, pet.health + elapsed_minutes * 0.2)

    if pet.health <= 0:
        pet.is_alive = False

    pet.last_updated = now
    db.commit()
    db.refresh(pet)
    return pet


def perform_action(pet: models.Pet, action: str, db: Session) -> dict:
    if not pet.is_alive:
        return {"success": False, "message": "Your pet has passed away."}

    apply_time_decay(pet, db)
    msg = ""

    if action == "feed":
        if pet.is_sleeping:
            return {"success": False, "message": "Your pet is sleeping."}
        if pet.hunger >= 95:
            return {"success": False, "message": "Your pet is already full."}
        pet.hunger = min(100.0, pet.hunger + 25.0)
        pet.health = min(100.0, pet.health + 5.0)
        pet.experience += 5
        msg = "Your pet enjoyed the meal."

    elif action == "play":
        if pet.is_sleeping:
            return {"success": False, "message": "Your pet is sleeping."}
        if pet.energy < 15:
            return {"success": False, "message": "Your pet is too tired to play."}
        pet.happiness = min(100.0, pet.happiness + 20.0)
        pet.energy    = max(0.0,   pet.energy    - 15.0)
        pet.hunger    = max(0.0,   pet.hunger    - 5.0)
        pet.experience += 10
        msg = "Your pet had a great time playing."

    elif action == "sleep":
        if pet.is_sleeping:
            return {"success": False, "message": "Your pet is already sleeping."}
        pet.is_sleeping = True
        msg = "Your pet is now resting."

    elif action == "wake":
        if not pet.is_sleeping:
            return {"success": False, "message": "Your pet is already awake."}
        pet.is_sleeping = False
        msg = "Your pet woke up."

    elif action == "heal":
        if pet.health >= 100:
            return {"success": False, "message": "Your pet is already at full health."}
        pet.health = min(100.0, pet.health + 30.0)
        pet.experience += 3
        msg = "Your pet recovered some health."

    else:
        return {"success": False, "message": "Unknown action."}

    leveled_up = False
    while pet.experience >= pet.level * XP_PER_LEVEL:
        pet.experience -= pet.level * XP_PER_LEVEL
        pet.level += 1
        leveled_up = True

    evolved = False
    for stage, required_level in EVOLUTION_LEVELS.items():
        if pet.level >= required_level and pet.evolution_stage < stage:
            pet.evolution_stage = stage
            evolved = True

    pet.last_updated = _now()
    db.commit()
    db.refresh(pet)

    if evolved:
        msg += f" Your pet evolved to stage {pet.evolution_stage}."
    elif leveled_up:
        msg += f" Level up! Now level {pet.level}."

    return {"success": True, "message": msg}
