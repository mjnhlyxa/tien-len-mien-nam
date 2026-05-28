import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  players: [{
    id: String,
    name: String,
    isHost: Boolean,
    connected: { type: Boolean, default: true },
    cards: [{
      suit: String,
      rank: Number
    }],
    cardCount: Number
  }],
  currentTurnIndex: { type: Number, default: 0 },
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
  direction: { type: Number, default: 1 },
  firstPlayCard: {
    suit: String,
    rank: Number
  },
  hasStartedFirstRound: { type: Boolean, default: false },
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  result: {
    winner: { id: String, name: String },
    reason: String
  },
  passCount: { type: Number, default: 0 },
}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

const CardSchema = new mongoose.Schema({
  suit: { type: String, enum: ['hearts', 'diamonds', 'clubs', 'spades'] },
  rank: { type: Number, min: 3, max: 15 }
});

function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleDeck(deck: any[]) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealCards(deck: any[], playerCount: number) {
  const hands = Array.from({ length: playerCount }, () => [] as any[]);
  let cardIndex = 0;
  for (let i = 0; i < 13; i++) {
    for (let p = 0; p < playerCount; p++) {
      if (cardIndex < deck.length) {
        hands[p].push(deck[cardIndex]);
        cardIndex++;
      }
    }
  }
  return hands;
}

const RoomSchema = new mongoose.Schema({
  code: String,
  name: String,
  isPrivate: Boolean,
  maxPlayers: Number,
  currentPlayers: [{
    id: String,
    name: String,
    joinedAt: Date
  }],
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  status: String,
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

interface RouteParams {
  params: Promise<{ roomId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { roomId } = await params;
  try {
    const body = await request.json();
    const { playerId } = body;

    await connectDB();

    const room = await Room.findOne({ code: roomId.toUpperCase() });
    if (!room) {
      return NextResponse.json({ success: false, error: 'Phòng không tồn tại' }, { status: 404 });
    }

    const isHost = room.currentPlayers[0]?.id === playerId;
    if (!isHost) {
      return NextResponse.json({ success: false, error: 'Chỉ chủ phòng mới có thể bắt đầu' }, { status: 403 });
    }

    if (room.currentPlayers.length < 2) {
      return NextResponse.json({ success: false, error: 'Cần ít nhất 2 người chơi' }, { status: 400 });
    }

    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, room.currentPlayers.length);

    const players = room.currentPlayers.map((p: any, i: number) => ({
      id: p.id,
      name: p.name,
      isHost: i === 0,
      connected: true,
      cards: hands[i],
      cardCount: hands[i].length
    }));

    const game = await Game.create({
      roomId: room.code,
      players,
      currentTurnIndex: 0,
      direction: 1,
      status: 'playing'
    });

    room.gameId = game._id;
    room.status = 'playing';
    await room.save();

    return NextResponse.json({
      success: true,
      data: {
        id: game._id.toString(),
        roomId: game.roomId,
        players: game.players,
        currentTurnIndex: game.currentTurnIndex,
        lastPlay: game.lastPlay,
        direction: game.direction,
        status: game.status
      }
    }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/rooms/${roomId}/start error:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
