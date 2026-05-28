import type { Card, Suit, Rank, CombinationType } from '@/types';

export interface Deck {
  cards: Card[];
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], playerCount: number): Card[][] {
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  let cardIndex = 0;

  for (let i = 0; i < 13; i++) {
    for (let p = 0; p < playerCount; p++) {
      if (cardIndex < deck.length) {
        hands[p].push(deck[cardIndex]);
        cardIndex++;
      }
    }
  }

  return hands;
}

export function sortCardsBySuit(cards: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { hearts: 0, diamonds: 1, clubs: 2, spades: 3 };
  return [...cards].sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit]);
}

export function sortCardsByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => a.rank - b.rank);
}

export function findCardBySuitAndRank(cards: Card[], suit: Suit, rank: Rank): Card | undefined {
  return cards.find(c => c.suit === suit && c.rank === rank);
}

export function hasCard(cards: Card[], suit: Suit, rank: Rank): boolean {
  return cards.some(c => c.suit === suit && c.rank === rank);
}

export function removeCards(cards: Card[], toRemove: Card[]): Card[] {
  const result = [...cards];
  for (const remove of toRemove) {
    const idx = result.findIndex(c => c.suit === remove.suit && c.rank === remove.rank);
    if (idx !== -1) {
      result.splice(idx, 1);
    }
  }
  return result;
}

export function getThreeOfDiamonds(cards: Card[]): Card | undefined {
  return findCardBySuitAndRank(cards, 'diamonds', 3);
}

export function getLowestCard(cards: Card[]): Card | undefined {
  if (cards.length === 0) return cards[0];
  return cards.reduce((lowest, card) => (card.rank < lowest.rank ? card : lowest), cards[0]);
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

export function cardsArrayEqual(a: Card[], b: Card[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x.rank - y.rank || SUITS.indexOf(x.suit) - SUITS.indexOf(y.suit));
  const sortedB = [...b].sort((x, y) => x.rank - y.rank || SUITS.indexOf(x.suit) - SUITS.indexOf(y.suit));
  return sortedA.every((card, i) => cardsEqual(card, sortedB[i]));
}
