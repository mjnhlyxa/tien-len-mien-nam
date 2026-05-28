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

interface RouteParams {
  params: Promise<{ gameId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { gameId } = await params;
  try {
    const body = await request.json();
    const { playerId } = body;

    await connectDB();
    const game = await Game.findById(gameId);

    if (!game) {
      return NextResponse.json({ success: false, error: 'Trò chơi không tồn tại' }, { status: 404 });
    }

    if (game.status === 'finished') {
      return NextResponse.json({ success: false, error: 'Trò chơi đã kết thúc' }, { status: 409 });
    }

    const currentPlayer = game.players[game.currentTurnIndex];
    if (currentPlayer.id !== playerId) {
      return NextResponse.json({ success: false, error: 'Chưa đến lượt bạn' }, { status: 403 });
    }

    game.passCount += 1;
    game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;

    // If all players passed, clear the play area
    if (game.passCount >= game.players.length) {
      game.lastPlay = null;
      game.passCount = 0;
      game.hasStartedFirstRound = false;
    }

    await game.save();

    return NextResponse.json({
      success: true,
      passCount: game.passCount,
      data: {
        id: game._id.toString(),
        roomId: game.roomId,
        players: game.players,
        currentTurnIndex: game.currentTurnIndex,
        lastPlay: game.lastPlay,
        status: game.status,
        passCount: game.passCount
      }
    });
  } catch (error) {
    console.error(`POST /api/games/${gameId}/pass error:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
