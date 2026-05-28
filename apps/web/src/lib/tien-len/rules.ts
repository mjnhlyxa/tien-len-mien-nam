import type { Card, CombinationType, PlayedCombination } from '@/types';

interface CombinationResult {
  valid: boolean;
  type: CombinationType | null;
  rank: number | null;
  length?: number;
  message?: string;
}

const RANK_ORDER: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

function getRankValues(): Record<number, number> {
  return {
    3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
    11: 9, 12: 10, 13: 11, 14: 12, 15: 13,
  };
}

export function validateCombination(cards: Card[]): CombinationResult {
  if (!cards || cards.length === 0) {
    return { valid: false, type: null, rank: null, message: 'Không có bài được chọn' };
  }

  const len = cards.length;

  // Single
  if (len === 1) {
    return {
      valid: true,
      type: 'single',
      rank: cards[0].rank,
    };
  }

  // Sort by rank for analysis
  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  const ranks = sorted.map(c => c.rank);
  const uniqueRanks = [...new Set(ranks)];
  const suits = cards.map(c => c.suit);
  const uniqueSuits = [...new Set(suits)];

  // Pair (2 cards, same rank)
  if (len === 2 && uniqueRanks.length === 1) {
    return {
      valid: true,
      type: 'pair',
      rank: uniqueRanks[0],
    };
  }

  // Triple (3 cards, same rank)
  if (len === 3 && uniqueRanks.length === 1) {
    return {
      valid: true,
      type: 'triple',
      rank: uniqueRanks[0],
    };
  }

  // Bomb (4 cards, same rank)
  if (len === 4 && uniqueRanks.length === 1) {
    return {
      valid: true,
      type: 'bomb',
      rank: uniqueRanks[0],
    };
  }

  // Straight (3+ consecutive cards, same suit)
  if (len >= 3 && uniqueSuits.length === 1) {
    const isConsecutive = checkConsecutive(ranks);
    if (isConsecutive) {
      // Cannot have 2 in straight (Ace-high only)
      if (ranks.includes(15)) {
        // Check if it's valid (not A-2-3)
        const aceIndex = ranks.indexOf(14);
        const deuceIndex = ranks.indexOf(15);
        if (aceIndex !== -1 && deuceIndex !== -1) {
          // A-2-3 is invalid
          const minRank = Math.min(...ranks);
          if (minRank === 3 && ranks.length === 3) {
            return { valid: false, type: null, rank: null, message: 'A-2-3 không hợp lệ trong Tiến Lên' };
          }
        }
      }
      return {
        valid: true,
        type: 'straight',
        rank: Math.max(...ranks), // Higher last card wins
        length: len,
      };
    }
  }

  // Full House (5 cards: 3 of a kind + 1 pair)
  if (len === 5) {
    const rankCounts = new Map<number, number>();
    for (const rank of ranks) {
      rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1);
    }
    const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
    if (counts[0] === 3 && counts[1] === 2) {
      const tripleRank = Array.from(rankCounts.entries()).find(([, [, c]]) => c === 3)?.[0] || 0;
      return {
        valid: true,
        type: 'full_house',
        rank: tripleRank,
      };
    }
  }

  return { valid: false, type: null, rank: null, message: 'Bộ bài không hợp lệ' };
}

function checkConsecutive(ranks: number[]): boolean {
  const sorted = [...ranks].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      return false;
    }
  }
  return true;
}

export function canBeatCombination(
  newCards: Card[],
  lastPlay: PlayedCombination | null
): CombinationResult {
  const newResult = validateCombination(newCards);

  if (!newResult.valid) {
    return newResult;
  }

  if (!lastPlay) {
    return newResult;
  }

  // Bomb always beats non-bomb
  if (newResult.type === 'bomb' && lastPlay.combinationType !== 'bomb') {
    return newResult;
  }

  // Non-bomb cannot beat bomb
  if (newResult.type !== 'bomb' && lastPlay.combinationType === 'bomb') {
    return {
      valid: false,
      type: newResult.type,
      rank: newResult.rank,
      message: 'Phải đánh tứ quý để chặn tứ quý',
    };
  }

  // Types must match
  if (newResult.type !== lastPlay.combinationType) {
    return {
      valid: false,
      type: newResult.type,
      rank: newResult.rank,
      message: 'Phải đánh cùng loại bộ bài',
    };
  }

  // For straight, longer wins, then higher rank
  if (newResult.type === 'straight') {
    if ((newResult.length || 0) > (lastPlay.cards.length)) {
      return newResult;
    }
    if ((newResult.length || 0) < (lastPlay.cards.length)) {
      return {
        valid: false,
        type: newResult.type,
        rank: newResult.rank,
        message: 'Sảnh dài hơn thắng sảnh ngắn hơn',
      };
    }
  }

  // Rank must be higher
  if ((newResult.rank || 0) <= (lastPlayCardsMaxRank(lastPlay))) {
    return {
      valid: false,
      type: newResult.type,
      rank: newResult.rank,
      message: 'Bộ bài không đủ mạnh để chặn',
    };
  }

  return newResult;
}

function lastPlayCardsMaxRank(play: PlayedCombination): number {
  if (play.combinationType === 'straight') {
    return Math.max(...play.cards.map(c => c.rank));
  }
  return play.cards[0]?.rank || 0;
}

export function getComboRankValue(rank: number): number {
  const rankValues = getRankValues();
  return rankValues[rank] || 0;
}

export function compareRanks(rank1: number, rank2: number): number {
  return getComboRankValue(rank1) - getComboRankValue(rank2);
}

export function isValidFirstPlay(cards: Card[], hasThreeOfDiamonds: boolean): boolean {
  if (hasThreeOfDiamonds) {
    return cards.some(c => c.suit === 'diamonds' && c.rank === 3);
  }
  return false;
}
