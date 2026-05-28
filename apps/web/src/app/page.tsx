'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { RoomCard } from '@/components/game/RoomCard';
import { getOrCreatePlayerId, getPlayerName, setPlayerName } from '@/lib/player';
import type { Room, ApiResponse } from '@/types';

export default function LobbyPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createRoomName, setCreateRoomName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [playerName, setPlayerNameState] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const playerId = getOrCreatePlayerId();
  const storedName = getPlayerName();

  useEffect(() => {
    setPlayerNameState(storedName);
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data: ApiResponse<Room[]> = await res.json();
      if (data.success && data.data) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    const name = createRoomName.trim() || `Phòng của ${playerName}`;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          isPrivate: false,
          maxPlayers: 4,
          playerId,
          playerName: playerName || 'Anonymous',
        }),
      });
      const data: ApiResponse<Room & { shareUrl: string }> = await res.json();
      if (data.success && data.data) {
        window.location.href = `/room/${data.data.code}`;
      } else {
        showToast(data.error || 'Failed to create room');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra');
    }
  };

  const joinRoom = async (code: string) => {
    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          playerName: playerName || 'Anonymous',
        }),
      });
      const data: ApiResponse<Room> = await res.json();
      if (data.success && data.data) {
        window.location.href = `/room/${code}`;
      } else {
        showToast(data.error || 'Không thể tham gia phòng');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const updatePlayerName = (name: string) => {
    setPlayerNameState(name);
    setPlayerName(name);
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="bg-bg-surface py-4 px-6 border-b border-bg-elevated">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#x1F0B9;</span>
            <h1 className="text-xl font-bold">Tiến Lên Miền Nam</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => updatePlayerName(e.target.value)}
                className="bg-bg-dark border border-bg-elevated rounded px-3 py-1.5 text-sm w-32"
                placeholder="Tên của bạn"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => {}}>
              ?
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-2xl p-8 text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Chào mừng đến với Tiến Lên!</h2>
          <p className="text-text-secondary">Làm bạn tôi trong một ván bài?</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div
            className="bg-bg-surface rounded-2xl p-8 text-center cursor-pointer hover:border-primary border-2 border-transparent transition-all"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="text-4xl mb-4">&#x1F0B4;</div>
            <h3 className="text-lg font-semibold mb-2">Tạo phòng mới</h3>
            <p className="text-sm text-text-secondary">Tạo phòng mới và mời bạn bè</p>
          </div>

          <div
            className="bg-bg-surface rounded-2xl p-8 text-center cursor-pointer hover:border-primary border-2 border-transparent transition-all"
            onClick={() => setShowJoinModal(true)}
          >
            <div className="text-4xl mb-4">&#x1F517;</div>
            <h3 className="text-lg font-semibold mb-2">Tham gia bằng mã</h3>
            <p className="text-sm text-text-secondary">Nhập mã phòng để vào</p>
          </div>

          <div className="bg-bg-surface rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">&#x1F4CB;</div>
            <h3 className="text-lg font-semibold mb-2">Danh sách phòng</h3>
            <p className="text-sm text-text-secondary">Xem phòng đang chờ</p>
          </div>
        </div>

        {/* Room List */}
        <div className="bg-bg-surface rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">
            Phòng đang chờ ({rooms.length})
          </h3>

          {loading ? (
            <div className="text-center py-8 text-text-secondary">Đang tải...</div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">Chưa có phòng nào</p>
              <Button onClick={() => setShowCreateModal(true)}>Tạo phòng mới</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={() => joinRoom(room.code)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-bg-surface px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo phòng mới"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="success" onClick={createRoom}>
              Tạo phòng
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Tên phòng</label>
            <Input
              value={createRoomName}
              onChange={(e) => setCreateRoomName(e.target.value)}
              placeholder={`Phòng của ${playerName}`}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Số người chơi</label>
            <select className="w-full h-10 px-4 rounded-lg bg-bg-dark border border-bg-elevated text-text-primary">
              <option value={2}>2 người</option>
              <option value={3}>3 người</option>
              <option value={4}>4 người</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Join Room Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Tham gia phòng"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowJoinModal(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (joinRoomCode.length === 6) {
                  joinRoom(joinRoomCode.toUpperCase());
                  setShowJoinModal(false);
                }
              }}
              disabled={joinRoomCode.length !== 6}
            >
              Tham gia
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm text-text-secondary mb-2">Mã phòng</label>
          <Input
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="ABC123"
            maxLength={6}
          />
        </div>
      </Modal>
    </div>
  );
}
