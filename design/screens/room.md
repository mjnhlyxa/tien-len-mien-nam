# Waiting Room Screen

**Route**: `/room/[code]`
**Purpose**: Show room details while waiting for players to join before game starts

## Layout (Desktop)

```
┌──────────────────────────────────────────────────────────┐
│ ◄ TỚI LOBBY        Mã phòng: ABC123        [?] Trợ giúp │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              🃏 PHÒNG CỦA MINH                     │   │
│  │                                                  │   │
│  │   Mã phòng:                                       │   │
│  │   ┌─────────────────────────────────────────┐     │   │
│  │   │  ABC123                      📋 Sao chép │     │   │
│  │   └─────────────────────────────────────────┘     │   │
│  │                                                  │   │
│  │   Chia sẻ_link với bạn bè:                        │   │
│  │   https://tien-len.vercel.app/room/ABC123        │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Người chơi (2/4)                     │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐     │   │
│  │  │ 🟢 Minh (Chủ phòng)                      │     │   │
│  │  └─────────────────────────────────────────┘     │   │
│  │  ┌─────────────────────────────────────────┐     │   │
│  │  │ 🟢 Lan                                   │     │   │
│  │  └─────────────────────────────────────────┘     │   │
│  │                                                  │   │
│  │              Đang chờ thêm người chơi...          │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │              [ 🔴 BẮT ĐẦU ]                       │   │
│  │        (Cần ít nhất 2 người chơi)                 │   │
│  │                                                  │   │
│  │              [ Rời phòng ]                       │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Layout (Mobile 375px)

```
┌─────────────────────────────┐
│ ◄ Lobby    ABC123    [?]   │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │   PHÒNG CỦA MINH      │  │
│  │                      │  │
│  │   Mã: ABC123 📋       │  │
│  │                      │  │
│  │   Link: tinyurl.com/  │  │
│  └───────────────────────┘  │
│                             │
│  ── Người chơi (2/4) ──    │
│                             │
│  ┌───────────────────────┐  │
│  │ 🟢 Minh (Chủ phòng)   │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 🟢 Lan                 │  │
│  └───────────────────────┘  │
│                             │
│  Đang chờ thêm...           │
│                             │
│  ┌───────────────────────┐  │
│  │    [ BẮT ĐẦU ]       │  │
│  └───────────────────────┘  │
│                             │
│  [ Rời phòng ]              │
│                             │
└─────────────────────────────┘
```

## Elements

| Element | Description | Behavior |
|---------|-------------|----------|
| Back button | Returns to lobby | Click → confirm if players waiting |
| Room code | 6-character code | Displayed prominently, copyable |
| Copy button | Copies code to clipboard | Click → toast "Đã sao chép" |
| Share URL | Full URL to room | Auto-generated, click to copy |
| Player list | List of joined players | Updates in real-time |
| Player badge | Shows name + host indicator | Green dot = online |
| Start button | Begins game (host only) | Disabled until 2+ players |
| Leave button | Exits room | Always enabled |

## States

### Waiting for Players
- Player list shows who's joined
- Start button disabled with helper text "(Cần ít nhất 2 người chơi)"
- Pulsing indicator "Đang chờ thêm người chơi..."

### Ready to Start (2+ players)
- Start button turns green and pulsing
- Start button enabled for host

### Private Room
- No share URL shown
- Only host can share code directly

### Game Starting
- Brief "Đang xáo bài..." message
- Auto-redirect to game screen

## Key Interactions

1. **Click "Sao chép"** on code:
   - Copies "ABC123" to clipboard
   - Toast: "Đã sao chép mã phòng"

2. **Click share link**:
   - Opens native share on mobile (if supported)
   - Copies URL on desktop

3. **Host clicks "Bắt đầu"**:
   - Cards are dealt
   - Redirect to game screen
   - All players redirected

4. **Non-host waiting**:
   - Sees same page
   - "Bắt đầu" button not shown
   - Auto-redirect when host starts

## Player States

| State | Badge | Indicator |
|-------|-------|-----------|
| Online | Green dot | 🟢 |
| Offline (disconnected) | Gray dot | 🟤 |
| This player | Highlighted border | - |
| Host | "(Chủ phòng)" label | ⭐ |
