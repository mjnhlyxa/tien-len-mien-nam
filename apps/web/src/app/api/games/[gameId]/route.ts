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
    cards: [{
      suit: String,
      rank: Number
    }],
    cardCount: Number
  }],
  currentTurnIndex: Number,
  lastPlay: {
    playerId: String,
    playerName: String,
    combinationType: String,
    cards: [{
      suit: String,
      rank: Number
    }],
    timestamp: Date
  },
  direction: Number,
  firstPlayCard: {
    suit: String,
    rank: Number
  },
  hasStartedFirstRound: Boolean,
  status: String,
  result: {
    winner: { id: String, name: String },
    reason: String
  },
  passCount: Number,
}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

interface RouteParams {
  params: Promise<{ gameId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { gameId } = await params;
  const url = new URL(request.url);
  const currentPlayerId = url.searchParams.get('playerId');

  try {
    await connectDB();
    const game = await Game.findById(gameId).lean();

    if (!game) {
      return NextResponse.json({ success: false, error: 'Trò chơi không tồn tại' }, { status: 404 });
    }

    // Hide other players' cards unless it's the requesting player's card
    const players = game.players.map((p: any) => {
      if (currentPlayerId && p.id === currentPlayerId) {
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
    console.error(`GET /api/games/${gameId} error:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
