export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type CombinationType = 'single' | 'pair' | 'triple' | 'straight' | 'full_house' | 'bomb';

export interface PlayedCombination {
  playerId: string;
  playerName: string;
  combinationType: CombinationType;
  cards: Card[];
  timestamp: Date;
}

export interface PlayerInRoom {
  id: string;
  name: string;
  joinedAt: Date;
}

export interface PlayerInGame {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  cards: Card[];
  cardCount: number;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  isPrivate: boolean;
  maxPlayers: number;
  currentPlayers: PlayerInRoom[];
  gameId: string | null;
  status: 'lobby' | 'full' | 'playing' | 'finished';
  createdAt: Date;
}

export interface GameState {
  id: string;
  roomId: string;
  players: PlayerInGame[];
  currentTurnIndex: number;
  lastPlay: PlayedCombination | null;
  direction: 1 | -1;
  firstPlayCard: Card | null;
  hasStartedFirstRound: boolean;
  status: 'waiting' | 'playing' | 'finished';
  result: {
    winner: { id: string; name: string };
    reason: string;
  } | null;
  passCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomRequest {
  name: string;
  isPrivate: boolean;
  maxPlayers: number;
  playerId: string;
  playerName: string;
}

export interface JoinRoomRequest {
  playerId: string;
  playerName: string;
}

export interface PlayCardsRequest {
  playerId: string;
  cards: Card[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit];
}

export function getRankDisplay(rank: Rank): string {
  const displays: Record<Rank, string> = {
    3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
    11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2',
  };
  return displays[rank];
}

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function getCombinationLabel(type: CombinationType): string {
  const labels: Record<CombinationType, string> = {
    single: 'lá',
    pair: 'đôi',
    triple: 'bộ ba',
    straight: 'sảnh',
    full_house: 'tứ quý',
    bomb: 'tứ quý',
  };
  return labels[type];
}
