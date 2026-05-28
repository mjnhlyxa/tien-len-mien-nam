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

export async function DELETE(request: Request, { params }: RouteParams) {
  const { roomId } = await params;
  try {
    const body = await request.json();
    const { playerId } = body;

    await connectDB();
    const room = await Room.findOne({ code: roomId.toUpperCase() });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Phòng không tồn tại' }, { status: 404 });
    }

    room.currentPlayers = room.currentPlayers.filter((p: any) => p.id !== playerId);

    if (room.currentPlayers.length === 0) {
      await Room.deleteOne({ _id: room._id });
    } else {
      room.status = 'lobby';
      await room.save();
    }

    return NextResponse.json({ success: true, message: 'Đã rời phòng' });
  } catch (error) {
    console.error(`DELETE /api/rooms/${roomId}/leave error:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
