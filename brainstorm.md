# Tiến Lên Miền Nam — Brainstorm

> Status: Draft | Created: 2026-05-29

## Overview
Tiến Lên Miền Nam (Tiến Lên) is a fast-paced Vietnamese shedding card game for 2-4 players using a standard 52-card deck. Each player receives 13 cards, and the first to empty their hand wins. The game combines strategic hand management with local multiplayer - perfect for friends and family game nights.

## Game Concept
- **Genre**: Card game / Shedding / Strategy
- **Platform**: Web browser — desktop primary, mobile responsive
- **Session length**: Quick 5-15 minute games
- **Multiplayer**: Real-time local multiplayer (same device) + Online multiplayer via rooms
- **Account required**: No — anonymous play by default. Optional login for stats persistence

## Target Audience
- Vietnamese diaspora wanting to play a familiar card game online
- Card game enthusiasts looking for quick strategic gameplay
- Friends and family playing remotely
- Casual players who enjoy strategic card games

## Core Gameplay Loop
1. **Join/Start**: Player creates a room or joins an existing one via share link
2. **Deal**: System deals 13 cards to each player (2-4 players)
3. **Play**: Players take turns playing valid card combinations
4. **Beat**: Must play higher rank or same combo type to beat previous play
5. **Pass**: Can pass if cannot or choose not to beat
6. **Win**: First player to empty their hand wins the round

## Features

### Must-Have (MVP)
- **Card Deck**: Standard 52-card deck with 4 suits ( hearts, diamonds, clubs, spades) and ranks 3-2-A
- **Card Dealing**: Automatic deal of 13 cards per player
- **Valid Combinations**:
  - Single card
  - Pair (2 cards same rank)
  - Triple (3 cards same rank)
  - Straight (3+ consecutive cards, same suit)
  - Full House (3 of a kind + a pair)
  - Four of a Kind (BOMB - beats everything except higher bomb)
- **Turn System**: Valid play must match or beat previous combination type and rank
- **Pass Mechanism**: Player can skip turn if cannot beat
- **Win Detection**: First to empty hand triggers victory
- **Room System**: Create/join rooms with shareable codes
- **Responsive UI**: Playable on desktop and mobile

### Nice-to-Have (Post-MVP)
- Chat in-room
- Player Avatars
- Match history and stats
- Leaderboards
- Sound effects and card animations
- AI opponent for solo practice
- Card sorting (by suit or rank)

### Out of Scope
- Multi-deck support (always single deck)
- Tournament mode (MVP only)
- Real-money stakes

## User Experience Goals
- **Time to first game**: Target < 15 seconds from landing to first game. No signup required.
- **Onboarding**: Quick in-game rules tooltips shown on first play. Rules accessible via help button.
- **Mobile**: Fully playable on phone screen, cards sized for touch
- **Accessibility**: Cards color-coded by suit, keyboard shortcuts for desktop

## Social & Virality Features
- Share link for room invitation
- Public lobby to browse available rooms
- Room chat (post-MVP)

## Data to Persist
- **Room State**: Room ID, players, current game state, cards in hand
- **Game State**: Cards dealt, play history, current turn, remaining cards
- **Move History**: All plays in a game for replay
- **Match History**: Past games per anonymous ID
- **Player Identity**: Anonymous ID in localStorage

## Technical Feasibility Assessment

### Straightforward
- Card deck representation and shuffling
- Valid combination detection (single, pair, triple, straight, full house)
- Turn-based play logic
- Pass mechanism
- Win detection
- Local multiplayer (same device)

### Complex or Risky
- **Online Multiplayer Real-time Sync**: WebSocket communication for live card updates across players in different locations
- **Room State Management**: Synchronizing room creation, join, leave, start game
- **Rule Validation**: Ensuring plays are valid (combo type + rank comparison)
- **Disconnect Handling**: Player drops mid-game

### Open Questions
- Should "2 pairs" combination be valid? (varies by region)
- Are straights required to be 3+ cards or 5+? (depends on variant)
- Does 2 beat Ace in straight? (Ace can be high or low)
- Simultaneous completion handling in 4-player game

## Competitive Landscape
- **Zing Play Tiến Lên**: Popular Vietnamese online version - our version differs by being browser-based with no download required
- **Card.com**: General card games - lacks Tiến Lên specific rules
- **Our Differentiation**: Instant play (no account required), modern UI, mobile-first design, room sharing

## Tech Stack
- **Frontend**: Next.js 14 (App Router) with React
- **Backend**: FastAPI (Python) for game logic and WebSocket
- **Database**: MongoDB for room state and game history
- **Runtime**: Bun
- **Deployment**: Vercel (frontend + API)
