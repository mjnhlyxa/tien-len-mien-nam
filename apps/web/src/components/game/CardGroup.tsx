'use client';

import type { Card as CardType } from '@/types';
import { Card } from './Card';

interface CardGroupProps {
  cards: CardType[];
  selectedIndices?: number[];
  onCardSelect?: (card: CardType, index: number) => void;
  selectable?: boolean;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  className?: string;
}

export function CardGroup({
  cards,
  selectedIndices = [],
  onCardSelect,
  selectable = false,
  faceDown = false,
  size = 'md',
  maxVisible,
  className = '',
}: CardGroupProps) {
  const displayCards = maxVisible ? cards.slice(0, maxVisible) : cards;

  return (
    <div className={`flex gap-1 ${className}`}>
      {displayCards.map((card, index) => (
        <Card
          key={`${card.suit}-${card.rank}-${index}`}
          suit={card.suit}
          rank={card.rank}
          size={size}
          faceDown={faceDown}
          selected={selectedIndices.includes(index)}
          disabled={!selectable}
          onClick={() => onCardSelect?.(card, index)}
          className={index > 0 ? '-ml-2' : ''}
        />
      ))}
    </div>
  );
}
