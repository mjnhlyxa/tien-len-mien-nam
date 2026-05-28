# Acceptance Criteria — Tiến Lên Miền Nam

> **Status**: Draft | Created: 2026-05-29 | Based on: plan/ + design/
> **Format**: Given-When-Then (BDD)
> **Total ACs**: 67

---

## Table of Contents
1. [Anonymous Identity](#1-anonymous-identity)
2. [Room Management](#2-room-management)
3. [Game Setup & Card Dealing](#3-game-setup--card-dealing)
4. [Valid Card Combinations](#4-valid-card-combinations)
5. [Turn-Based Play](#5-turn-based-play)
6. [Pass Mechanics](#6-pass-mechanics)
7. [Win Detection](#7-win-detection)
8. [Real-time Updates](#8-real-time-updates)
9. [Mobile Experience](#9-mobile-experience)
10. [Error Handling](#10-error-handling)
11. [Data Persistence](#11-data-persistence)

---

## 1. Anonymous Identity

### AC-ID-001: Anonymous player ID is generated on first visit
**Given**: Player opens the game for the first time (no localStorage data)
**When**: The game page loads
**Then**: A unique UUID (v4) is generated and stored in localStorage as `playerId`

### AC-ID-002: Player ID persists across page reloads
**Given**: Player has a `playerId` in localStorage
**When**: Player reloads the page or opens a new browser tab
**Then**: The same `playerId` is retrieved from localStorage and used

### AC-ID-003: Default player name is "Anonymous"
**Given**: Player has no name set in localStorage
**When**: Player joins a room or creates a room
**Then**: The player name displays as "Anonymous" by default

### AC-ID-004: Player name is editable
**Given**: Player is in a room waiting for game start
**When**: Player clicks on their name and edits it
**Then**: The new name is saved to localStorage and shown to other players

---

## 2. Room Management

### AC-ROOM-001: Player can create a public room
**Given**: Player is on the lobby page
**When**: Player clicks "Tạo phòng" and enters "Phòng Test"
**Then**: A new public room named "Phòng Test" is created, a 6-character room code is generated, and the share link is shown

### AC-ROOM-002: Room name is required
**Given**: Player is on the lobby page and opens the "Create Room" dialog
**When**: Player clicks "Tạo phòng" without entering a room name
**Then**: An error message "Vui lòng nhập tên phòng" appears, and no room is created

### AC-ROOM-003: Room name has max length of 50 characters
**Given**: Player is creating a room and enters a name longer than 50 characters
**When**: Player attempts to create the room
**Then**: The system rejects input beyond 50 characters and shows error

### AC-ROOM-004: Private room does not appear in public list
**Given**: Player creates a new room with "Private" checkbox selected
**When**: Other players view the public room list
**Then**: The private room is NOT visible in the public rooms list

### AC-ROOM-005: Player can join room via share link
**Given**: Player 1 created a room with code "ABC123" and shared the link
**When**: Player 2 opens the share link `/room/ABC123`
**Then**: Player 2 joins the room and sees the waiting room with current players

### AC-ROOM-006: Room shows correct player count
**Given**: A room with maxPlayers=4 has 2 players who have joined
**When**: The room list or waiting room updates
**Then**: The room shows "2/4 người chơi"

### AC-ROOM-007: Room code is exactly 6 alphanumeric characters
**Given**: Player creates a new room
**When**: The room is created
**Then**: The room code is exactly 6 uppercase alphanumeric characters (A-Z, 0-9)

### AC-ROOM-008: Player can copy room code to clipboard
**Given**: Player is in the waiting room
**When**: Player clicks the copy button next to the room code
**Then**: The room code is copied to clipboard and toast "Đã sao chép mã phòng" appears

### AC-ROOM-009: Player can leave room before game starts
**Given**: Player is in a waiting room (game not started)
**When**: Player clicks "Rời phòng"
**Then**: Player is removed from the room and redirected to the lobby

### AC-ROOM-010: Room status changes to "full" when max players reached
**Given**: A room with maxPlayers=4 has 3 players
**When**: The 4th player joins
**Then**: The room status changes to "full" and no more players can join

### AC-ROOM-011: Host can start game with minimum 2 players
**Given**: A room has 2 or more players in the waiting room
**When**: The host clicks "Bắt đầu"
**Then**: The game starts, cards are dealt, and all players see the game screen

### AC-ROOM-012: Non-host cannot start game
**Given**: A room has a non-host player
**When**: The non-host player tries to click "Bắt đầu"
**Then**: The "Bắt đầu" button is not visible or disabled for non-host players

### AC-ROOM-013: Start button disabled with less than 2 players
**Given**: A room has 1 player (the host)
**When**: The host views the waiting room
**Then**: The "Bắt đầu" button is disabled with helper text "(Cần ít nhất 2 người chơi)"

---

## 3. Game Setup & Card Dealing

### AC-GAME-001: Each player receives exactly 13 cards
**Given**: A game is starting with 4 players
**When**: The game begins (host clicks "Bắt đầu")
**Then**: Each player receives exactly 13 cards from a standard 52-card deck

### AC-GAME-002: First player to play must have 3♦ or a card containing it
**Given**: A new round begins and it's Player A's turn
**When**: Player A attempts to play cards
**Then**: The system validates that Player A has the 3♦ or at least one card that includes 3♦ in their combination

### AC-GAME-003: Player without 3♦ plays their lowest valid card
**Given**: Player A does not have the 3♦ in their hand
**When**: It's Player A's turn in the first round
**Then**: Player A must play their lowest valid combination

### AC-GAME-004: Deck uses standard 52 cards
**Given**: A new game starts
**When**: The deck is created
**Then**: The deck contains exactly 52 unique cards: 4 suits × 13 ranks (3,4,5,6,7,8,9,10,J,Q,K,A,2)

### AC-GAME-005: Cards are dealt randomly (shuffled)
**Given**: A game is starting
**When**: cards are dealt to players
**Then**: The card distribution is random (different each game)

### AC-GAME-006: Player sees only their own cards
**Given**: Player is in an active game
**When**: Player views the game screen
**Then**: Each player sees their 13 cards face-up, but opponents' cards are face-down showing only card count

### AC-GAME-007: Remaining deck is not used during gameplay
**Given**: A game is in progress
**When**: Cards are dealt
**Then**: The remaining cards (after dealing 13×N cards) are set aside and not used

---

## 4. Valid Card Combinations

### AC-COMBO-001: Single card is a valid combination
**Given**: Player has a card in hand
**When**: Player selects exactly 1 card and plays it
**Then**: The system validates this as a valid "single" combination

### AC-COMBO-002: Pair (2 cards same rank) is valid
**Given**: Player has two 7s in hand (e.g., 7♥ and 7♠)
**When**: Player selects both 7s and plays them
**Then**: The system validates this as a valid "pair" combination

### AC-COMBO-003: Pair fails if ranks don't match
**Given**: Player has 7♥ and 8♠ in hand
**When**: Player selects these two cards as a pair
**Then**: The system rejects this as an invalid pair combination

### AC-COMBO-004: Triple (3 cards same rank) is valid
**Given**: Player has three Kings in hand (K♥, K♠, K♦)
**When**: Player selects all three Kings and plays them
**Then**: The system validates this as a valid "triple" combination

### AC-COMBO-005: Triple fails if ranks don't match
**Given**: Player has K♥, K♠, and Q♦ in hand
**When**: Player tries to play these as a triple
**Then**: The system rejects this as an invalid triple combination

### AC-COMBO-006: Straight (3+ consecutive cards, same suit) is valid
**Given**: Player has 5♥, 6♥, 7♥, 8♥ (same suit, consecutive ranks)
**When**: Player selects these 4 cards and plays them
**Then**: The system validates this as a valid "straight" combination

### AC-COMBO-007: Straight fails if cards are not same suit
**Given**: Player has 5♥, 6♠, 7♥ in hand (mixed suits)
**When**: Player tries to play these as a straight
**Then**: The system rejects this as an invalid straight (must be same suit)

### AC-COMBO-008: Straight fails if ranks not consecutive
**Given**: Player has 5♥, 7♥, 8♥ in hand (skipping 6)
**When**: Player tries to play these as a straight
**Then**: The system rejects this as an invalid straight (must be consecutive)

### AC-COMBO-009: Straight longer than 3 cards
**Given**: Player has 3♥, 4♥, 5♥, 6♥, 7♥ (5-card straight)
**When**: Player plays this straight
**Then**: The system validates it as a valid 5-card straight

### AC-COMBO-010: Full House (3 of a kind + pair) is valid
**Given**: Player has three 9s and two 4s
**When**: Player plays this combination
**Then**: The system validates this as a valid "full house" (9s over 4s)

### AC-COMBO-011: Full House validation (correct counts)
**Given**: Player has three 9s, one 4, and one 7
**When**: Player tries to play these as a full house
**Then**: The system rejects this as an invalid full house (must be exactly 3+2)

### AC-COMBO-012: Bomb (4 of a kind) is valid
**Given**: Player has all four Kings (K♥, K♠, K♦, K♣)
**When**: Player plays this combination
**Then**: The system validates this as a valid "bomb" combination

### AC-COMBO-013: Bomb beats all non-bomb combinations
**Given**: Last play was a pair of Aces, Player has a bomb (four 9s)
**When**: Player plays the bomb
**Then**: The bomb beats the pair of Aces, regardless of rank

### AC-COMBO-014: Higher bomb beats lower bomb
**Given**: Player A played four 9s, Player B has four Kings
**When**: Player B plays the bomb of Kings
**Then**: The Kings bomb beats the 9s bomb

### AC-COMBO-015: Double 2 is the highest bomb
**Given**: Player has four 2s
**When**: Player plays this combination
**Then**: This is the highest possible bomb in the game

### AC-COMBO-016: Straight Ace-King-2 is invalid
**Given**: Player has A, K, 2 of the same suit
**When**: Player tries to play these as a straight
**Then**: The system rejects this (Ace can only be high in straight, not low)

### AC-COMBO-017: Cards not in hand are rejected
**Given**: Player does not have Queen of Hearts in hand
**When**: Player tries to play Queen of Hearts
**Then**: The system rejects the play with error "Bạn không có lá bài này"

---

## 5. Turn-Based Play

### AC-TURN-001: Only current player can play
**Given**: It's Player A's turn
**When**: Player B (not current) tries to play cards
**Then**: The system rejects with error "Chưa đến lượt bạn"

### AC-TURN-002: Player can beat previous combination
**Given**: Last play was pair of 7s, Player A has a pair of 9s
**When**: Player A plays the direct higher pair of 9s
**Then**: The play is accepted as valid beat

### AC-TURN-003: Player must beat with same combo type
**Given**: Last play was a straight of 4 cards
**When**: Player tries to beat with a pair
**Then**: The system rejects with error "Phải đánh cùng loại bộ"

### AC-TURN-004: Rank comparison within same combo type
**Given**: Last play was triple of Jacks, Player has triple of Queens
**When**: Player plays triple of Queens
**Then**: Queens beats Jacks (higher rank wins)

### AC-TURN-005: Straight length beats rank in tie
**Given**: Last play was 4-card straight 5-6-7-8, Player has 5-card straight 5-6-7-8-9
**When**: Player plays the 5-card straight
**Then**: The 5-card straight beats the 4-card straight (longer wins)

### AC-TURN-006: Turn passes to next player after valid play
**Given**: It's Player A's turn and they play valid cards
**When**: The play is accepted
**Then**: Turn changes to the next player in clockwise order

### AC-TURN-007: Player cannot play lower combination
**Given**: Last play was pair of Kings
**When**: Player tries to play a pair of 5s
**Then**: The system rejects with error "Bộ bài không đủ mạnh"

### AC-TURN-008: Turn indicator shows correct player
**Given**: It's Player B's turn
**When**: All players view the game
**Then**: The turn indicator shows "Lượt: [Player B name]"

---

## 6. Pass Mechanics

### AC-PASS-001: Player can pass after first round
**Given**: The first round has completed (all players played or passed once)
**When**: Player cannot beat the current combination
**Then**: Player can click "Bỏ lượt" to pass

### AC-PASS-002: Cannot pass in first round (no last play to beat)
**Given**: This is the first round with no previous play
**When**: Player tries to click "Bỏ lượt"
**Then**: The "Bỏ lượt" button is disabled, player must play

### AC-PASS-003: Three consecutive passes clear the play area
**Given**: Three players have consecutively passed
**When**: The 4th player also passes
**Then**: All players are free to play new combinations, the play area clears

### AC-PASS-004: Pass count is displayed
**Given**: Players are passing in a round
**When**: Players pass their turns
**Then**: The pass count is visible (e.g., "Đã bỏ: 2 lượt")

### AC-PASS-005: Passing shows toast notification
**Given**: It's Player A's turn and they pass
**When**: The pass is registered
**Then**: Toast notification "Đã bỏ lượt" appears for all players

### AC-PASS-006: Cannot pass if you have a valid beat
**Given**: Player has a combination that could beat the last play
**When**: Player tries to pass
**Then**: The system shows "Bạn có thể đánh bài, không thể bỏ lượt"

---

## 7. Win Detection

### AC-WIN-001: Empty hand triggers win
**Given**: Player plays their last card
**When**: The card play is accepted and player's hand becomes empty
**Then**: Game ends immediately, winner is announced

### AC-WIN-002: Winner sees victory screen
**Given**: Player X wins by emptying their hand
**When**: The game ends
**Then**: Player X sees "Chiến thắng!" with confetti animation

### AC-WIN-003: Other players see defeat screen
**Given**: Player X wins the game
**When**: Game ends
**Then**: Other players see "Kết thúc! [Player X] đã về nhất"

### AC-WIN-004: Win detection is immediate (no turn delay)
**Given**: Player plays their last remaining card
**When**: The play is validated
**Then**: Game ends in the same response, no waiting for other players

### AC-WIN-005: Game result shows stats
**Given**: Game ends with a winner
**When**: The result screen displays
**Then**: Stats shown include: Total turns, Total time, Cards played by winner

### AC-WIN-006: Rematch option available after game ends
**Given**: Game has ended
**When**: Winner or any player clicks "Chơi lại"
**Then**: A new game starts with the same players in the same room

### AC-WIN-007: Leave option returns to lobby
**Given**: Game has ended
**When**: Any player clicks "Thoát"
**Then**: Player leaves the room and returns to the lobby

---

## 8. Real-time Updates

### AC-REALTIME-001: Opponent's play appears within 3 seconds
**Given**: Player A and Player B are in an active game
**When**: Player A plays cards
**Then**: Player B sees the updated play area within 3 seconds

### AC-REALTIME-002: WebSocket connection established on game load
**Given**: Player opens the game page
**When**: The page finishes loading
**Then**: WebSocket connection is established to receive real-time updates

### AC-REALTIME-003: Reconnection preserves game state
**Given**: Player loses connection and reconnects within 60s
**When**: Player reconnects
**Then**: Current game state is restored and displayed

### AC-REALTIME-004: Disconnected player shows offline indicator
**Given**: Player A loses connection (no response for 30s)
**When**: Disconnect is detected
**Then**: Other players see an offline indicator next to Player A's name

### AC-REALTIME-005: Auto-pass after 30 second timeout
**Given**: It's Player A's turn and they take no action for 30 seconds
**When**: The timeout expires
**Then**: Player A's turn is automatically passed

### AC-REALTIME-006: Reconnect allows resume within 60 seconds
**Given**: Player A was marked disconnected
**When**: Player A reconnects within 60 seconds
**Then**: Player A can resume playing, their cards are preserved

---

## 9. Mobile Experience

### AC-MOBILE-001: Game is playable at 375px viewport width
**Given**: Player opens the game on a mobile device (375px width)
**When**: Player plays through the full game flow
**Then**: No horizontal scrolling is required, all elements fit on screen

### AC-MOBILE-002: Touch targets are at least 44×44px
**Given**: Player is on a mobile device
**When**: Player taps buttons or cards
**Then**: All interactive elements are at least 44×44px in size

### AC-MOBILE-003: Cards are scrollable in hand on mobile
**Given**: Player has 13 cards and is on mobile
**When**: Player views their hand
**Then**: Cards are displayed in a horizontally scrollable area

### AC-MOBILE-004: Action buttons are fixed at bottom on mobile
**Given**: Player is on a mobile device during their turn
**When**: Player scrolls the game view
**Then**: Action buttons (Đánh bài, Bỏ lượt) remain visible at the bottom fixed position

### AC-MOBILE-005: No hover-only interactions exist
**Given**: Player is using a touch device (mobile)
**When**: Player interacts with any element
**Then**: All interactions work via tap/click, not requiring hover

### AC-MOBILE-006: Font sizes are legible on mobile
**Given**: Player is on a 375px mobile device
**When**: Player reads game UI text
**Then**: All text is at least 14px and clearly legible

---

## 10. Error Handling

### AC-ERROR-001: Invalid room code shows appropriate message
**Given**: Player opens a link to a non-existent room with code "XXXXXX"
**When**: The system tries to load the room
**Then**: Message "Phòng không tồn tại hoặc đã bị xóa" appears with option to return to lobby

### AC-ERROR-002: Room full rejection
**Given**: A room is already at max capacity (4 players)
**When**: A new player tries to join
**Then**: Message "Phòng đã đầy" appears, player is redirected to lobby

### AC-ERROR-003: Network error shows retry option
**Given**: Player loses internet connection during a game
**When**: An API call fails
**Then**: Message "Mất kết nối. Vui lòng kiểm tra internet và thử lại" appears with retry button

### AC-ERROR-004: Loading states during async operations
**Given**: Player performs an action that requires server response (e.g., play cards)
**When**: The request is in flight
**Then**: A loading indicator is displayed on the action button

### AC-ERROR-005: Invalid combination shows clear error
**Given**: Player selects cards that don't form a valid combination
**When**: Player clicks "Đánh bài"
**Then**: Error message "Bộ bài không hợp lệ" appears, selection remains for correction

### AC-ERROR-006: Cannot play 3♦ when not in hand
**Given**: Player does not have 3♦ in hand
**When**: Player tries to play in the first round
**Then**: Error "Bạn phải đánh 3♦ hoặc lá bài chứa 3♦ trong lượt đầu tiên"

### AC-ERROR-007: Empty state for room list
**Given**: There are no public rooms available
**When**: Player views the lobby room list
**Then**: Message "Chưa có phòng nào. Tạo phòng mới để bắt đầu!" is displayed

### AC-ERROR-008: Toast notifications for actions
**Given**: Player performs various actions (copy code, join room, etc.)
**When**: Each action completes
**Then**: A toast notification confirms the result

---

## 11. Data Persistence

### AC-PERSIST-001: Player ID stored in localStorage
**Given**: Player generates a player ID
**When**: Page reloads
**Then**: Same ID is used (no regeneration)

### AC-PERSIST-002: Player name stored in localStorage
**Given**: Player sets their name to "Minh"
**When**: Page reloads
**Then**: Name is preserved as "Minh" across sessions

### AC-PERSIST-003: Room persists when players are in waiting room
**Given**: Room is in waiting state with players
**When**: Players refresh the page
**Then**: Room state is preserved and players remain in the room

### AC-PERSIST-004: Games are marked finished after completion
**Given**: A game ends with a winner
**When**: The game completes
**Then**: Game status changes to "finished" in the database

---

## AC Summary

| AC ID | Feature | Priority | Tested |
|-------|---------|----------|--------|
| AC-ID-001 | Anonymous ID generation | Must Have | No |
| AC-ID-002 | Player ID persistence | Must Have | No |
| AC-ID-003 | Default player name | Must Have | No |
| AC-ID-004 | Editable player name | Nice to Have | No |
| AC-ROOM-001 | Create public room | Must Have | No |
| AC-ROOM-002 | Room name required | Must Have | No |
| AC-ROOM-003 | Room name max length | Must Have | No |
| AC-ROOM-004 | Private room invisible | Must Have | No |
| AC-ROOM-005 | Join via share link | Must Have | No |
| AC-ROOM-006 | Player count display | Must Have | No |
| AC-ROOM-007 | Room code format | Must Have | No |
| AC-ROOM-008 | Copy room code | Must Have | No |
| AC-ROOM-009 | Leave room | Must Have | No |
| AC-ROOM-010 | Room full status | Must Have | No |
| AC-ROOM-011 | Start game (2+ players) | Must Have | No |
| AC-ROOM-012 | Non-host cannot start | Must Have | No |
| AC-ROOM-013 | Start disabled < 2 players | Must Have | No |
| AC-GAME-001 | 13 cards per player | Must Have | No |
| AC-GAME-002 | Must play 3♦ first | Must Have | No |
| AC-GAME-003 | No 3♦ plays lowest | Must Have | No |
| AC-GAME-004 | 52-card deck | Must Have | No |
| AC-GAME-005 | Shuffled deck | Must Have | No |
| AC-GAME-006 | See only own cards | Must Have | No |
| AC-GAME-007 | Deck not used | Must Have | No |
| AC-COMBO-001 | Single valid | Must Have | No |
| AC-COMBO-002 | Pair valid | Must Have | No |
| AC-COMBO-003 | Pair invalid (mismatch) | Must Have | No |
| AC-COMBO-004 | Triple valid | Must Have | No |
| AC-COMBO-005 | Triple invalid | Must Have | No |
| AC-COMBO-006 | Straight valid | Must Have | No |
| AC-COMBO-007 | Straight invalid (suit) | Must Have | No |
| AC-COMBO-008 | Straight invalid (gaps) | Must Have | No |
| AC-COMBO-009 | Straight 5+ cards | Must Have | No |
| AC-COMBO-010 | Full House valid | Must Have | No |
| AC-COMBO-011 | Full House invalid | Must Have | No |
| AC-COMBO-012 | Bomb valid | Must Have | No |
| AC-COMBO-013 | Bomb beats all | Must Have | No |
| AC-COMBO-014 | Higher bomb wins | Must Have | No |
| AC-COMBO-015 | Double 2 highest | Must Have | No |
| AC-COMBO-016 | Ace-King-2 invalid | Must Have | No |
| AC-COMBO-017 | Cards not in hand | Must Have | No |
| AC-TURN-001 | Only current player plays | Must Have | No |
| AC-TURN-002 | Beat with higher | Must Have | No |
| AC-TURN-003 | Same combo type | Must Have | No |
| AC-TURN-004 | Rank comparison | Must Have | No |
| AC-TURN-005 | Straight length wins | Must Have | No |
| AC-TURN-006 | Turn passes | Must Have | No |
| AC-TURN-007 | Cannot play lower | Must Have | No |
| AC-TURN-008 | Turn indicator | Must Have | No |
| AC-PASS-001 | Pass after first round | Must Have | No |
| AC-PASS-002 | Cannot pass first round | Must Have | No |
| AC-PASS-003 | Three passes clear | Must Have | No |
| AC-PASS-004 | Pass count displayed | Must Have | No |
| AC-PASS-005 | Pass toast | Must Have | No |
| AC-PASS-006 | Cannot pass when can beat | Must Have | No |
| AC-WIN:001 | Empty hand wins | Must Have | No |
| AC-WIN-002 | Victory screen | Must Have | No |
| AC-WIN-003 | Defeat for others | Must Have | No |
| AC-WIN-004 | Immediate win detection | Must Have | No |
| AC-WIN-005 | Stats on result | Must Have | No |
| AC-WIN-006 | Rematch option | Must Have | No |
| AC-WIN-007 | Leave to lobby | Must Have | No |
| AC-REALTIME-001 | Opponent move within 3s | Must Have | No |
| AC-REALTIME-002 | WebSocket connection | Must Have | No |
| AC-REALTIME-003 | Reconnection preserves | Must Have | No |
| AC-REALTIME-004 | Offline indicator | Must Have | No |
| AC-REALTIME-005 | 30s timeout auto-pass | Must Have | No |
| AC-REALTIME-006 | Resume within 60s | Nice to Have | No |
| AC-MOBILE-001 | 375px playable | Must Have | No |
| AC-MOBILE-002 | 44px touch targets | Must Have | No |
| AC-MOBILE-003 | Scrollable hand | Must Have | No |
| AC-MOBILE-004 | Fixed bottom buttons | Must Have | No |
| AC-MOBILE-005 | No hover-only | Must Have | No |
| AC-MOBILE-006 | Legible fonts | Must Have | No |
| AC-ERROR-001 | Invalid room code | Must Have | No |
| AC-ERROR-002 | Room full | Must Have | No |
| AC-ERROR-003 | Network error | Must Have | No |
| AC-ERROR-004 | Loading states | Must Have | No |
| AC-ERROR-005 | Invalid combo error | Must Have | No |
| AC-ERROR-006 | Missing 3♦ error | Must Have | No |
| AC-ERROR-007 | Empty room list | Must Have | No |
| AC-ERROR-008 | Toast notifications | Must Have | No |
| AC-PERSIST-001 | Player ID localStorage | Must Have | No |
| AC-PERSIST-002 | Player name localStorage | Must Have | No |
| AC-PERSIST-003 | Room state persistence | Must Have | No |
| AC-PERSIST-004 | Game finished status | Must Have | No |

---

## Notes

- **First play rule**: 3♦ or cards containing it must be played in the first turn - this ensures fair start
- **Straight Ace rule**: Ace can be high (K-A-2) but not low (A-2-3) in Tiến Lên
- **Pass timing**: Player can only pass after first round OR when they cannot beat the current play
- **Bomb hierarchy**: Four 2s > four Aces > four Kings > ... > four 3s
- **Real-time latencies**: WebSocket updates should be under 100ms on good connections, fallback to 3s polling
