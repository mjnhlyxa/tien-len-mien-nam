'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlayerHand } from '@/components/game/PlayerHand';
import { PlayerPanel } from '@/components/game/PlayerPanel';
import { PlayArea } from '@/components/game/PlayArea';
import { CardGroup } from '@/components/game/CardGroup';
import { Card } from '@/components/game/Card';
import { getOrCreatePlayerId } from '@/lib/player';
import type { GameState, Card as CardType, PlayedCombination } from '@/types';
import { isRedSuit, getSuitSymbol, getRankDisplay } from '@/types';

type ApiResponse<T> = { success: boolean; data?: T; error?: string; message?: string };

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [myCards, setMyCards] = useState<CardType[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'suit' | 'rank'>('suit');
  const [gameOver, setGameOver] = useState(false);

  const playerId = getOrCreatePlayerId();

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/games/room/${roomId}?playerId=${playerId}`);
      const data: ApiResponse<GameState> = await res.json();
      if (data.success && data.data) {
        setGame(data.data);

        // Get my cards
        const me = data.data.players.find((p: any) => p.id === playerId);
        if (me?.cards) {
          setMyCards(me.cards);
        }

        // Check game over
        if (data.data.status === 'finished') {
          setGameOver(true);
        } else {
          setGameOver(false);
        }
      } else if (data.error) {
        showToast(data.error);
      }
    } catch (error) {
      console.error('Failed to fetch game:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameByRoom = async () => {
    try {
      // First get room to find gameId
      const roomRes = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomRes.json();
      if (roomData.success && roomData.data?.gameId) {
        const gameRes = await fetch(`/api/games/${roomData.data.gameId}?playerId=${playerId}`);
        const gameData: ApiResponse<GameState> = await gameRes.json();
        if (gameData.success && gameData.data) {
          setGame(gameData.data);
          const me = gameData.data.players.find((p: any) => p.id === playerId);
          if (me?.cards) {
            setMyCards(me.cards);
          }
          if (gameData.data.status === 'finished') {
            setGameOver(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch game by room:', error);
    }
  };

  const playCards = async () => {
    if (selectedIndices.length === 0) {
      showToast('Chọn bài để đánh');
      return;
    }

    const cardsToPlay = selectedIndices.map(i => myCards[i]);
    try {
      const res = await fetch(`/api/games/${game?.id}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cards: cardsToPlay }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIndices([]);
        fetchGame();
      } else {
        showToast(data.error || 'Không thể đánh bài');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra');
    }
  };

  const passTurn = async () => {
    try {
      const res = await fetch(`/api/games/${game?.id}/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIndices([]);
        fetchGame();
      } else {
        showToast(data.error || 'Không thể bỏ lượt');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra');
    }
  };

  const handleCardSelect = useCallback((card: CardType, index: number) => {
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const currentPlayer = game?.players[game.currentTurnIndex];
  const isMyTurn = currentPlayer?.id === playerId;

  const handleSort = (by: 'suit' | 'rank') => {
    setSortBy(by);
    const sorted = [...myCards].sort((a, b) => {
      if (by === 'suit') {
        const suitOrder = ['hearts', 'diamonds', 'clubs', 'spades'];
        const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
        if (suitDiff !== 0) return suitDiff;
        return a.rank - b.rank;
      }
      return a.rank - b.rank;
    });
    setMyCards(sorted);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-text-secondary">Đang tải...</div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="bg-bg-surface rounded-2xl p-8 text-center max-w-md w-full mx-4">
          <div className="text-5xl mb-4">&#x1F389;</div>
          <h1 className="text-3xl font-bold mb-2">KẾT THÚC!</h1>
          <p className="text-text-secondary mb-6">
            {game?.result?.winner?.id === playerId
              ? 'Bạn đã về nhất!'
              : `${game?.result?.winner?.name} đã về nhất!`}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-bg-elevated p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{game?.passCount || 0}</div>
              <div className="text-xs text-text-secondary">Lượt chơi</div>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="success" className="w-full" onClick={() => window.location.href = `/room/${roomId}`}>
              Chơi lại
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => router.push('/')}>
              Thoát
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="bg-bg-surface py-3 px-6 border-b border-bg-elevated">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              &#x25C0; Lobby
            </Button>
            <span className="text-text-secondary">|</span>
            <span className="text-sm">
              Phòng: <strong className="text-primary">{roomId}</strong>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            ?
          </Button>
        </div>
      </header>

      {/* Game Board */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col gap-4 min-h-[calc(100vh-140px)]">
          {/* Top Player */}
          <div className="flex justify-center">
            <PlayerPanel
              player={game?.players[2] || game?.players[0] || { id: '', name: 'Unknown', isHost: false, connected: true, cardCount: 0, cards: [] }}
              isCurrentTurn={currentPlayer?.id === (game?.players[2]?.id || game?.players[0]?.id)}
              position="top"
              showCards={false}
            />
          </div>

          {/* Middle Row */}
          <div className="flex-1 flex gap-4">
            {/* Left Player */}
            <div className="flex-shrink-0">
              <PlayerPanel
                player={game?.players[0] || { id: '', name: 'Unknown', isHost: false, connected: true, cardCount: 0, cards: [] }}
                isCurrentTurn={currentPlayer?.id === game?.players[0]?.id}
                position="left"
                showCards={false}
              />
            </div>

            {/* Play Area */}
            <div className="flex-1">
              <PlayArea
                lastPlay={game?.lastPlay || null}
                canBeat={true}
                passCount={game?.passCount || 0}
                totalPlayers={game?.players.length || 2}
              />
            </div>

            {/* Right Player */}
            <div className="flex-shrink-0">
              <PlayerPanel
                player={game?.players[1] || { id: '', name: 'Unknown', isHost: false, connected: true, cardCount: 0, cards: [] }}
                isCurrentTurn={currentPlayer?.id === game?.players[1]?.id}
                position="right"
                showCards={false}
              />
            </div>
          </div>

          {/* Your Hand */}
          <div className="bg-bg-surface rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-text-secondary">
                Bài của bạn ({myCards.length})
                {isMyTurn && <Badge variant="success" className="ml-2">Lượt của bạn</Badge>}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort('suit')}
                  className={`text-xs px-2 py-1 rounded ${sortBy === 'suit' ? 'bg-primary text-white' : 'bg-bg-elevated text-text-secondary'}`}
                >
                  Theo chất
                </button>
                <button
                  onClick={() => handleSort('rank')}
                  className={`text-xs px-2 py-1 rounded ${sortBy === 'rank' ? 'bg-primary text-white' : 'bg-bg-elevated text-text-secondary'}`}
                >
                  Theo số
                </button>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
              {myCards.map((card, index) => (
                <div
                  key={`${card.suit}-${card.rank}-${index}`}
                  onClick={() => isMyTurn && handleCardSelect(card, index)}
                  className={`
                    w-16 h-24 rounded-lg flex flex-col items-center justify-center
                    bg-white border-2 cursor-pointer transition-all duration-150
                    shadow-md hover:-translate-y-1 hover:shadow-lg
                    ${selectedIndices.includes(index) ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-dark transform -translate-y-2' : ''}
                    ${isRedSuit(card.suit) ? 'text-card-hearts' : 'text-gray-900'}
                    ${!isMyTurn ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="font-bold text-sm absolute top-1 left-1">{getRankDisplay(card.rank)}</span>
                  <span className="text-2xl">{getSuitSymbol(card.suit)}</span>
                  <span className="font-bold text-sm absolute bottom-1 right-1 rotate-180">{getRankDisplay(card.rank)}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => handleSort(sortBy === 'suit' ? 'rank' : 'suit')}
              >
                Sắp xếp
              </Button>
              <Button
                variant="success"
                size="lg"
                disabled={!isMyTurn || selectedIndices.length === 0}
                onClick={playCards}
              >
                &#x27A1; ĐÁNH BÀI
              </Button>
              <Button
                variant="warning"
                size="lg"
                disabled={!isMyTurn}
                onClick={passTurn}
              >
                &#x23ED; BỎ LƯỢT
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-bg-surface px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
