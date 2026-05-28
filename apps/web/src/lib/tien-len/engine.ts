import type { Card, GameState, PlayedCombination, PlayerInGame } from '@/types';

export interface GameEngineState {
  game: GameState;
  currentPlayerId: string;
  isMyTurn: boolean;
  myCards: Card[];
  canPlay: boolean;
  canPass: boolean;
}

export function createInitialGameState(
  roomId: string,
  players: { id: string; name: string; isHost: boolean }[],
  hands: Card[][]
): GameState {
  const playerInGames: PlayerInGame[] = players.map((p, i) => ({
    id: p.id,
    name: p.name,
    isHost: p.isHost,
    connected: true,
    cards: hands[i] || [],
    cardCount: hands[i]?.length || 0,
  }));

  return {
    id: '',
    roomId,
    players: playerInGames,
    currentTurnIndex: 0,
    lastPlay: null,
    direction: 1,
    firstPlayCard: null,
    hasStartedFirstRound: false,
    status: 'waiting',
    result: null,
    passCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function getCurrentPlayer(state: GameState): PlayerInGame | undefined {
  return state.players[state.currentTurnIndex];
}

export function getNextTurnIndex(state: GameState): number {
  let nextIndex = state.currentTurnIndex + state.direction;
  if (nextIndex >= state.players.length) {
    nextIndex = 0;
  }
  if (nextIndex < 0) {
    nextIndex = state.players.length - 1;
  }
  return nextIndex;
}

export function advanceTurn(state: GameState): GameState {
  return {
    ...state,
    currentTurnIndex: getNextTurnIndex(state),
    updatedAt: new Date(),
  };
}

export function applyPlay(
  state: GameState,
  playerId: string,
  cards: Card[]
): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;

  const player = state.players[playerIndex];
  const newCards = player.cards.filter(
    c => !cards.some(pc => pc.suit === c.suit && pc.rank === c.rank)
  );

  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = {
    ...player,
    cards: newCards,
    cardCount: newCards.length,
  };

  // Find first play card (3 of diamonds holder)
  let firstPlayCard = state.firstPlayCard;
  if (!state.hasStartedFirstRound) {
    const hasThreeDiamonds = cards.some(c => c.suit === 'diamonds' && c.rank === 3);
    if (hasThreeDiamonds) {
      firstPlayCard = cards.find(c => c.suit === 'diamonds' && c.rank === 3) || null;
    }
  }

  const lastPlay: PlayedCombination = {
    playerId,
    playerName: player.name,
    combinationType: getCombinationType(cards),
    cards,
    timestamp: new Date(),
  };

  return {
    ...state,
    players: updatedPlayers,
    lastPlay,
    firstPlayCard,
    hasStartedFirstRound: true,
    passCount: 0,
    currentTurnIndex: getNextTurnIndex(state),
    updatedAt: new Date(),
  };
}

function getCombinationType(cards: Card[]): PlayedCombination['combinationType'] {
  const len = cards.length;
  const ranks = cards.map(c => c.rank);
  const uniqueRanks = [...new Set(ranks)];
  const uniqueSuits = [...new Set(cards.map(c => c.suit))];

  if (len === 1) return 'single';
  if (len === 2 && uniqueRanks.length === 1) return 'pair';
  if (len === 3 && uniqueRanks.length === 1) return 'triple';
  if (len === 4 && uniqueRanks.length === 1) return 'bomb';
  if (uniqueSuits.length === 1 && len >= 3) return 'straight';
  if (len === 5) {
    const rankCounts = new Map<number, number>();
    for (const r of ranks) {
      rankCounts.set(r, (rankCounts.get(r) || 0) + 1);
    }
    const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
    if (counts[0] === 3 && counts[1] === 2) return 'full_house';
  }
  return 'single';
}

export function applyPass(state: GameState, playerId: string): GameState {
  const newPassCount = state.passCount + 1;

  // Check if all players passed (3 passes = round reset)
  if (newPassCount >= state.players.length) {
    return {
      ...state,
      lastPlay: null,
      passCount: 0,
      hasStartedFirstRound: false,
      updatedAt: new Date(),
    };
  }

  return {
    ...state,
    passCount: newPassCount,
    currentTurnIndex: getNextTurnIndex(state),
    updatedAt: new Date(),
  };
}

export function checkWinCondition(state: GameState): { winner: PlayerInGame; reason: string } | null {
  for (const player of state.players) {
    if (player.cards.length === 0) {
      return { winner: player, reason: 'empty_hand' };
    }
  }
  return null;
}

export function removePlayerCards(state: GameState, playerId: string, cards: Card[]): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;

  const player = state.players[playerIndex];
  const newCards = player.cards.filter(
    c => !cards.some(pc => pc.suit === c.suit && pc.rank === c.rank)
  );

  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = {
    ...player,
    cards: newCards,
    cardCount: newCards.length,
  };

  return {
    ...state,
    players: updatedPlayers,
  };
}

export function getPlayerHand(state: GameState, playerId: string): Card[] {
  const player = state.players.find(p => p.id === playerId);
  return player?.cards || [];
}

export function canPlayerPlay(
  state: GameState,
  playerId: string,
  cards: Card[]
): { canPlay: boolean; reason?: string } {
  const currentPlayer = getCurrentPlayer(state);
  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { canPlay: false, reason: 'Chưa đến lượt bạn' };
  }

  if (!state.hasStartedFirstRound) {
    // Must play 3 of diamonds or contain it
    const hasThreeDiamonds = cards.some(c => c.suit === 'diamonds' && c.rank === 3);
    if (!hasThreeDiamonds) {
      return { canPlay: false, reason: 'Phải đánh 3♦ hoặc lá bài chứa 3♦ trong lượt đầu tiên' };
    }
  }

  return { canPlay: true };
}

export function disconnectPlayer(state: GameState, playerId: string): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;

  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = {
    ...state.players[playerIndex],
    connected: false,
  };

  return {
    ...state,
    players: updatedPlayers,
  };
}

export function reconnectPlayer(state: GameState, playerId: string): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;

  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = {
    ...state.players[playerIndex],
    connected: true,
  };

  return {
    ...state,
    players: updatedPlayers,
  };
}
