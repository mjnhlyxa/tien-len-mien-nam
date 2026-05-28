'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getOrCreatePlayerId, getPlayerName } from '@/lib/player';
import type { Room, ApiResponse } from '@/types';

export default function WaitingRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const playerId = getOrCreatePlayerId();
  const playerName = getPlayerName();

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data: ApiResponse<Room> = await res.json();
      if (data.success && data.data) {
        setRoom(data.data);
        setLoading(false);

        // Redirect to game if status is playing
        if (data.data.status === 'playing' && data.data.gameId) {
          router.push(`/room/${roomId}/game`);
        }

        // Redirect to lobby if room not found
        if (data.data.status === 'finished') {
          router.push('/');
        }
      } else {
        setError(data.error || 'Phòng không tồn tại');
        setLoading(false);
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      const data: ApiResponse<{ gameId: string }> = await res.json();
      if (data.success && data.data) {
        router.push(`/room/${roomId}/game`);
      } else {
        showToast(data.error || 'Không thể bắt đầu trò chơi');
      }
    } catch (err) {
      showToast('Có lỗi xảy ra');
    }
  };

  const leaveRoom = async () => {
    try {
      await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      router.push('/');
    } catch (err) {
      showToast('Có lỗi xảy ra');
    }
  };

  const copyCode = async () => {
    if (room) {
      await navigator.clipboard.writeText(room.code);
      showToast('Đã sao chép mã phòng');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const isHost = room?.currentPlayers.some((p) => p.id === playerId && p.name === playerName);
  const canStart = room && room.currentPlayers.length >= 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-text-secondary">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent-red mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Quay về Lobby</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="bg-bg-surface py-4 px-6 border-b border-bg-elevated">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              &#x25C0; Tới Lobby
            </Button>
            <span className="text-text-secondary">|</span>
            <span className="font-mono">
              Mã phòng: <strong className="text-primary">{roomId}</strong>
            </span>
          </div>
          <Button variant="ghost" onClick={() => {}}>
            ?
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6">
        {/* Room Info */}
        <div className="bg-bg-surface rounded-xl p-6 mb-6 text-center">
          <h2 className="text-xl font-bold mb-4">&#x1F0B9; {room?.name}</h2>

          <div className="mb-4">
            <p className="text-sm text-text-secondary mb-2">Mã phòng</p>
            <div className="flex items-center justify-center gap-3 bg-bg-dark p-3 rounded-lg">
              <span className="font-mono text-2xl tracking-widest text-primary">
                {roomId}
              </span>
              <Button variant="secondary" size="sm" onClick={copyCode}>
                &#x1F4CB; Sao chép
              </Button>
            </div>
          </div>

          <p className="text-sm text-text-secondary">
            Link: {typeof window !== 'undefined' ? window.location.origin : ''}/room/{roomId}
          </p>
        </div>

        {/* Players */}
        <div className="bg-bg-surface rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Người chơi ({room?.currentPlayers.length}/{room?.maxPlayers})
          </h3>

          <div className="space-y-3">
            {room?.currentPlayers.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-bg-elevated p-3 rounded-lg"
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    true ? 'bg-accent-green' : 'bg-text-secondary'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {player.name}
                    {index === 0 && (
                      <Badge variant="warning">Chủ phòng</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {room &&
              Array.from({ length: (room.maxPlayers || 4) - room.currentPlayers.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 bg-bg-elevated bg-opacity-50 p-3 rounded-lg border-2 border-dashed border-bg-elevated"
                >
                  <span className="w-3 h-3 rounded-full bg-text-secondary opacity-50" />
                  <div className="flex-1 text-text-secondary">
                    Đang chờ...
                  </div>
                </div>
              ))}
          </div>

          <p className="text-center text-text-secondary text-sm mt-4">
            Đang chờ thêm người chơi...
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isHost ? (
            <Button
              variant="success"
              size="lg"
              className="w-full"
              disabled={!canStart}
              onClick={startGame}
            >
              {canStart ? 'BẮT ĐẦU' : 'Cần ít nhất 2 người chơi'}
            </Button>
          ) : (
            <div className="text-center text-text-secondary text-sm p-3 bg-bg-surface rounded-lg">
              Đang chờ chủ phòng bắt đầu...
            </div>
          )}

          <Button variant="secondary" className="w-full" onClick={leaveRoom}>
            Rời phòng
          </Button>
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
