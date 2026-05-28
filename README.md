# Tiến Lên Miền Nam

Vietnamese card game - Tiến Lên Miền Nam online with friends.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Runtime**: Bun monorepo

## Project Structure

```
tien-len-mien-nam/
├── apps/
│   ├── web/          # Next.js frontend
│   │   └── src/
│   │       ├── app/           # Next.js app router pages
│   │       ├── components/   # UI components
│   │       ├── lib/          # Utilities and game logic
│   │       └── types/        # TypeScript types
│   └── api/           # FastAPI backend
│       └── src/
│           ├── routers/       # API routes
│           ├── game_logic/   # Card game rules
│           ├── models/       # Pydantic models
│           └── database/     # MongoDB connection
├── package.json       # Bun workspace root
└── README.md
```

## Getting Started

### Frontend
```bash
cd apps/web
bun install
bun run dev
```

### Backend
```bash
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

## Game Rules

Tiến Lên Miền Nam is a Vietnamese shedding card game:

- 2-4 players, 13 cards each
- Valid combinations: single, pair, triple, straight (3+), full house, bomb (4 of a kind)
- Must beat previous play with same combo type and higher rank
- Bombs beat all non-bomb combos
- First to empty hand wins

## Environment

MongoDB URI: `mongodb://10.60.184.61:27017`
