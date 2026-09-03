# 🥚 TomagochiWeb

A full-stack Tamagotchi-inspired web game with Pokemon-style creatures! Raise your pet, feed it, play with it, watch it evolve, and share your world with friends.

## 🐾 Pets

| Pet | Type | Evolutions |
|-----|------|-----------|
| 🔥 **Flambit** | Fire | Tiny Flambit → Fire Lizard → Inferno Dragon |
| 💧 **Aquapup** | Water | Water Blob → Aqua Puppy → Sea Serpent |
| 🌿 **Leafling** | Grass | Tiny Sprout → Leaf Bunny → Forest Guardian |

## 🚀 Running the Game

### Backend (FastAPI + Python)
```bash
# From the project root
.venv/bin/python main.py
# Server runs on http://localhost:8000
```

### Frontend (React + Vite)
```bash
npm run dev
# Opens on http://localhost:5173
```

## 🎮 Features

- **User Accounts** — Register and log in to save your pets
- **3 Starter Pets** — Each with unique type and 3 evolution stages
- **Real-time Stats** — Hunger, Happiness, Energy, and Health decay over time
- **Actions** — Feed 🍖, Play 🎮, Sleep 🌙, Heal 💊
- **Leveling System** — Earn XP from caring for your pet
- **Evolutions** — Evolve at Level 5 (teen) and Level 15 (adult)
- **Community Page** — See all your friends' pets live
- **WebSocket** — Real-time updates when stats change

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: FastAPI + Python
- **Database**: SQLite (via SQLAlchemy)
- **Auth**: JWT tokens + bcrypt
- **Realtime**: WebSockets

## 📁 Project Structure

```
tomagochiWeb/
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # JWT authentication
│   ├── game_logic.py    # Pet actions & stat decay
│   ├── database.py      # DB connection
│   └── websocket_manager.py
├── src/
│   ├── pages/
│   │   ├── AuthPage.jsx     # Login/Register
│   │   ├── HomePage.jsx     # Main game view
│   │   └── CommunityPage.jsx# Friends' pets
│   ├── components/
│   │   ├── PetCard.jsx      # Pet display + actions
│   │   ├── NewPetModal.jsx  # Pet creation flow
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── api.js            # API client
│   └── constants.js      # Species metadata
└── public/
    ├── flambit.jpg
    ├── aquapup.jpg
    └── leafling.jpg
```
