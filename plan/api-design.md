# Tiến Lên Miền Nam — API Design

> **C4 Level**: 3 — Component Specification (API)

## 1. API Overview

**Base URL**: `https://[app-name].vercel.app/api`

All endpoints:
- Return JSON responses
- Support CORS for frontend access
- Use async/await for MongoDB operations

## 2. Room Endpoints

### 2.1 POST /api/rooms — Create Room

**Description**: Creates a new game room and returns a 6-character shareable code.

**Request Body:**
```json
{
  "name": "Phòng của Minh",
  "isPrivate": false,
  "maxPlayers": 4,
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "playerName": "Minh"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "room": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "code": "ABC123",
    "name": "Phòng của Minh",
    "isPrivate": false,
    "maxPlayers": 4,
    "currentPlayers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Minh",
        "joinedAt": "2026-05-29T10:00:00Z"
      }
    ],
    "gameId": null,
    "status": "lobby",
    "createdAt": "2026-05-29T10:00:00Z"
  },
  "shareUrl": "/room/ABC123"
}
```

**Error Responses:**
- 400: Invalid request body (missing fields, invalid maxPlayers)
- 409: Player already in a room

### 2.2 GET /api/rooms — List Public Rooms

**Description**: Returns list of public rooms that are open for players.

**Response (200 OK):**
```json
{
  "success": true,
  "rooms": [
    {
      "id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "code": "ABC123",
      "name": "Phòng của Minh",
      "maxPlayers": 4,
      "currentPlayers": [
        {"id": "550e8400-e29b-41d4-a716-446655440000", "name": "Minh"}
      ],
      "status": "lobby"
    },
    {
      "id": "65f1a2b3c4d5e6f7a8b9c0d2",
      "code": "XYZ789",
      "name": "Phòng của Lan",
      "maxPlayers": 2,
      "currentPlayers": [
        {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Lan"},
        {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "Hùng"}
      ],
      "status": "full"
    }
  ]
}
```

### 2.3 GET /api/rooms/{roomCode} — Get Room Details

**Description**: Returns detailed room information including current players and game status.

**Path Parameters:**
- `roomCode`: 6-character alphanumeric room code (e.g., "ABC123")

**Response (200 OK):**
```json
{
  "success": true,
  "room": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "code": "ABC123",
    "name": "Phòng của Minh",
    "isPrivate": false,
    "maxPlayers": 4,
    "currentPlayers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Minh",
        "joinedAt": "2026-05-29T10:00:00Z"
      }
    ],
    "gameId": null,
    "status": "lobby",
    "createdAt": "2026-05-29T10:00:00Z"
  }
}
```

**Error Responses:**
- 404: Room not found

### 2.4 POST /api/rooms/{roomCode}/join — Join Room

**Description**: Adds a player to an existing room.

**Request Body:**
```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440003",
  "playerName": "Hùng"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "room": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "code": "ABC123",
    "name": "Phòng của Minh",
    "maxPlayers": 4,
    "currentPlayers": [
      {"id": "550e8400-e29b-41d4-a716-446655440000", "name": "Minh"},
      {"id": "550e8400-e29b-41d4-a716-446655440003", "name": "Hùng"}
    ],
    "status": "lobby"
  }
}
```

**Error Responses:**
- 404: Room not found
- 409: Room is full / Player already in room
- 400: Room is private (use code directly)

### 2.5 DELETE /api/rooms/{roomCode}/leave — Leave Room

**Description**: Removes a player from a room.

**Request Body:**
```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Left room successfully"
}
```

**Error Responses:**
- 404: Room not found
- 400: Player not in room

### 2.6 POST /api/rooms/{roomCode}/start — Start Game

**Description**: Host starts the game, dealing 13 cards to each player.

**Request Body:**
```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "game": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d3",
    "roomId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "players": [
      {"id": "550e8400...", "name": "Minh", "isHost": true, "cards": [...]},
      {"id": "550e8400...", "name": "Hùng", "isHost": false, "cards": [...]}
    ],
    "currentTurnIndex": 0,
    "lastPlay": null,
    "status": "playing"
  }
}
```

**Error Responses:**
- 404: Room not found
- 400: Not host / Not enough players (min 2) / Game already started
- 409: Game already in progress

## 3. Game Endpoints

### 3.1 GET /api/games/{gameId} — Get Game State

**Description**: Returns the current state of a game including all players' information (card counts only, not full cards).

**Response (200 OK):**
```json
{
  "success": true,
  "game": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d3",
    "roomId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "players": [
      {
        "id": "550e8400...",
        "name": "Minh",
        "isHost": true,
        "connected": true,
        "cardCount": 13,
        "cards": null  // Full cards only returned to owning player
      },
      {
        "id": "550e8400...",
        "name": "Hùng",
        "isHost": false,
        "connected": true,
        "cardCount": 13,
        "cards": null
      }
    ],
    "currentTurnIndex": 0,
    "lastPlay": null,
    "status": "playing",
    "direction": 1,
    "passCount": 0
  }
}
```

