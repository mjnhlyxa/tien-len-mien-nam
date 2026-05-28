import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  maxPlayers: { type: Number, default: 4, min: 2, max: 4 },
  currentPlayers: [{
    id: String,
    name: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null },
  status: { type: String, enum: ['lobby', 'full', 'playing'], default: 'lobby' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  try {
    await connectDB();
    const rooms = await Room.find({
      isPrivate: false,
      status: { $in: ['lobby', 'full'] }
    }).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({
      success: true,
      data: rooms.map(r => ({
        id: r._id.toString(),
        code: r.code,
        name: r.name,
        isPrivate: r.isPrivate,
        maxPlayers: r.maxPlayers,
        currentPlayers: r.currentPlayers,
        gameId: r.gameId?.toString() || null,
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('GET /api/rooms error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, isPrivate, maxPlayers, playerId, playerName } = body;

    if (!playerId || !playerName) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin người chơi' }, { status: 400 });
    }

    await connectDB();

    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await Room.findOne({ code });
      if (!existing) break;
      code = generateRoomCode();
      attempts++;
    }

    const room = await Room.create({
      code,
      name: name || `Phòng của ${playerName}`,
      isPrivate: isPrivate || false,
      maxPlayers: Math.min(Math.max(maxPlayers || 4, 2), 4),
      currentPlayers: [{ id: playerId, name: playerName }],
      status: 'lobby'
    });

    return NextResponse.json({
      success: true,
      data: {
        id: room._id.toString(),
        code: room.code,
        name: room.name,
        isPrivate: room.isPrivate,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.currentPlayers,
        gameId: null,
        status: room.status,
        shareUrl: `/room/${room.code}`
      }
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/rooms error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
