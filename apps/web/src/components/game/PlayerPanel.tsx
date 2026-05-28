'use client';

import type { PlayerInGame, PlayedCombination } from '@/types';
import { Badge } from '../ui/Badge';

interface PlayerPanelProps {
  player: PlayerInGame;
  isCurrentTurn: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  lastPlay?: PlayedCombination | null;
  isHost?: boolean;
  showCards?: boolean;
}

export function PlayerPanel({
  player,
  isCurrentTurn,
  position,
  lastPlay,
  isHost = false,
  showCards = false,
}: PlayerPanelProps) {
  const positionClasses = {
    top: 'justify-center',
    bottom: 'justify-center',
    left: 'items-start',
    right: 'items-end',
  };

  return (
    <div
      className={`
        flex flex-col gap-2 p-3 rounded-xl min-w-[100px]
        bg-bg-surface border-2
        ${isCurrentTurn ? 'border-accent-green glow-green' : 'border-transparent'}
        ${position === 'bottom' ? 'order-last' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            player.connected ? 'bg-accent-green' : 'bg-text-secondary'
          }`}
        />
        <span className="font-medium text-sm">
          {player.name}
          {isHost && <span className="ml-1 text-xs text-accent-gold">(Host)</span>}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span>{player.cardCount} bài</span>
        {isCurrentTurn && (
          <Badge variant="success">Lượt</Badge>
        )}
      </div>

      {lastPlay && (
        <div className="text-xs text-text-secondary">
          Đánh: {lastPlay.cards.length} bài
        </div>
      )}
    </div>
  );
}