### 3.2 POST /api/games/{gameId}/play — Play Cards

**Description**: Player plays a combination of cards.

**Request Body:**
```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "cards": [
    {"suit": "spades", "rank": 14},
    {"suit": "hearts", "rank": 14},
    {"suit": "clubs", "rank": 14},
    {"suit": "diamonds", "rank": 14}
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "game": {
    // Full updated game state
  },
  "message": "Played bomb (four of a kind)"
}
```

**Error Responses:**
- 404: Game not found
- 400: Invalid combination / Cards not in hand / Must play 3♦ first
- 403: Not your turn
- 409: Game already finished
- 429: Rate limited (anti-cheat)

### 3.3 POST /api/games/{gameId}/pass — Pass Turn

**Description**: Player passes their turn (only allowed after first round or when cannot beat).

**Request Body:**
```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "game": {
    // Full updated game state
  },
  "passCount": 2,
  "message": "Player passed"
}
```

**Error Responses:**
- 404: Game not found
- 400: Can only pass after first round or when cannot beat
- 403: Not your turn
- 409: Game already finished

### 3.4 GET /api/games/{gameId}?playerId={playerId} — Get Game with Own Cards

**Description**: Returns game state including the full cards for the requesting player.

**Query Parameters:**
- `playerId`: Player's UUID to verify ownership

**Response (200 OK):**
Same as GET /api/games/{gameId} but with `cards` field populated for requesting player.

## 4. WebSocket Events

### 4.1 Connection

**Endpoint**: `WS /ws/games/{gameId}`

**Headers**:
```
Upgrade: websocket
Connection: Upgrade
```

### 4.2 Server -> Client Events

#### game_state
Sent on connection and after any state change.
```json
{
  "event": "game_state",
  "data": { /* full game state */ },
  "timestamp": "2026-05-29T10:00:00Z"
}
```

#### player_played
```json
{
  "event": "player_played",
  "data": {
    "playerId": "550e8400...",
    "playerName": "Minh",
    "combinationType": "bomb",
    "cardCount": 2
  },
  "timestamp": "2026-05-29T10:00:05Z"
}
```

#### player_passed
```json
{
  "event": "player_passed",
  "data": {
    "playerId": "550e8400...",
    "playerName": "Hùng",
    "passCount": 1
  },
  "timestamp": "2026-05-29T10:00:10Z"
}
```

#### game_over
```json
{
  "event": "game_over",
  "data": {
    "winner": {
      "id": "550e8400...",
      "name": "Minh"
    },
    "reason": "empty_hand",
    "finalState": { /* complete game state */ }
  },
  "timestamp": "2026-05-29T10:05:00Z"
}
```

#### error
```json
{
  "event": "error",
  "data": {
    "code": "INVALID_COMBINATION",
    "message": "Cards must be same rank for bomb"
  }
}
```

### 4.3 Client -> Server Events

#### play
```json
{
  "event": "play",
  "data": {
    "playerId": "550e8400...",
    "cards": [
      {"suit": "hearts", "rank": 7},
      {"suit": "diamonds", "rank": 7}
    ]
  }
}
```

#### pass
```json
{
  "event": "pass",
  "data": {
    "playerId": "550e8400..."
  }
}
```

## 5. Error Handling

### 5.1 Error Response Format
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable Vietnamese message",
  "details": {}
}
```

### 5.2 Error Codes
| HTTP Status | Error Code | Vietnamese Message |
|-------------|-----------|-------------------|
| 400 | INVALID_REQUEST | Yêu cầu không hợp lệ |
| 400 | INVALID_COMBINATION | Bộ bài không hợp lệ |
| 400 | CARDS_NOT_IN_HAND | Bạn không có những lá bài này |
| 400 | MUST_PLAY_FIRST | Phải đánh 3♦ hoặc lá bài chứa 3♦ |
| 400 | PASS_NOT_ALLOWED | Chưa thể bỏ lượt, hãy đánh bài |
| 403 | NOT_YOUR_TURN | Chưa đến lượt bạn |
| 403 | NOT_HOST | Chỉ chủ phòng mới có thể làm điều này |
| 404 | ROOM_NOT_FOUND | Phòng không tồn tại |
| 404 | GAME_NOT_FOUND | Trò chơi không tồn tại |
| 404 | PLAYER_NOT_FOUND | Người chơi không tồn tại |
| 409 | ROOM_FULL | Phòng đã đầy |
| 409 | GAME_STARTED | Trò chơi đã bắt đầu |
| 409 | GAME_FINISHED | Trò chơi đã kết thúc |
| 409 | PLAYER_ALREADY_IN_ROOM | Bạn đã ở trong phòng khác |
| 429 | RATE_LIMITED | Quá nhiều yêu cầu, vui lòng chờ |

## 6. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/rooms | 10 | per minute |
| POST /api/games/{id}/play | 5 | per second |
| WS /ws/games/{id} | 30 msg | per minute |

Exceeding rate limits returns 429 with `Retry-After` header.
