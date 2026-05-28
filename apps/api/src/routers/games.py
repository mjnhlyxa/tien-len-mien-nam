from fastapi import APIRouter, HTTPException
from src.database.mongodb import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def get_combination_type(cards) -> str:
    if len(cards) == 1:
        return "single"
    ranks = [c["rank"] for c in cards]
    suits = [c["suit"] for c in cards]
    unique_ranks = len(set(ranks))
    unique_suits = len(set(suits))

    if len(cards) == 2 and unique_ranks == 1:
        return "pair"
    if len(cards) == 3 and unique_ranks == 1:
        return "triple"
    if len(cards) == 4 and unique_ranks == 1:
        return "bomb"
    if unique_suits == 1 and len(cards) >= 3:
        return "straight"
    if len(cards) == 5 and unique_ranks == 2:
        return "full_house"
    return "single"

@router.get("/{game_id}")
async def get_game(game_id: str, playerId: str = None):
    db = get_db()
    try:
        game = db.games.find_one({"_id": ObjectId(game_id)})
    except:
        raise HTTPException(status_code=404, detail="Game not found")

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    players = []
    for p in game["players"]:
        if playerId and p["id"] == playerId:
            players.append(p)
        else:
            players.append({
                **{k: v for k, v in p.items() if k != "cards"},
                "cards": None,
                "cardCount": p.get("cardCount", 0)
            })

    return {
        "data": {
            "id": str(game["_id"]),
            "roomId": game["roomId"],
            "players": players,
            "currentTurnIndex": game["currentTurnIndex"],
            "lastPlay": game.get("lastPlay"),
            "direction": game.get("direction", 1),
            "status": game["status"],
            "result": game.get("result")
        }
    }

@router.get("/room/{room_code}")
async def get_game_by_room(room_code: str, playerId: str = None):
    db = get_db()
    room = db.rooms.find_one({"code": room_code.upper()})

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if not room.get("gameId"):
        raise HTTPException(status_code=400, detail="Game not started")

    try:
        game = db.games.find_one({"_id": room["gameId"]})
    except:
        raise HTTPException(status_code=404, detail="Game not found")

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    players = []
    for p in game["players"]:
        if playerId and p["id"] == playerId:
            players.append(p)
        else:
            players.append({
                **{k: v for k, v in p.items() if k != "cards"},
                "cards": None,
                "cardCount": p.get("cardCount", 0)
            })

    return {
        "data": {
            "id": str(game["_id"]),
            "roomId": game["roomId"],
            "players": players,
            "currentTurnIndex": game["currentTurnIndex"],
            "lastPlay": game.get("lastPlay"),
            "direction": game.get("direction", 1),
            "status": game["status"],
            "result": game.get("result"),
            "passCount": game.get("passCount", 0)
        }
    }

@router.post("/{game_id}/play")
async def play_cards(game_id: str, body: dict):
    db = get_db()
    try:
        game = db.games.find_one({"_id": ObjectId(game_id)})
    except:
        raise HTTPException(status_code=404, detail="Game not found")

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game["status"] == "finished":
        raise HTTPException(status_code=400, detail="Game already finished")

    player_id = body.get("playerId")
    cards = body.get("cards", [])

    current_player = game["players"][game["currentTurnIndex"]]
    if current_player["id"] != player_id:
        raise HTTPException(status_code=403, detail="Not your turn")

    # Remove cards from player
    card_keys = set((c["suit"], c["rank"]) for c in cards)
    current_player["cards"] = [c for c in current_player["cards"]
                               if (c["suit"], c["rank"]) not in card_keys]
    current_player["cardCount"] = len(current_player["cards"])

    combo_type = get_combination_type(cards)

    game["lastPlay"] = {
        "playerId": player_id,
        "playerName": current_player["name"],
        "combinationType": combo_type,
        "cards": cards,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Check win
    if current_player["cardCount"] == 0:
        game["status"] = "finished"
        game["result"] = {
            "winner": {"id": current_player["id"], "name": current_player["name"]},
            "reason": "empty_hand"
        }
    else:
        game["currentTurnIndex"] = (game["currentTurnIndex"] + 1) % len(game["players"])
        game["passCount"] = 0

    db.games.update_one({"_id": game["_id"]}, {"$set": game})

    return {
        "success": True,
        "data": {
            "id": str(game["_id"]),
            "status": game["status"],
            "result": game.get("result")
        }
    }

@router.post("/{game_id}/pass")
async def pass_turn(game_id: str, body: dict):
    db = get_db()
    try:
        game = db.games.find_one({"_id": ObjectId(game_id)})
    except:
        raise HTTPException(status_code=404, detail="Game not found")

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game["status"] == "finished":
        raise HTTPException(status_code=400, detail="Game already finished")

    player_id = body.get("playerId")
    current_player = game["players"][game["currentTurnIndex"]]
    if current_player["id"] != player_id:
        raise HTTPException(status_code=403, detail="Not your turn")

    game["passCount"] = game.get("passCount", 0) + 1
    game["currentTurnIndex"] = (game["currentTurnIndex"] + 1) % len(game["players"])

    if game["passCount"] >= len(game["players"]):
        game["lastPlay"] = None
        game["passCount"] = 0
        game["hasStartedFirstRound"] = False

    db.games.update_one({"_id": game["_id"]}, {"$set": game})

    return {
        "success": True,
        "passCount": game["passCount"]
    }
