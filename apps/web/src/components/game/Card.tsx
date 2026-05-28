'use client';

import type { Card as CardType, Suit, Rank } from '@/types';
import { getSuitSymbol, getRankDisplay, isRedSuit } from '@/types';

interface CardProps {
  suit: Suit;
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({
  suit,
  rank,
  size = 'md',
  faceDown = false,
  selected = false,
  disabled = false,
  onClick,
  className = '',
}: CardProps) {
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-28 text-base',
  };

  const isRed = isRedSuit(suit);

  if (faceDown) {
    return (
      <div
        className={`
          ${sizeClasses[size]} rounded-lg
          bg-gradient-to-br from-blue-900 to-blue-700
          border-2 border-blue-600
          flex items-center justify-center
          shadow-md
          ${disabled ? 'opacity-50' : ''}
          ${className}
        `}
      >
        <div className="w-full h-full m-1 rounded bg-blue-800 flex items-center justify-center">
          <span className="text-blue-400 text-lg">&#x1F0B4;</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        ${sizeClasses[size]} rounded-lg
        bg-white border-2
        flex flex-col items-center justify-center
        cursor-pointer transition-all duration-150
        shadow-md hover:shadow-lg
        ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-dark transform -translate-y-2' : 'hover:-translate-y-1'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isRed ? 'text-card-hearts' : 'text-gray-900'}
        ${className}
      `}
    >
      <div className="absolute top-0.5 left-1 flex flex-col items-center leading-none">
        <span className="font-bold">{getRankDisplay(rank)}</span>
        <span className="text-base">{getSuitSymbol(suit)}</span>
      </div>
      <span className="text-3xl">{getSuitSymbol(suit)}</span>
      <div className="absolute bottom-0.5 right-1 flex flex-col items-center leading-none rotate-180">
        <span className="font-bold">{getRankDisplay(rank)}</span>
        <span className="text-base">{getSuitSymbol(suit)}</span>
      </div>
    </div>
  );
}
