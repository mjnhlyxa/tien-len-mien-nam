from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class Suit(str, Enum):
    HEARTS = "hearts"
    DIAMONDS = "diamonds"
    CLUBS = "clubs"
    SPADES = "spades"

class Card(BaseModel):
    suit: Suit
    rank: int

class PlayerInRoom(BaseModel):
    id: str
    name: str
    joinedAt: Optional[str] = None

class RoomCreate(BaseModel):
    name: str
    isPrivate: bool = False
    maxPlayers: int = 4
    playerId: str
    playerName: str

class RoomResponse(BaseModel):
    id: str
    code: str
    name: str
    isPrivate: bool
    maxPlayers: int
    currentPlayers: List[PlayerInRoom]
    gameId: Optional[str] = None
    status: str  # "lobby", "full", "playing"

class JoinRoom(BaseModel):
    playerId: str
    playerName: str

class GameResponse(BaseModel):
    id: str
    roomId: str
    players: List[dict]  # Simplified for now
    currentTurnIndex: int
    lastPlay: Optional[dict] = None
    status: str
