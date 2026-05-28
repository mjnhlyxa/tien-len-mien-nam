# Game Screen

**Route**: `/room/[code]/game`
**Purpose**: Main gameplay interface showing all players and the play area

## Layout (Desktop - 4 Players)

```
┌────────────────────────────────────────────────────────────┐
│ ◄ Lobby    Phòng: ABC123    Lượt: Minh    [?] Trợ giúp     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                    ┌─────────────┐                        │
│                    │  Hùng (3)   │  ← Opponent (top)      │
│                    │   ♠♥♣♦♠♥♣   │                        │
│                    └─────────────┘                        │
│                                                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │            │    │             │    │             │   │
│  │   Lan      │    │   🃏 BÀI    │    │   Minh      │   │
│  │   (5)      │    │  ĐÃ ĐÁNH   │    │   (7) ⭐    │   │
│  │            │    │            │    │             │   │
│  │  ♠♥♣♦♠♥♣   │    │  Pair of   │    │  ♠7 ♥5 ♣K   │   │
│  │            │    │   Kings    │    │  ♦A         │   │
│  │ ← Opponent │    │            │    │  ← You      │   │
│  │  (left)    │    │  [3 người  │    │             │   │
│  │            │    │   đã bỏ]   │    │  ─────────  │   │
│  └─────────────┘    │   lượt]    │    │ [Sắp xếp]   │   │
│                    │            │    │ [Đánh] [Bỏ] │   │
│                    └─────────────┘    └─────────────┘   │
│                                         ↓                │
│                                      [ Your Hand ]        │
│                                    ♠7 ♥5 ♣K ♦A ♠J...     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Layout (Mobile 375px - Your Turn)

```
┌───────────────────────────────────────┐
│◄ Lobby  ABC123 轮到: Bạn  [?]         │
├───────────────────────────────────────┤
│                                       │
│           ┌─────────────┐             │
│           │  Hùng (3)   │             │
│           │  ---- ----  │             │
│           └─────────────┘             │
│                                       │
│ ┌────────┐ ┌──────────────┐ ┌────────┐ │
│ │ Lan(5)│ │   🃏 BÀI     │ │Minh(7) │ │
│ │-- -- │ │  ĐÃ ĐÁNH     │ │  ⭐    │ │
│ │      │ │              │ │        │ │
│ └────────┘ │  Pair of K  │ └────────┘ │
│            │              │           │
│            │ [Bỏ: 3 lượt]│           │
│            └──────────────┘           │
│                                       │
│ ┌─────────────────────────────────────┐│
│ │         YOUR HAND (7 cards)         ││
│ │  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐   ││
│ │  │♠7││♥5││♣K││♦A││♠J││♥Q││♣10│  ││
│ │  └──┘└──┘└──┘└──┘└──┘└──┘└──┘   ││
│ └─────────────────────────────────────┘│
│                                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Sắp xếp │ │  ĐÁNH   │ │ BỎ LƯỢT│   │
│ └─────────┘ └─────────┘ └─────────┘   │
└───────────────────────────────────────┘
```

## Player Position Layout

```
         [Player 3 - Top]
              ↓
[Player 2] ←  Table  → [Player 4]
  (left)                       (right)
              ↑
         [Player 1]
          (You / Bottom)
```

For 2-player game:
```
   [Player 2 - Opponent - Top]
              ↓
   Table / Play Area
              ↑
      [Player 1 - You - Bottom]
```

For 3-player game:
```
         [Player 3 - Opponent]
              ↓
[Player 2] ←  Table  → [You]
```

## Elements

| Element | Description | Behavior |
|---------|-------------|----------|
| Back button | Returns to lobby | Click → confirm if in game |
| Room code | Displayed in header | Abbreviated "ABC" |
| Turn indicator | Whose turn | Shows current player name |
| Player panels (x4) | Each player's info | Shows name, cards count, last play |
| Played cards area | Center table | Shows last played combination |
| Opponent card backs | Face-down cards | Number matches cards remaining |
| Your hand | Your cards | Horizontal scroll, selectable |
| Card component | Single playing card | Click to select/deselect |
| Sort button | Sorts your hand | Toggle by suit or rank |
| Play button | Plays selected cards | Enabled when valid selection |
| Pass button | Skip your turn | Disabled until after first round begins |
| Help button | Shows rules | Opens rules modal |

### Player Panel Contents

| Content | Opponent | You |
|---------|---------|-----|
| Avatar | Colored circle with initial | Same |
| Name | Player name | "Bạn" |
| Role | "(Chủ phòng)" if host | Same |
| Card count | Number (face-down backs) | Number |
| Last play | Text summary of last play | Same |
| Turn indicator | Glowing border when your turn | Same |
| Online status | Green/gray dot | N/A |

## Card States (In Your Hand)

| State | Visual | Interaction |
|-------|--------|-------------|
| Default | Face up, slight shadow | Clickable |
| Selected | Blue ring, lifted | Click to deselect |
| Disabled | Grayed out | Not clickable |
| Hovered | Slight lift | Cursor: pointer |
| Sorted by suit | Grouped by ♥♠♣♦ | - |
| Sorted by rank | Grouped by number | - |

## Play Area States

| State | Content |
|------|---------|
| Empty (new round) | "Chọn bài để đánh" placeholder |
| Has last play | Cards + combination type label |
| Valid selection indicator | Shows if current cards beat last |
| Cannot beat indicator | "Không thể đánh bài này" |

## Action Button States

### Play Button
| State | Appearance |
|-------|------------|
| Disabled | Grayed out, no cards selected |
| Enabled | Green, valid cards selected |
| Invalid selection | Shows error on click |

### Pass Button
| State | Appearance |
|-------|------------|
| Disabled | Grayed out, first round or can beat last |
| Enabled | Yellow/orange, valid to pass |
| Only pass option | Pulsing when must pass |

## Combo Display in Play Area

| Combo Type | Label | Example |
|------------|-------|---------|
| Single | lá | 7♠ |
| Pair | đôi | 8♥ 8♦ |
| Triple | bộ ba | J♠ J♥ J♦ |
| Straight | sảnh | 3♥ 4♥ 5♥ |
| Full House | tứ quý | 9♠ 9♥ 9♦ + 4♣ 4♦ |
| Bomb | tứ quý | K♠ K♥ K♦ K♣ |

## Win Detection

When a player plays their last card:
1. All cards briefly highlight
2. "BÁO" toast appears ("Bạn/Bên đánh bài cuối cùng!")
3. Victory modal opens for winner

## Key Interactions

1. **Click card in hand**:
   - Toggle selection state
   - Blue ring appears when selected
   - Can select multiple for combos

2. **Click "Đánh bài"**:
   - If valid → Cards animate to center
   - Turn passes to next player
   - Hand updates with remaining cards
   - If invalid → Error shake + message

3. **Click "Bỏ lượt"**:
   - Passes turn (after first round)
   - Shows "Đã bỏ lượt" toast
   - Turn passes to next player

4. **Click "Sắp xếp"**:
   - Toggles between suit/rank sorting
   - Cards smoothly reorder

5. **Click player panel**:
   - Shows player details (desktop only)
   - Mobile: just shows card count

## States Summary

| State | Description |
|-------|-------------|
| Waiting to start | "Đang chờ..." while cards dealer |
| Your turn | Your hand active, controls enabled |
| Opponent turn | Seeing opponent's action, controls disabled |
| Round won | "Lượt mới" indicator, cleared table |
| Game won | Victory modal |
| Disconnected | "Mất kết nối" overlay with reconnect |
| Your turn timeout | Auto-pass after 30s |
