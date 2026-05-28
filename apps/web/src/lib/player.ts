import { v4 as uuidv4 } from 'uuid';

export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('playerId');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('playerId', id);
  }
  return id;
}

export function getPlayerName(): string {
  if (typeof window === 'undefined') return 'Anonymous';
  return localStorage.getItem('playerName') || 'Anonymous';
}

export function setPlayerName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playerName', name);
  }
}

export function getPlayerIdFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('playerId');
}
