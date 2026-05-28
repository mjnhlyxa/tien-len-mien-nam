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

export async function POST(request: Request, { params }: RouteParams) {
  const { gameId } = await params;
  try {
    const body = await request.json();
    const { playerId, cards } = body;

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

    // Remove played cards from player's hand
    const cardMap = cards.map((c: any) => `${c.suit}-${c.rank}`);
    currentPlayer.cards = currentPlayer.cards.filter((c: any) => !cardMap.includes(`${c.suit}-${c.rank}`));
    currentPlayer.cardCount = currentPlayer.cards.length;

    // Update last play
    game.lastPlay = {
      playerId,
      playerName: currentPlayer.name,
      combinationType: getCombinationType(cards),
      cards,
      timestamp: new Date()
    };

    if (currentPlayer.cards.length === 0) {
      game.status = 'finished';
      game.result = {
        winner: { id: currentPlayer.id, name: currentPlayer.name },
        reason: 'empty_hand'
      };
    } else {
      // Move to next player
      game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
      game.passCount = 0;
    }

    await game.save();

    return NextResponse.json({
      success: true,
      data: {
        id: game._id.toString(),
        roomId: game.roomId,
        players: game.players,
        currentTurnIndex: game.currentTurnIndex,
        lastPlay: game.lastPlay,
        status: game.status,
        result: game.result
      }
    });
  } catch (error) {
    console.error(`POST /api/games/${gameId}/play error:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

function getCombinationType(cards: any[]): string {
  const len = cards.length;
  const ranks = cards.map((c: any) => c.rank);
  const uniqueRanks = [...new Set(ranks)];
  const uniqueSuits = [...new Set(cards.map((c: any) => c.suit))];

  if (len === 1) return 'single';
  if (len === 2 && uniqueRanks.length === 1) return 'pair';
  if (len === 3 && uniqueRanks.length === 1) return 'triple';
  if (len === 4 && uniqueRanks.length === 1) return 'bomb';
  if (uniqueSuits.length === 1 && len >= 3) return 'straight';
  if (len === 5) {
    const rankCounts = new Map();
    for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) || 0) + 1);
    const counts = Array.from(rankCounts.values()).sort((a: number, b: number) => b - a);
    if (counts[0] === 3 && counts[1] === 2) return 'full_house';
  }
  return 'single';
}
