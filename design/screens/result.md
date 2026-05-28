# Victory Modal

**Purpose**: Display game results when someone wins

## Desktop Layout

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │                    🎉 🎊 🎉                          │  │
│  │                                                      │  │
│  │               👑 CHIẾN THẮNG! 👑                      │  │
│  │                                                      │  │
│  │              Bạn đã về nhất!                         │  │
│  │                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ Lượt chơi   │  │ Thời gian   │  │ Lần đánh bài│  │  │
│  │  │    24       │  │  5m 32s    │  │     18      │  │  │
│  │  │             │  │            │  │             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                      │                                                      │
│  │              [ 🔄 CHƠI LẠI ]                         │  │
│  │                                                      │  │
│  │              [ ↩ THOÁT ]                             │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Mobile Layout (375px)

```
┌─────────────────────────┐
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │    🎉 👑 🎊      │  │
│  │                   │  │
│  │  CHIẾN THẮNG!     │  │
│  │                   │  │
│  │  Bạn đã về nhất! │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  ┌────────┐ ┌────────┐  │
│  │ Lượt   │ │ Thời   │  │
│  │  24    │ │ 5m32s  │  │
│  └────────┘ └────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   [ CHƠI LẠI ]   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │    [ THOÁT ]      │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

## Winner Display

| Winner | Message | Confetti |
|--------|---------|----------|
| You | "Bạn đã về nhất!" | Gold confetti burst |
| Opponent | "Minh đã về nhất!" | Subtle confetti |
| Draw | "Hòa!" (rare) | No confetti |

## Error State (If You Lost)

```
┌─────────────────────────────────────────┐
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │                                      │ │
│  │                 😔                   │ │
│  │                                      │ │
│  │            KẾT THÚC!                  │ │
│  │                                      │ │
│  │      Minh đã về nhất                 │ │
│  │                                      │ │
│  │      [ Thử lại ]    [ Thoát ]        │ │
│  │                                      │ │
│  └─────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

## Modal States

| State | Visual | Behavior |
|-------|--------|----------|
| Victory (You won) | Gold crown, full confetti | Confetti burst animation |
| Defeat (Opponent won) | Subtle, no fanfare | "Thử lại" prominent |
| Confetti | Particle animation | 3-second celebration |

## Key Interactions

1. **Click "Chơi lại"**:
   - Same players stay in room
   - New game starts
   - Modal closes, game screen resets

2. **Click "Thoát"**:
   - Leaves room
   - Returns to lobby
   - All players see modal close

3. **Auto-rematch** (if all players click):
   - If all players click "Chơi lại"
   - Game starts automatically

## Stats Displayed

| Stat | Description |
|------|-------------|
| Lượt chơi | Total turns in game |
| Thời gian | Time from game start to end |
| Lần đánh bài | Total cards played by winner |

## Timing

- Modal appears 2 seconds after game ends
- Confetti plays for 3 seconds
- Buttons enable after modal fully appears
- "Chơi lại" countdown if all players ready
