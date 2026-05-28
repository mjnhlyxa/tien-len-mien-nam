from fastapi import APIRouter, HTTPException
from src.database.mongodb import get_db
from src.models.room import RoomCreate, RoomResponse, JoinRoom
from bson import ObjectId
import random
import string
from datetime import datetime

router = APIRouter()

def generate_code(length=6):
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return ''.join(random.choice(chars) for _ in range(length))

@router.get("")
async def list_rooms():
    db = get_db()
    rooms = list(db.rooms.find({
        "isPrivate": False,
        "status": {"$in": ["lobby", "full"]}
    }).sort("createdAt", -1).limit(50))

    return {
        "data": [format_room(r) for r in rooms]
    }

@router.post("")
async def create_room(body: RoomCreate):
    db = get_db()

    code = generate_code()
    while db.rooms.find_one({"code": code}):
        code = generate_code()

    room = {
        "code": code,
        "name": body.name,
        "isPrivate": body.isPrivate,
        "maxPlayers": body.maxPlayers,
        "currentPlayers": [{
            "id": body.playerId,
            "name": body.playerName,
            "joinedAt": datetime.utcnow().isoformat()
        }],
        "gameId": None,
        "status": "lobby",
        "createdAt": datetime.utcnow()
    }

    result = db.rooms.insert_one(room)

    return {
        "data": format_room({**room, "_id": result.inserted_id})
    }

@router.get("/{code}")
async def get_room(code: str):
    db = get_db()
    room = db.rooms.find_one({"code": code.upper()})

    if not room:
        raise HTTPException(status_code=404, detail="Phòng không tồn tại")

    return {
        "data": format_room(room)
    }

@router.post("/{code}/join")
async def join_room(code: str, body: JoinRoom):
    db = get_db()
    room = db.rooms.find_one({"code": code.upper()})

    if not room:
        raise HTTPException(status_code=404, detail="Phòng không tồn tại")

    if len(room["currentPlayers"]) >= room["maxPlayers"]:
        raise HTTPException(status_code=409, detail="Phòng đã đầy")

    if any(p["id"] == body.playerId for p in room["currentPlayers"]):
        raise HTTPException(status_code=409, detail="Bạn đã ở trong phòng này")

    db.rooms.update_one(
        {"_id": room["_id"]},
        {"$push": {"currentPlayers": {
            "id": body.playerId,
            "name": body.playerName,
            "joinedAt": datetime.utcnow().isoformat()
        }}}
    )

    if len(room["currentPlayers"]) + 1 >= room["maxPlayers"]:
        db.rooms.update_one({"_id": room["_id"]}, {"$set": {"status": "full"}})

    room = db.rooms.find_one({"_id": room["_id"]})
    return {
        "data": format_room(room)
    }

@router.delete("/{code}/leave")
async def leave_room(code: str, body: JoinRoom):
    db = get_db()
    room = db.rooms.find_one({"code": code.upper()})

    if not room:
        raise HTTPException(status_code=404, detail="Phòng không tồn tại")

    db.rooms.update_one(
        {"_id": room["_id"]},
        {"$pull": {"currentPlayers": {"id": body.playerId}}}
    )

    if len(room["currentPlayers"]) <= 1:
        db.rooms.delete_one({"_id": room["_id"]})
    else:
        db.rooms.update_one({"_id": room["_id"]}, {"$set": {"status": "lobby"}})

    return {"success": True, "message": "Đã rời phòng"}

@router.post("/{code}/start")
async def start_game(code: str, body: JoinRoom):
    db = get_db()
    room = db.rooms.find_one({"code": code.upper()})

    if not room:
        raise HTTPException(status_code=404, detail="Phòng not found")

    if room["currentPlayers"][0]["id"] != body.playerId:
        raise HTTPException(status_code=403, detail="Only host can start")

    if len(room["currentPlayers"]) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 players")

    from src.game_logic.deck import create_deck, shuffle_deck, deal_cards

    deck = shuffle_deck(create_deck())
    hands = deal_cards(deck, len(room["currentPlayers"]))

    players = []
    for i, p in enumerate(room["currentPlayers"]):
        players.append({
            "id": p["id"],
            "name": p["name"],
            "isHost": i == 0,
            "connected": True,
            "cards": [c.model_dump() for c in hands[i]],
            "cardCount": len(hands[i])
        })

    game = {
        "roomId": code.upper(),
        "players": players,
        "currentTurnIndex": 0,
        "lastPlay": None,
        "direction": 1,
        "firstPlayCard": None,
        "hasStartedFirstRound": False,
        "status": "playing",
        "result": None,
        "passCount": 0,
        "createdAt": datetime.utcnow()
    }

    result = db.games.insert_one(game)

    db.rooms.update_one(
        {"_id": room["_id"]},
        {"$set": {"gameId": result.inserted_id, "status": "playing"}}
    )

    return {
        "success": True,
        "data": {
            "id": str(result.inserted_id),
            "roomId": code.upper(),
            "players": players,
            "currentTurnIndex": 0,
            "status": "playing"
        }
    }

def format_room(room) -> dict:
    return {
        "id": str(room["_id"]),
        "code": room["code"],
        "name": room["name"],
        "isPrivate": room.get("isPrivate", False),
        "maxPlayers": room["maxPlayers"],
        "currentPlayers": room["currentPlayers"],
        "gameId": str(room["gameId"]) if room.get("gameId") else None,
        "status": room["status"]
    }
