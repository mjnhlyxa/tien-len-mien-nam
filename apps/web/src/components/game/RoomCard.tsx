'use client';

import { Room } from '@/types';
import { Badge } from '../ui/Badge';

interface RoomCardProps {
  room: Room;
  onJoin: () => void;
  className?: string;
}

export function RoomCard({ room, onJoin, className = '' }: RoomCardProps) {
  return (
    <div
      className={`
        flex justify-between items-center
        p-4 rounded-lg bg-bg-surface
        border border-bg-elevated
        hover:border-primary transition-colors
        cursor-pointer
        ${className}
      `}
      onClick={onJoin}
    >
      <div>
        <h3 className="font-medium text-text-primary flex items-center gap-2">
          &#x1F3E0; {room.name}
        </h3>
        <p className="textsm text-text-secondary mt-1">
          {room.currentPlayers.length}/{room.maxPlayers} người chơi
        </p>
      </div>

      <Badge
        variant={room.status === 'lobby' ? 'success' : room.status === 'full' ? 'warning' : 'info'}
      >
        {room.status === 'lobby' ? 'Mở' : room.status === 'full' ? 'Đầy' : 'Đang chơi'}
      </Badge>
    </div>
  );
}
