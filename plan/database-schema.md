# Tiến Lên Miền Nam — Database Schema Design

> **C4 Level**: 3 — Component Specification (Database)

## 1. Database Overview

### 1.1 Technology
- **Database**: MongoDB 6.x
- **Driver**: Motor (async Python driver)
- **Host**: 10.60.184.61:27017 (External MongoDB instance)
- **Database Name**: tien_len_mien_nam

### 1.2 Collections Summary
| Collection | Purpose | Est. Doc Size | Growth Rate |
|------------|---------|---------------|-------------|
| rooms | Active game rooms | ~1KB | ~50/day |
| games | Active and completed games | ~5KB | ~50/day |

## 2. Schema Definitions

### 2.1 Card Type (Embedded)

Cards are embedded in game documents, not stored as separate documents.

```typescript
// Card representation
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
  // Suit symbols: hearts=♥, diamonds=♦, clubs=♣, spades=♠
  // Rank values: 3-10 as actual numbers, J=11, Q=12, K=13, A=14, 2=15
}

type Suit = Card['suit'];
type Rank = Card['rank'];
```

### 2.2 Room Schema

```python
# apps/api/src/models/room.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")

class PlayerInRoom(BaseModel):
    id: str = Field(..., description="Player UUID")
    name: str = Field(default="Anonymous", max_length=30)
    joinedAt: datetime = Field(default_factory=datetime.utcnow)

class Room(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    code: str = Field(..., min_length=6, max_length=6, description="6-char room code")
    name: str = Field(..., max_length=50)
    isPrivate: bool = Field(default=False)
    maxPlayers: int = Field(default=4, ge=2, le=4)
    currentPlayers: list[PlayerInRoom] = Field(default_factory=list)
    gameId: Optional[PyObjectId] = Field(None, description="Game ID when game starts")
    status: str = Field(default="lobby", pattern="^(lobby|full|playing)$")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
```

**MongoDB Indexes:**
```javascript
// Unique code index
db.rooms.createIndex({ "code": 1 }, { unique: true })

// Public room listing
db.rooms.createIndex({ "isPrivate": 1, "status": 1 })

// Host lookup
db.rooms.createIndex({ "currentPlayers.id": 1 })
```

### 2.3 Game Schema

```python
# apps/api/src/models/game.py
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field
from bson import ObjectId

class CombinationType(Literal["single", "pair", "triple", "straight", "full_house", "bomb"]):
    pass

class Card(BaseModel):
    suit: Literal["hearts", "diamonds", "clubs", "spades"]
    rank: int = Field(..., ge=3, le=15)
    # Rank: 3-10 as actual numbers, J=11, Q=12, K=13, A=14, 2=15

class PlayerInGame(BaseModel):
    id: str = Field(..., description="Player UUID")
    name: str = Field(default="Anonymous", max_length=30)
    isHost: bool = Field(default=False)
    connected: bool = Field(default=True)
    cards: list[Card] = Field(default_factory=list)

class PlayedCombination(BaseModel):
    playerId: str
    playerName: str
    combinationType: CombinationType
    cards: list[Card]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Game(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    roomId: str = Field(..., description="Room ID reference")
    players: list[PlayerInGame] = Field(default_factory=list)
    currentTurnIndex: int = Field(default=0, description="Index of player's turn")
    lastPlay: Optional[PlayedCombination] = Field(None, description="Last played combination")
    direction: int = Field(default=1, description="Turn direction: 1 or -1")
    firstPlayCard: Optional[Card] = Field(None, description="3♦ or card containing it (required first play)")
    hasStartedFirstRound: bool = Field(default=False, description="First round completed")
    deck: list[Card] = Field(default_factory=list, description="Remaining deck")
    status: str = Field(default="waiting", pattern="^(waiting|playing|finished)$")
    result: Optional[dict] = Field(None, description="Game result when finished")
    passCount: int = Field(default=0, description="Consecutive passes")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
```

**MongoDB Indexes:**
```javascript
// Room lookup
db.games.createIndex({ "roomId": 1 }, { unique: true })

// Player lookup
db.games.createIndex({ "players.id": 1 })

// Recent games
db.games.createIndex({ "createdAt": -1 })

// Active games (for stats)
db.games.createIndex({ "status": 1, "createdAt": -1 })
```

