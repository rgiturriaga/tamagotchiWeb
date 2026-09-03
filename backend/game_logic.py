from datetime import datetime, timezone
from sqlalchemy.orm import Session
from . import models


# ── Species Data ───────────────────────────────────────────────────────────────
SPECIES = {
    1: {"name": "Flambit",  "type": "fire",  "color": "#FF6B35"},
    2: {"name": "Aquapup",  "type": "water", "color": "#4ECDC4"},
    3: {"name": "Leafling", "type": "grass", "color": "#95E07A"},
}

# Stat decay per minute
DECAY_RATES = {
    "hunger":    0.8,   # gets hungry over time
    "happiness": 0.5,   # gets bored
    "energy":    0.3,   # gets tired
}

# XP thresholds per level
XP_PER_LEVEL = 100
EVOLUTION_LEVELS = {1: 5, 2: 15}  # level 5 → teen, level 15 → adult


def _now() -> datetime:
    """Return current UTC time (timezone-aware)."""
    return datetime.now(timezone.utc)


def apply_time_decay(pet: models.Pet, db: Session) -> models.Pet:
    """Apply stat decay based on elapsed time since last update."""
    if not pet.is_alive:
        return pet

    now = _now()

    # last_updated may be timezone-naive if the DB stored it that way
    last = pet.last_updated
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)

    elapsed_minutes = (now - last).total_seconds() / 60.0
    elapsed_minutes = min(elapsed_minutes, 60)  # cap at 1 hour to avoid huge jumps

    if pet.is_sleeping:
        # While sleeping: restore energy, drain hunger slowly
        pet.energy = min(100.0, pet.energy + elapsed_minutes * 1.5)
        pet.hunger = max(0.0, pet.hunger - elapsed_minutes * 0.3)
    else:
        pet.hunger    = max(0.0, pet.hunger    - elapsed_minutes * DECAY_RATES["hunger"])
        pet.happiness = max(0.0, pet.happiness - elapsed_minutes * DECAY_RATES["happiness"])
        pet.energy    = max(0.0, pet.energy    - elapsed_minutes * DECAY_RATES["energy"])

    # Health impact from critical stats
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
    """Perform a pet action and return result message."""
    if not pet.is_alive:
        return {"success": False, "message": "Your pet has passed away... 💔"}

    apply_time_decay(pet, db)
    msg = ""

    if action == "feed":
        if pet.is_sleeping:
            return {"success": False, "message": "Shhh! Your pet is sleeping! 😴"}
        if pet.hunger >= 95:
            return {"success": False, "message": "Your pet is already full! 🍽️"}
        pet.hunger = min(100.0, pet.hunger + 25.0)
        pet.health = min(100.0, pet.health + 5.0)
        pet.experience += 5
        msg = "Yum yum! Your pet loved the meal! 🍖"

    elif action == "play":
        if pet.is_sleeping:
            return {"success": False, "message": "Let your pet sleep! 😴"}
        if pet.energy < 15:
            return {"success": False, "message": "Your pet is too tired to play! 😓"}
        pet.happiness = min(100.0, pet.happiness + 20.0)
        pet.energy    = max(0.0,   pet.energy    - 15.0)
        pet.hunger    = max(0.0,   pet.hunger    - 5.0)
        pet.experience += 10
        msg = "Wheee! Your pet had a blast! 🎉"

    elif action == "sleep":
        if pet.is_sleeping:
            return {"success": False, "message": "Already sleeping! 😴"}
        pet.is_sleeping = True
        msg = "Sweet dreams! 🌙"

    elif action == "wake":
        if not pet.is_sleeping:
            return {"success": False, "message": "Your pet is already awake! ☀️"}
        pet.is_sleeping = False
        msg = "Good morning! ☀️"

    elif action == "heal":
        if pet.health >= 100:
            return {"success": False, "message": "Your pet is perfectly healthy! 💚"}
        pet.health = min(100.0, pet.health + 30.0)
        pet.experience += 3
        msg = "Your pet feels much better! 💊"

    else:
        return {"success": False, "message": "Unknown action."}

    # Level up check
    leveled_up = False
    while pet.experience >= pet.level * XP_PER_LEVEL:
        pet.experience -= pet.level * XP_PER_LEVEL
        pet.level += 1
        leveled_up = True

    # Evolution check
    evolved = False
    for stage, required_level in EVOLUTION_LEVELS.items():
        if pet.level >= required_level and pet.evolution_stage < stage:
            pet.evolution_stage = stage
            evolved = True

    pet.last_updated = _now()
    db.commit()
    db.refresh(pet)

    if evolved:
        msg += f" 🌟 Your pet EVOLVED to stage {pet.evolution_stage}!"
    elif leveled_up:
        msg += f" ⬆️ Level up! Now level {pet.level}!"

    return {"success": True, "message": msg}
