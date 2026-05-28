# Tiến Lên Miền Nam — Container Architecture

> **C4 Level**: 2 — Container/Application Architecture

## 1. Application Structure

### 1.1 High-Level Container Diagram
```
┌────────────────────────────────────────────────────────────────┐
│                       BROWSER CLIENT                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Web Frontend (Next.js 14 SPA)              │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │ │
│  │  │  Lobby     │ │ Game Room  │ │ Match History      │    │ │
│  │  │  Page      │ │  Page      │ │ Page               │    │ │
│  │  │  /         │ │ /room/[id] │ │ /history           │    │ │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────┐     │ │
│  │  │         Game Engine (Pure JavaScript)         │     │ │
│  │  │  - rules.ts: combination validation           │     │ │
│  │  │  - deck.ts: shuffle and deal                  │     │ │
│  │  │  - types.ts: TypeScript interfaces            │     │ │
│  │  └────────────────────────────────────────────────┘     │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────┐     │ │
│  │  │         Player Identity Manager               │     │ │
│  │  │  - UUID v4 generation                          │     │ │
│  │  │  - localStorage persistence                   │     │ │
│  │  └────────────────────────────────────────────────┘     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              │ HTTP REST + WebSocket           │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           Bun Monorepo (apps/api FastAPI)                  │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │ │
│  │  │ /api/rooms │ │ /api/games │ │ /ws/games/[id]      │    │ │
│  │  │           │ │           │ │                     │    │ │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              │ MongoDB Protocol               │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           MongoDB (10.60.184.61:27017)                     │ │
│  │  ┌────────────┐ ┌────────────────────────────────────┐    │ │
│  │  │  games    │ │  rooms                             │    │ │
│  │  │  collection│ │  collection                       │    │ │
│  │  └────────────┘ └────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## 2. Frontend Architecture (apps/web)

### 2.1 Pages/Routes
| Route | Type | Description |
|-------|------|-------------|
| `/` | SSG | Lobby page, room list, create/join buttons |
| `/room/[roomId]` | CSR | Main game room page with real-time state |
| `/api/rooms` | API Route | REST proxy to FastAPI |
| `/api/games` | API Route | REST proxy to FastAPI |
| `/api/games/[id]` | API Route | REST proxy to FastAPI |
| `/ws/games/[id]` | WebSocket | WebSocket connection to FastAPI |

### 2.2 Component Hierarchy
```
apps/web/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Lobby (SSG)
│   ├── room/
│   │   └── [roomId]/
│   │       └── page.tsx        # Game room (client component)
│   └── globals.css
├── components/
│   ├── ui/                     # Generic UI primitives
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Avatar.tsx
│   └── game/                   # Game-specific UI
│       ├── GameBoard.tsx       # Card display area
│       ├── Card.tsx            # Individual card
│       ├── PlayerHand.tsx      # Player's cards
│       ├── PlayerPanel.tsx     # Player info (name, cards remaining)
│       ├── PlayArea.tsx       # Current play area showing last play
│       ├── RoomCard.tsx        # Room listing card
│       └── Chat.tsx           # In-room chat (post-MVP)
├── lib/
│   ├── mongodb.ts              # MongoDB client singleton
│   ├── player.ts               # Anonymous ID management
│   ├── websocket.ts            # WebSocket client wrapper
│   └── tien-len/
│       ├── types.ts            # Game types (Card, Combo, etc.)
│       ├── rules.ts           # Combination validation
│       ├── deck.ts            # Deck operations
│       └── engine.ts          # Game state machine
├── models/
│   ├── Game.ts                 # Mongoose Game schema
│   └── Room.ts                # Mongoose Room schema
└── types/
    └── index.ts                # Shared TypeScript types
```

### 2.3 State Management Approach
- **Server State**: React Query for API data fetching
- **Client State**: React useState/useReducer for UI state
- **Game State**: WebSocket subscription synced with React Query cache
- **URL State**: Room ID in URL path for shareability

## 3. Backend Architecture (apps/api)

### 3.1 FastAPI Application Structure
```
apps/api/
├── main.py                     # FastAPI app entry point
├── routers/
│   ├── __init__.py
│   ├── rooms.py               # Room management endpoints
│   └── games.py               # Game management endpoints
├── models/
│   ├── __init__.py
│   ├── room.py                # Room Pydantic models
│   └── game.py                # Game Pydantic models
├── services/
│   ├── __init__.py
│   ├── room_service.py        # Room business logic
│   └── game_service.py        # Game business logic
├── game_logic/
│   ├── __init__.py
│   ├── deck.py                # Deck operations
│   ├── rules.py               # Combination validation
│   └── engine.py              # Game state machine
├── database/
│   ├── __init__.py
│   └── mongodb.py             # MongoDB connection
└── websockets/
    ├── __init__.py
    └── game_ws.py            # WebSocket handlers
```

### 3.2 API Design

#### Room Management Endpoints
```
POST /api/rooms
  Request: { name: string, isPrivate: boolean, maxPlayers: number }
  Response: { id: string, code: string, name: string, isPrivate: boolean, ... }
  Creates a new room, returns 6-char code for sharing

GET /api/rooms
  Response: { rooms: Room[] }
  Returns list of public open rooms

GET /api/rooms/{roomId}
  Response: { id, name, players, status, gameId }
  Returns room details and current game state

POST /api/rooms/{roomId}/join
  Request: { playerId: string, playerName: string }
  Response: { success: boolean, room: Room }
  Joins a player to a room

DELETE /api/rooms/{roomId}/leave
  Request: { playerId: string }
  Response: { success: boolean }
  Removes player from room
```

#### Game Management Endpoints
```
POST /api/games
  Request: { roomId: string, playerId: string }
  Response: { id: string, ... }
  Creates new game in room, deals cards

