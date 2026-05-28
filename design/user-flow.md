# Tiến Lên Miền Nam — User Flow

## Game Overview
Tiến Lên Miền Nam is a Vietnamese card game for 2-4 players. Each player receives 13 cards, and players take turns playing valid combinations. The first to empty their hand wins.

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LOBBY (Home)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Tạo phòng   │  │ Danh sách   │  │ Tham gia bằng mã │   │
│  │ mới         │  │ phòng       │  │ phòng            │   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘   │
└─────────┼────────────────┼─────────────────┼──────────────┘
          │                │                 │
          ▼                ▼                 │
┌─────────────────┐  ┌─────────────────┐   │
│   ROOM EDIT     │  │   ROOM LIST     │   │
│   MODAL         │  │   SCREEN        │   │
│                 │  │                 │   │
│ Name: [    ]    │  │ +-------------+ │   │
│ [Tạo phòng]     │  │ | Phòng Minh  | │   │
│ [Hủy]           │  │ | 2/4 người   │ │   │
└────────┬────────┘  │ +-------------+ │   │
         │           │ | Phòng Lan   │ │   │
         │           │ | 3/4 người   │ │   │
         ▼           │ +-------------+ │   │
┌─────────────────┐  │ [Tham gia]      │   │
│    WAITING      │  └────────┬────────┘   │
│    ROOM         │           │             │
│                 │           └─────────────┘
│  Mã phòng:      │                         │
│  ┌──────┐      │                         │
│  │ABC123│ [Sao chép]│                     │
│  └──────┘       │                         │
│                 │                         │
│  Đang chờ...    │                         │
│  ┌─────────┐   │                         │
│  │ Minh    │   │                         │
│  │ Lan     │   │                         │
│  │ Hùng    │   │                         │
│  └─────────┘   │                         │
│                 │                         │
│  [Bắt đầu]      │ (host only, min 2+)    │
│  [Rời phòng]    │                         │
└────────┬────────┘                         │
         │ player presses Start
         │ OR another player joins via link
         ▼
┌─────────────────────────────────────────┐
│            GAME SCREEN                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    [Player 3 - Top - 13 cards]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Player 2]           [Player 3 Panel] │
│  (left)                                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      BÀI ĐÃ ĐÁNH                │   │
│  │      Last Play Area             │   │
│  │      "Pair of Kings"            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Player 4]           [Player 1 Panel] │
│  (right)                                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   [Your Hand - 13 cards]        │   │
│  │   ♠7 ♥5 ♣K ♦A ...               │   │
│  │   [Sắp xếp] [Đánh bài] [Bỏ lượt]│   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
         │
         │ Someone plays last card
         ▼
┌─────────────────────────────────────────┐
│          VICTORY MODAL                  │
│                                         │
│  🎉 CHIẾN THẮNG! 🎉                      │
│                                         │
│  Bạn đã về nhất                          │
│                                         │
│  Lượt chơi: 24                          │
│  Thời gian: 5m 32s                      │
│                                         │
│  [Chơi lại]  [Thoát]                    │
│                                         │
└─────────────────────────────────────────┘
```

## Screen List

1. **Lobby** (`/`) — Entry point. Shows create room, browse rooms, join by code
2. **Waiting Room** (`/room/[code]`) — Room code display, player list, start button
3. **Game Room** (`/room/[code]/game`) — Full game interface with all players
4. **Victory Modal** — Overlay on game screen when someone wins

## Detailed Screen Flows

### 1. Create Room Flow
```
Lobby → Click "Tạo phòng mới"
     → Modal opens with name input
     → Enter name (or use "Anonymous")
     → Toggle private/public (default: public)
     → Click "Tạo phòng"
     → Redirect to /room/[code] (waiting room)
```

### 2. Join Room Flow
```
Lobby → Click "Tham gia bằng mã"
     → Modal opens with code input (6 chars)
     → Enter code
     → Click "Tham gia"
     → If valid → Redirect to /room/[code]
     → If full/invalid → Show error toast
```

### 3. Browse & Join Flow
```
Lobby → See public room list (auto-refreshes)
     → Click "Tham gia" on any room card
     → If space available → Redirect to /room/[code]
     → If full → Show error toast
```

### 4. Game Play Flow
```
Waiting Room → Host clicks "Bắt đầu"
           → All players see game screen
           → Cards dealt, host goes first

Game Loop:
  → Your turn → Select cards → Click "Đánh bài"
  → Valid play → Cards animate to center → Turn passes
  → Invalid play → Error shake → Select different cards
  → Cannot beat → Click "Bỏ lượt"
  → All pass (3x) → Reset to fresh round

Game Ends:
  → Someone empties hand
  → Victory modal appears
  → [Chơi lại] → New game same room
  → [Thoát] → Return to lobby
```

### 5. Share Room Flow
```
Waiting Room → Click "Sao chép mã phòng"
           → Code copied to clipboard
           → Toast: "Đã sao chép mã phòng"
           → Share link via any app
```

## Mobile-Specific Flow

```
Mobile: 375px viewport
  - Lobby: Full-width buttons stacked vertically
  - Waiting Room: Full-screen, players listed vertically
  - Game Room: 
    * Opponent cards: face-down, 7 per row
    * Your hand: horizontal scroll, larger cards
    * Play area: center, compact
    * Action buttons: bottom fixed bar
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Player closes tab mid-game | 30s timeout → marked disconnected → auto-pass |
| Room empty (all leave) | Room deleted after 5 minutes |
| Host leaves before start | New host assigned automatically |
| Network disconnect | Reconnect button, state preserved |
| All 4 players pass consecutively | Round resets, last played cards cleared |
| Player has only bombs left | Can play any bomb (even non-beating) |
