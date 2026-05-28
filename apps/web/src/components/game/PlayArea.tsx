'use client';

import type { Card, PlayedCombination, CombinationType } from '@/types';
import { CardGroup } from './CardGroup';
import { Badge } from '../ui/Badge';

interface PlayAreaProps {
  lastPlay: PlayedCombination | null;
  canBeat?: boolean;
  passCount?: number;
  totalPlayers?: number;
}

export function PlayArea({
  lastPlay,
  canBeat = true,
  passCount = 0,
  totalPlayers = 2,
}: PlayAreaProps) {
  const getCombinationLabel = (type: CombinationType): string => {
    const labels: Record<CombinationType, string> = {
      single: 'lá',
      pair: 'đôi',
      triple: 'bộ ba',
      straight: 'sảnh',
      full_house: 'tứ quý',
      bomb: 'tứ quý',
    };
    return labels[type] || type;
  };

  return (
    <div className="
      flex flex-col items-center justify-center
      bg-table-felt rounded-2xl p-8
      border-4 border-table-border
      min-h-[180px]
    ">
      <div className="text-sm text-white text-opacity-70 mb-4">
        BÀI ĐÃ ĐÁNH
      </div>

      {lastPlay ? (
        <>
          <CardGroup
            cards={lastPlay.cards}
            faceDown={false}
            size="md"
          />
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={lastPlay.combinationType === 'bomb' ? 'warning' : 'info'}>
              {getCombinationLabel(lastPlay.combinationType)}
            </Badge>
            <span className="text-sm text-white text-opacity-80">
              của {lastPlay.playerName}
            </span>
          </div>
          {passCount > 0 && (
            <div className="mt-2 text-sm text-accent-gold">
              Đã bỏ: {passCount}/{totalPlayers - 1} lượt
            </div>
          )}
        </>
      ) : (
        <div className="text-white text-opacity-50 text-lg">
          Chọn bài để đánh
        </div>
      )}

      {!canBeat && lastPlay && (
        <div className="mt-2 text-sm text-accent-red">
          Không thể đánh bài này
        </div>
      )}
    </div>
  );
}