GET /api/games/{gameId}
  Response: { id, roomId, players, cards, currentTurn, status, ... }
  Returns current game state

POST /api/games/{gameId}/play
  Request: { playerId: string, combination: Card[] }
  Response: { success: boolean, game: GameState }
  Validates and applies card play

POST /api/games/{gameId}/pass
  Request: { playerId: string }
  Response: { success: boolean, game: GameState }
  Player passes their turn
```

#### WebSocket Endpoint
```
WS /ws/games/{gameId}
  Events sent to client:
    - game_state: Full game state update
    - player_played: Player played a combination
    - player_passed: Player passed their turn
    - game_over: Game ended with winner
    - player_joined: Player joined room
    - player_left: Player left room
  
  Events received from client:
    - play: Player plays a combination
    - pass: Player passes turn
```

### 3.3 Data Models

#### Game Document Schema (MongoDB)
```json
{
  "_id": ObjectId,
  "roomId": ObjectId,
  "players": [{
    "id": string,
    "name": string,
    "isHost": boolean,
    "connected": boolean,
    "cards": Card[]
  }],
  "currentTurnIndex": number,
  "lastPlay": {
    "playerId": string,
    "combination": Card[],
    "combinationType": string
  } | null,
  "deck": Card[],
  "direction": 1 | -1,
  "status": "waiting" | "playing" | "finished",
  "result": {
    "winner": string,
    "reason": string
  } | null,
  "createdAt": Date,
  "updatedAt": Date
}
```

#### Room Document Schema (MongoDB)
```json
{
  "_id": ObjectId,
  "code": string,
  "name": string,
  "isPrivate": boolean,
  "maxPlayers": number,
  "currentPlayers": [{
    "id": string,
    "name": string,
    "joinedAt": Date
  }],
  "gameId": ObjectId | null,
  "status": "lobby" | "full" | "playing",
  "createdAt": Date
}
```

## 4. Real-time Communication Strategy

### 4.1 WebSocket Approach
- Primary: WebSocket for real-time game state updates
- Automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- Heartbeat ping every 30s to detect stale connections
- Graceful degradation to polling if WebSocket fails

### 4.2 Connection Flow
1. Client connects to WebSocket on game page mount
2. Server sends initial game_state event
3. Client sends play/pass events
4. Server broadcasts updated game_state to all connected clients
5. On game_over, server sends final state with result

### 4.3 Disconnect Handling
- Mark player as disconnected after 30s of no response
- Auto-pass for disconnected players after timeout
- Allow reconnection to resume game within 60s

## 5. Deployment Architecture

### 5.1 Monorepo Structure
```
tien-len-mien-nam/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/app/            # App Router pages
│   │   ├── src/components/     # React components
│   │   └── package.json
│   └── api/                    # FastAPI backend
│       ├── src/routers/        # API routes
│       ├── src/game_logic/     # Game rules engine
│       ├── src/websockets/     # WebSocket handlers
│       └── package.json
├── package.json               # Bun workspace root
├── bun.lockb                   # Bun lockfile
└── vercel.json                # Vercel config
```

### 5.2 Deployment Flow
```
┌──────────────────────────────────────┐
│           GitHub Push                │
│  (mjnhlyxa / ghp_WUeEJAHQrZIPx...)  │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│         Vercel (Production)          │
│  - Frontend: Next.js SSR             │
│  - Backend: FastAPI on Serverless    │
│  - WebSocket: Vercel Edge Functions  │
└────────────────┬─────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│  MongoDB     │  │   Vercel    │
│  10.60.184.61│  │   Edge      │
│  :27017      │  │   Cache     │
└──────────────┘  └──────────────┘
```

### 5.3 Environment Variables
```
MONGODB_URI=mongodb://10.60.184.61:27017
MONGODB_DB_NAME=tien_len_mien_nam
```

## 6. File Structure (Complete)

```
tien-len-mien-nam/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── globals.css
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── room/
│   │   │   │       └── [roomId]/
│   │   │   │           └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   └── Badge.tsx
│   │   │   │   └── game/
│   │   │   │       ├── Card.tsx
│   │   │   │       ├── GameBoard.tsx
│   │   │   │       ├── PlayerHand.tsx
│   │   │   │       ├── PlayerPanel.tsx
│   │   │   │       ├── PlayArea.tsx
│   │   │   │       ├── RoomCard,
│   │   │   │       └── Chat.tsx
│   │   │   ├── lib/
│   │   │   │   ├── player.ts
│   │   │   │   ├── websocket.ts
│   │   │   │   └── tien-len/
│   │   │   │       ├── types.ts
│   │   │   │       ├── rules.ts
│   │   │   │       ├── deck.ts
│   │   │   │       └── engine.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tailwind.config.ts
│   └── api/
│       ├── src/
│       │   ├── main.py
│       │   ├── routers/
│       │   │   ├── __init__.py
│       │   │   ├── rooms.py
│       │   │   └── games.py
│       │   ├── models/
│       │   │   ├── __init__.py
│       │   │   ├── room.py
│       │   │   └── game.py
│       │   ├── services/
│       │   │   ├── __init__.py
│       │   │   ├── room_service.py
│       │   │   └── game_service.py
│       │   ├── game_logic/
│       │   │   ├── __init__.py
│       │   │   ├── deck.py
│       │   │   ├── rules.py
│       │   │   └── engine.py
│       │   ├── database/
│       │   │   ├── __init__.py
│       │   │   └── mongodb.py
│       │   └── websockets/
│       │       ├── __init__.py
│       │       └── game_ws.py
│       ├── requirements.txt
│       └── pyproject.toml
├── package.json
├── bun.lockb
├── tsconfig.json
├── vercel.json
└── README.md
```
