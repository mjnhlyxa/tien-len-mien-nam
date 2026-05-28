# Tiến Lên Miền Nam — Implementation Milestones

> **C4 Level**: 3 — Milestones & Phases

## Phase 1: Foundation & Core Game (Week 1-2)

**Goal**: Working local multiplayer with correct game rules

### 1.1 Project Setup
- [x] Create Bun monorepo structure
- [x] Set up Next.js 14 in apps/web
- [x] Set up FastAPI in apps/api
- [x] Configure MongoDB connection
- [x] Configure Tailwind CSS
- [x] Set up TypeScript configs

### 1.2 Card & Deck Engine
- [ ] Implement Card type and suit/rank system
- [ ] Implement Deck creation and shuffle
- [ ] Implement 13-card dealing
- [ ] Write unit tests for deck operations

### 1.3 Game Rules Engine
- [ ] Implement combination validation (single, pair, triple, straight, full_house, bomb)
- [ ] Implement rank comparison
- [ ] Implement "must play 3♦ first" rule
- [ ] Implement turn validation
- [ ] Implement win detection
- [ ] Write comprehensive unit tests

### 1.4 Basic UI
- [ ] Create Card component
- [ ] Create game board layout
- [ ] Create player hand display
- [ ] Create play area
- [ ] Implement card selection
- [ ] Implement sortable hand (by suit/rank)

**Milestone Checkpoint**: Players can play local hot-seat game with correct rules

## Phase 2: Room System & Multiplayer (Week 3-4)

**Goal**: Room creation, joining, and game start

### 2.1 Room Management (API)
- [ ] Create Room model
- [ ] Implement room CRUD endpoints
- [ ] Implement 6-char room code generation
- [ ] Add room status tracking

### 2.2 Room Management (UI)
- [ ] Create lobby page
- [ ] Create room listing
- [ ] Create room creation modal
- [ ] Create room joining modal
- [ ] Implement room code sharing

### 2.3 Game Start
- [ ] Implement deal on game start
- [ ] Sync game state to all players
- [ ] Implement player turn rotation

**Milestone Checkpoint**: 2-4 players can create rooms and start games together

## Phase 3: Real-time Gameplay (Week 5-6)

**Goal**: Live card play with WebSocket updates

### 3.1 WebSocket Integration
- [ ] Implement WebSocket connection
- [ ] Implement reconnection with exponential backoff
- [ ] Implement heartbeat/ping
- [ ] Implement game state sync events

### 3.2 Game Actions
- [ ] Implement card play via WebSocket
- [ ] Implement pass turn via WebSocket
- [ ] Implement invalid play rejection
- [ ] Implement turn timeout (30s auto-pass)

### 3.3 Real-time UI Updates
- [ ] Update hand on card play
- [ ] Update play area on new play
- [ ] Update player card counts
- [ ] Show turn indicator changes

**Milestone Checkpoint**: Live multiplayer game with real-time updates under 100ms latency

## Phase 4: Game Completion & Polish (Week 7-8)

**Goal**: Full game flow with victory and rematch

### 4.1 Win Detection
- [ ] Implement "empty hand" win detection
- [ ] Implement "bao" (last card) notification
- [ ] Broadcast game_over via WebSocket
- [ ] Show victory modal with stats

### 4.2 Post-Game
- [ ] Implement rematch request
- [ ] Implement new game with same players
- [ ] Implement leave room
- [ ] Return to lobby

### 4.3 Polish
- [ ] Add card animations
- [ ] Add sound effects (optional)
- [ ] Add loading states
- [ ] Add error toasts
- [ ] Mobile optimization

**Milestone Checkpoint**: Complete playable game from lobby to victory

## Phase 5: Production Ready (Week 9+)

**Goal**: Deployment and user experience improvements

### 5.1 Deployment
- [ ] Configure Vercel deployment
- [ ] Set up MongoDB connection for production
- [ ] Configure environment variables
- [ ] Set up GitHub Actions CI/CD
- [ ] Deploy to production URL

### 5.2 User Experience
- [ ] Add rules help modal
- [ ] Add player name editing
- [ ] Add game history (local)
- [ ] Optimize for mobile
- [ ] Add browser notification for turn (when tab hidden)

### 5.3 Post-MVP
- [ ] Chat in room
- [ ] Player avatars
- [ ] Match statistics
- [ ] Leaderboard
- [ ] AI opponent for solo practice

## Timeline Summary

```
Week 1-2: Foundation + Core Game Rules
Week 3-4: Room System + Multiplayer Setup
Week 5-6: Real-time WebSocket Gameplay
Week 7-8: Game Completion + Polish
Week 9+:  Production Deployment + UX
```

## Definition of Done

For each milestone:
1. All tests passing (unit + integration)
2. No console errors
3. Mobile responsive (375px viewport)
4. Accessible (keyboard nav + screen reader)
5. Deployed to staging environment

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| WebSocket connection issues | Medium | Medium | Fallback to polling, clear error messages |
| Rule variants (regional differences) | High | Low | Document variants, make configurable |
| Mobile card interaction | Medium | Medium | Large touch targets, minimize scroll |
| Concurrent player limit | Low | Medium | Implement queue system |
| MongoDB connection drops | Low | High | Connection pooling, retry logic |
