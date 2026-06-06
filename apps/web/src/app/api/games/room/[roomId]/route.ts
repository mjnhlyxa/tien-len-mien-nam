import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  roomId: String,
  players: [{
    id: String,
    name: String,
    isHost: Boolean,
    connected: Boolean,
    cards: [{ suit: String, rank: Number }],
    cardCount: Number
  }],
  currentTurnIndex: Number,
  lastPlay: {
    playerId: String,
    playerName: String,
    combinationType: String,
    cards: [{ suit: String, rank: Number }],
    timestamp: Date
  },
  direction: Number,
  firstPlayCard: { suit: String, rank: Number },
  hasStartedFirstRound: Boolean,
  status: String,
  result: { winner: { id: String, name: String }, reason: String },
  passCount: Number,
}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

const RoomSchema = new mongoose.Schema({
  code: String,
  name: String,
  isPrivate: Boolean,
  maxPlayers: Number,
  currentPlayers: [{ id: String, name: String, joinedAt: Date }],
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  status: String,
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

interface RouteParams {
  params: Promise<{ roomId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { roomId } = await params;
  const url = new URL(request.url);
  const playerId = url.searchParams.get('playerId');

  try {
    await connectDB();

    // Find room by code
    const room = await Room.findOne({ code: roomId.toUpperCase() });
    if (!room) {
      return NextResponse.json({ success: false, error: 'Phòng không tồn tại' }, { status: 404 });
    }

    if (!room.gameId) {
      return NextResponse.json({ success: false, error: 'Trò chơi chưa bắt đầu' }, { status: 400 });
    }

    const game = await Game.findById(room.gameId).lean() as any;
    if (!game) {
      return NextResponse.json({ success: false, error: 'Trò chơi không tồn tại' }, { status: 404 });
    }

    // Hide cards from other players
    const players = game.players.map((p: any) => {
      if (playerId && p.id === playerId) {
        return p;
      }
      return {
        ...p,
        cards: null,
        cardCount: p.cardCount
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: game._id.toString(),
        roomId: game.roomId,
        players,
        currentTurnIndex: game.currentTurnIndex,
        lastPlay: game.lastPlay,
        direction: game.direction,
        firstPlayCard: game.firstPlayCard,
        hasStartedFirstRound: game.hasStartedFirstRound,
        status: game.status,
        passCount: game.passCount,
        result: game.result
      }
    });
  } catch (error) {
    console.error(`GET /api/games/room/${roomId} error:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
