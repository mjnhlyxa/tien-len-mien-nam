# Tiến Lên Miền Nam — Component Specifications

## Game Components

### Card
**Purpose**: Visual representation of a playing card
**Used on**: PlayerHand, PlayArea, PlayedCards
**Props**:
- `suit`: "hearts" | "diamonds" | "clubs" | "spades"
- `rank`: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
- `size`: "sm" | "md" | "lg"
- `face_down`: boolean (for opponent cards)
- `selected`: boolean
- `disabled`: boolean
**States**: default, hover, selected, disabled, face_down
**Display**:
- Red suits (hearts, diamonds): text-red-600
- Black suits (clubs, spades): text-gray-900
- Rank: 3-10 as number, J=11→"J", Q=12→"Q", K=13→"K", A=14→"A", 2=15→"2"
- Suits: ♥ ♦ ♣ ♠

### CardGroup
**Purpose**: Display multiple cards in a row/pile
**Used on**: PlayArea, PlayerHand
**Props**:
- `cards`: Card[]
- `maxVisible`: number (default: 10)
- `spread`: boolean (show fan effect)
**Behavior**: Cards overlap, last card fully visible

### PlayerHand
**Purpose**: Display player's complete hand of cards
**Used on**: Game screen (bottom)
**Props**:
- `cards`: Card[]
- `currentPlayerId`: string
- `onCardClick`: (card: Card, index: number) => void
- `selectedIndices`: number[]
- `selectable`: boolean
**Behavior**: Horizontal scroll on mobile, cards clickable when your turn

### PlayerPanel
**Purpose**: Show player info (name, cards, status)
**Used on**: Game screen (4 positions around table)
**Props**:
- `player`: { id: string, name: string, isHost: boolean, cardCount: number }
- `isCurrentTurn`: boolean
- `position`: "top" | "bottom" | "left" | "right"
- `lastPlay`: PlayedCombination | null
**States**: 
- Default: neutral background
- Current turn: glowing green border
- Disconnected: gray overlay
**Layout**: Adapts for 2/3/4 player counts

### PlayArea
**Purpose**: Center of table showing last played cards
**Used on**: Game screen (center)
**Props**:
- `lastPlay`: PlayedCombination | null
- `canBeat`: boolean
- `passCount`: number
**States**:
- Empty: "Chọn bài để đánh" placeholder
- Has cards: Shows last played combination
- Cannot beat: Red tint, "Không thể đánh" message

### ActionBar
**Purpose**: Bottom action buttons during your turn
**Used on**: Game screen
**Props**:
- `onPlay`: () => void
- `onPass`: () => void
- `onSort`: (by: 'suit' | 'rank') => void
- `canPlay`: boolean
- `canPass`: boolean
- `playDisabled`: boolean
**Buttons**: Sort (toggles suit/rank), Đánh bài (primary green), Bỏ lượt (secondary orange)

### RoomCard
**Purpose**: Display room in lobby list
**Used on**: Lobby page
**Props**:
- `room`: { id: string, name: string, code: string, maxPlayers: number, currentPlayers: Player[] }
- `onJoin`: () => void
**States**: default, hover, full

### RoomCodeDisplay
**Purpose**: Show room code with copy functionality
**Used on**: Waiting room
**Props**:
- `code`: string (6 chars)
- `shareUrl`: string
**Behavior**: Click copy icon → clipboard + toast

### RulesModal
**Purpose**: Show game rules in modal
**Used on**: Any screen via help button [?]
**Props**: `isOpen`, `onClose`
**Sections**: Cards, Combos, Turn order, Winning

## UI Components

### Button
**Purpose**: Primary interactive element
**Variants**:
- `primary`: bg-blue-600, white text
- `secondary`: bg-gray-600, white text
- `ghost`: bg-transparent, gray text
- `danger`: bg-red-600, white text
- `success`: bg-green-600, white text
- `warning`: bg-orange-500, white text
**Sizes**: `sm` (h-8), `md` (h-10), `lg` (h-12)
**States**: default, hover, active, disabled, loading

### Input
**Purpose**: Text input field
**Props**: `value`, `onChange`, `placeholder`, `error`, `maxLength`
**States**: default, focus, error, disabled

### Modal
**Props**: `isOpen`, `onClose`, `title`, `children`, `footer`
**Variants**: `sm` (320px), `md` (400px), `lg` (500px)
**Behavior**: Backdrop click closes, Escape key closes

### Badge
**Purpose**: Status indicator
**Variants**:
- `success`: green bg ("Online", your turn)
- `warning`: yellow bg ("Waiting")
- `error`: red bg ("Disconnected")
- `info`: blue bg ("Playing")
- `default`: gray bg

### Avatar
**Purpose**: Player representation
**Props**: `name`, `src?`, `size`: 'sm' | 'md' | 'lg'
**Display**: Circular, first letter as fallback, colored by name hash

### Toast
**Purpose**: Temporary feedback notification
**Variants**: `success`, `error`, `info`, `warning`
**Behavior**: Auto-dismiss after 3s, manual dismiss

### Stack (Vertical/Horizontal)
**Purpose**: Layout helper for spacing
**Props**: `direction`: 'horizontal' | 'vertical', `gap`: spacing value
**Used by**: All container layouts internally

## Game Logic Components

### CombinationValidator
**Purpose**: Validate if selected cards form a valid combination
**Function**:
```typescript
validateCombination(cards: Card[]): CombinationType | null
isValidBeat(cards: Card[], lastPlay: PlayedCombination): boolean
```

### CardSorter
**Purpose**: Sort cards by suit or rank
**Function**:
```typescript
sortBySuit(cards: Card[]): Card[]
sortByRank(cards: Card[]): Card[]
```

### DeckManager
**Purpose**: Deck operations
**Function**:
```typescript
createDeck(): Card[]
shuffle(deck: Card[]): Card[]
deal(deck: Card[], playerCount: number): Card[][]
```

### TurnManager
**Purpose**: Manage turn order
**Function**:
```typescript
getNextTurn(currentIndex: number, playerCount: number, direction: 1 | -1): number
canPass(gameState: GameState, playerId: string): boolean
```

## Animation Specifications

| Animation | Duration | Easing | Use Case |
|----------|----------|--------|----------|
| card-deal | 300ms | ease-out | Cards dealing from deck |
| card-play | 200ms | ease-in | Card moving to play area |
| card-select | 100ms | ease | Selection ring appearing |
| toast-enter | 200ms | ease-out | Toast appearing |
| toast-exit | 150ms | ease-in | Toast disappearing |
| modal-enter | 200ms | ease-out | Modal opening |
| confetti | 3000ms | - | Victory celebration |
| turn-change | 500ms | ease-in-out | Turn indicator highlight |

## Responsive Behavior

| Component | Mobile | Tablet | Desktop |
|-----------|---------|--------|---------|
| PlayerHand | Horizontal scroll | Full width | Full width |
| Cards | sm size (48x64) | md size | lg size |
| PlayerPanels | Compact stack | Side positions | Full layout |
| ActionBar | Bottom fixed | Bottom fixed | Floating |
| Modals | Full width | Centered | Centered |
