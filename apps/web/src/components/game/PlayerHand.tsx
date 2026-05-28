'use client';

import type { Card } from '@/types';
import { Card } from './Card';

interface PlayerHandProps {
  cards: Card[];
  selectedIndices: number[];
  onCardSelect: (card: Card, index: number) => void;
  sortable?: boolean;
  onSort?: (by: 'suit' | 'rank') => void;
  currentPlayerId?: string;
  isMyTurn?: boolean;
}

export function PlayerHand({
  cards,
  selectedIndices = [],
  onCardSelect,
  sortable = false,
  onSort,
  currentPlayerId,
  isMyTurn = false,
}: PlayerHandProps) {
  return (
    <div className="bg-bg-surface rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-text-secondary">
          Bài của bạn ({cards.length})
        </span>
        {sortable && onSort && (
          <div className="flex gap-2">
            <button
              onClick={() => onSort('suit')}
              className="text-xs px-2 py-1 rounded bg-bg-elevated text-text-secondary hover:text-text-primary"
            >
              Theo chất
            </button>
            <button
              onClick={() => onSort('rank')}
              className="text-xs px-2 py-1 rounded bg-bg-elevated text-text-secondary hover:text-text-primary"
            >
              Theo số
            </button>
          </div>
        )}
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
        {cards.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            suit={card.suit}
            rank={card.rank}
            size="md"
            faceDown={false}
            selected={selectedIndices.includes(index)}
            disabled={!isMyTurn}
            onClick={() => onCardSelect(card, index)}
          />
        ))}
      </div>

      {!isMyTurn && (
        <p className="mt-2 text-sm text-text-secondary text-center">
          Chờ lượt...
        </p>
      )}
    </div>
  );
}