### 2.4 Combination Validation (Rule Reference)

```python
# Combination types and their validation
COMBINATIONS = {
    "single": {"min": 1, "max": 1},
    "pair": {"min": 2, "max": 2, "same_rank": True},
    "triple": {"min": 3, "max": 3, "same_rank": True},
    "straight": {"min": 3, "max": 13, "same_suit": True, "sequential": True},
    "full_house": {"min": 5, "max": 5, "triple_plus_pair": True},
    "bomb": {"min": 4, "max": 4, "same_rank": True, "is_bomb": True},
}

# Rank hierarchy (low to high)
RANK_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
# 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2
```

## 3. Query Patterns & Indexes

### 3.1 Common Queries
| Query | Collection | Index Used |
|-------|-----------|------------|
| Get room by code | rooms | `code_1` (unique) |
| List public open rooms | rooms | `isPrivate_1_status_1` |
| Get game by room ID | games | `roomId_1` (unique) |
| Get player's active games | games | `players.id_1` |
| Recent completed games | games | `status_1_createdAt_-1` |

### 3.2 Query Examples

```python
# Get public open rooms
async def get_open_rooms(db):
    return await db.rooms.find({
        "isPrivate": False,
        "status": {"$in": ["lobby", "full"]}
    }).to_list(50)

# Get game by room ID
async def get_game_by_room(db, room_id: str):
    return await db.games.find_one({"roomId": room_id})

# Get player's game history
async def get_player_history(db, player_id: str, limit: int = 20):
    return await db.games.find({
        "players.id": player_id,
        "status": "finished"
    }).sort("createdAt", -1).limit(limit).to_list(limit)
```

## 4. Data Retention Policy

| Data Type | Retention | Auto-Delete |
|-----------|-----------|-------------|
| Active rooms | Until game ends | No |
| Finished rooms | 7 days after last player leaves | Yes |
| Active games | Until game ends | No |
| Finished games | 90 days | Yes (TTL index) |
| Move history | Embedded in game doc | Same as parent |

**TTL Index for Finished Games:**
```javascript
db.games.createIndex(
    { "updatedAt": 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days
)
```

## 5. Data Migration Strategy

For future schema changes:
- Use Pydantic models with backward compatibility
- Add new fields with defaults for backward compatibility
- Version documents with schemaVersion field
- Archive old games to cold storage after TTL expiration

## 6. Example Documents

### Example Room Document
```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
  "code": "ABC123",
  "name": "Phòng của Minh",
  "isPrivate": false,
  "maxPlayers": 4,
  "currentPlayers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Minh",
      "joinedAt": ISODate("2026-05-29T10:00:00Z")
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Lan",
      "joinedAt": ISODate("2026-05-29T10:01:00Z")
    }
  ],
  "gameId": null,
  "status": "lobby",
  "createdAt": ISODate("2026-05-29T10:00:00Z")
}
```

### Example Game Document
```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "roomId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "players": [
    {
      "id": "550e8400-e29b-41d4-a716-4466554400",
      "name": "Minh",
      "isHost": true,
      "connected": true,
      "cards": [
        {"suit": "hearts", "rank": 7},
        {"suit": "spades", "rank": 10},
        {"suit": "clubs", "rank": 12}
      ]
    },
    {
      "id": "550e8400-e29b-41d4-a716-4466554401",
      "name": "Lan",
      "isHost": false,
      "connected": true,
      "cards": [
        {"suit": "diamonds", "rank": 3},
        {"suit": "hearts", "rank": 11},
        {"suit": "spades", "rank": 13}
      ]
    }
  ],
  "currentTurnIndex": 0,
  "lastPlay": null,
  "direction": 1,
  "firstPlayCard": null,
  "hasStartedFirstRound": false,
  "deck": [...remaining 50 cards...],
  "status": "waiting",
  "result": null,
  "passCount": 0,
  "createdAt": ISODate("2026-05-29T10:02:00Z"),
  "updatedAt": ISODate("2026-05-29T10:02:00Z")
}
```
