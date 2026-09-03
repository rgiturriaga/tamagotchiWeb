# TomagochiWeb

A full-stack virtual pet web game inspired by Tamagotchi, with Pokemon-style creatures. Users can raise their own pets, manage their stats, watch them evolve, and see their friends' pets on a community page.

## Pets

| Pet | Type | Evolution stages |
|-----|------|-----------------|
| **Flambit** | Fire | Tiny Flambit → Fire Lizard → Inferno Dragon |
| **Aquapup** | Water | Water Blob → Aqua Puppy → Sea Serpent |
| **Leafling** | Grass | Tiny Sprout → Leaf Bunny → Forest Guardian |

## Getting Started

### Requirements

- Python 3.10+
- Node.js 18+

### Backend (FastAPI)

```bash
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python main.py
# Runs on http://localhost:8000
```

### Frontend (React + Vite)

```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

## Features

- User accounts with JWT authentication
- Three starter pets, each with a unique type and three evolution stages
- Real-time stat decay: Hunger, Happiness, Energy, and Health
- Pet actions: Feed, Play, Sleep, Wake, Heal
- Leveling system with XP gained from caring actions
- Evolution at Level 5 (teen) and Level 15 (adult)
- Community page showing all active pets from all users
- WebSocket support for real-time stat updates

## Tech Stack

- **Frontend:** React 18, Vite, Vanilla CSS
- **Backend:** FastAPI, Python
- **Database:** SQLite via SQLAlchemy
- **Auth:** JWT (python-jose) + bcrypt (passlib)
- **Realtime:** WebSockets

## Project Structure

```
tomagochiWeb/
├── backend/
│   ├── main.py              # FastAPI app and route definitions
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── auth.py              # JWT authentication helpers
│   ├── game_logic.py        # Pet action handling and stat decay
│   ├── database.py          # Database engine and session factory
│   └── websocket_manager.py # WebSocket connection manager
├── src/
│   ├── pages/
│   │   ├── AuthPage.jsx
│   │   ├── HomePage.jsx
│   │   └── CommunityPage.jsx
│   ├── components/
│   │   ├── PetCard.jsx
│   │   ├── NewPetModal.jsx
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── api.js
│   └── constants.js
└── public/
    ├── flambit.jpg
    ├── aquapup.jpg
    └── leafling.jpg
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/pets` | List all pets belonging to the current user |
| POST | `/api/pets` | Create a new pet |
| GET | `/api/pets/{id}` | Get a specific pet |
| POST | `/api/pets/{id}/action` | Perform an action on a pet |
| DELETE | `/api/pets/{id}` | Delete a pet |
| GET | `/api/community` | List all alive pets from all users |
| GET | `/api/species` | List available species |
