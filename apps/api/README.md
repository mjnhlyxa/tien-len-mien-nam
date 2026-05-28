# Tiến Lên Miền Nam API

FastAPI backend for Tiến Lên Miền Nam card game.

## Setup

```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## Run

```bash
uvicorn src.main:app --reload --port 8000
```

## Environment Variables

```
MONGODB_URI=mongodb://10.60.184.61:27017
MONGODB_DB_NAME=tien_len_mien_nam
```

## API Endpoints

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms` - List public rooms
- `GET /api/rooms/{code}` - Get room by code
- `POST /api/rooms/{code}/join` - Join room
- `DELETE /api/rooms/{code}/leave` - Leave room
- `POST /api/rooms/{code}/start` - Start game (host only)

### Games
- `GET /api/games/{gameId}` - Get game state
- `POST /api/games/{gameId}/play` - Play cards
- `POST /api/games/{gameId}/pass` - Pass turn
- `GET /api/games/room/{roomCode}` - Get game by room code
