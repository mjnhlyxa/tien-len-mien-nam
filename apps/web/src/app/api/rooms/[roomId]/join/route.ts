import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

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
    const { playerId, playerName } = body;

    if (!playerId || !playerName) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin người chơi' }, { status: 400 });
    }

    await connectDB();
    const room = await Room.findOne({ code: roomId.toUpperCase() });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Phòng không tồn tại' }, { status: 404 });
    }

    if (room.currentPlayers.length >= room.maxPlayers) {
      return NextResponse.json({ success: false, error: 'Phòng đã đầy' }, { status: 409 });
    }

    if (room.currentPlayers.some((p: any) => p.id === playerId)) {
      return NextResponse.json({ success: false, error: 'Bạn đã ở trong phòng này' }, { status: 409 });
    }

    room.currentPlayers.push({ id: playerId, name: playerName, joinedAt: new Date() });
    if (room.currentPlayers.length >= room.maxPlayers) {
      room.status = 'full';
    }

    await room.save();

    return NextResponse.json({
      success: true,
      data: {
        id: room._id.toString(),
        code: room.code,
        name: room.name,
        isPrivate: room.isPrivate,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.currentPlayers,
        gameId: room.gameId?.toString() || null,
        status: room.status,
      }
    });
  } catch (error) {
    console.error(`POST /api/rooms/${roomId}/join error:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
