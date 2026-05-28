# Tiến Lên Miền Nam — Technical Plan

> **Status**: Draft | Created: 2026-05-29 | Last Updated: 2026-05-29
> **C4 Level**: 1 — Context Overview

## 1. Game Overview

### 1.1 Game Concept
Tiến Lên Miền Nam is a fast-paced Vietnamese shedding card game for 2-4 players. Each player receives 13 cards from a standard 52-card deck, and players take turns playing valid card combinations. The first player to empty their hand wins. The game combines strategic hand management with real-time multiplayer excitement.

### 1.2 Game Type
- **Genre**: Card game / Shedding / Strategy
- **Platform**: Web browser (desktop primary, mobile responsive)
- **Session Length**: Quick 5-15 minute games
- **Multiplayer Model**: Real-time multiplayer via rooms with WebSocket communication
- **Account Required**: No — anonymous play supported via UUID in localStorage

### 1.3 Target Audience
- Vietnamese diaspora wanting to play a culturally familiar game online
- Card game enthusiasts seeking quick strategic gameplay
- Friends and family playing remotely via shareable room links
- Casual players who enjoy strategic card games on mobile

## 2. System Context (C4 L1)

### 2.1 User Interactions
```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Desktop     │  │ Mobile       │  │ Future: Admin       │  │
│  │ Browser     │  │ Browser      │  │ Dashboard           │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼──────────────────────┼─────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│              TIẾN LÊN MIỀN NAM                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Web Frontend: Next.js 14 (App Router)               │   │
│  │ - Lobby page (static, SEO-optimized)                │   │
│  │ - Game room page (client-side rendering)             │   │
│  │ - Card components with suit/rank rendering          │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                                │
│  ┌──────────────────────────▼──────────────────────────┐   │
│  │ API Backend: FastAPI (Python)                        │   │
│  │ - Room management (CRUD)                            │   │
│  │ - Game logic & rule validation                      │   │
│  │ - WebSocket for real-time card updates              │   │
│  │ - Move history tracking                             │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                                │
│  ┌──────────────────────────▼──────────────────────────┐   │
│  │ Database: MongoDB Atlas (10.60.184.61:27017)        │   │
│  │ - rooms collection (lobby, public/private)           │   │
│  │ - games collection (game state, moves)               │   │
│  │ - players collection (stats, identity)              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 External System Integrations
| External System | Purpose | Integration Method |
|-----------------|---------|-------------------|
| MongoDB Atlas | Persistent game data, room state | pymongo Motor (async) |
| Vercel | Frontend and Backend hosting | Auto-deploy on git push |
| GitHub | Source code repository | Git push for deployment |

### 2.3 Data Flow Overview
1. User opens URL → Vercel serves Next.js app
2. User creates/joins room → API call to FastAPI → MongoDB
3. Host starts game → Cards dealt, game state created
4. Real-time updates → WebSocket broadcasts card plays
5. Player plays a card → API validates → broadcast to all players
6. Game ends → Result saved → Shown to all players

### 2.4 Key Non-Functional Requirements
- **Performance**: First contentful paint < 2s, time to interactive < 3s
- **Scalability**: Support 100 concurrent games (50 pairs of players)
- **Availability**: 99.5% uptime (Vercel SLA)
- **Data Persistence**: All game data persists across sessions
- **Mobile Support**: Full gameplay at 375px viewport
- **Real-time Latency**: WebSocket updates < 100ms

## 3. Technology Stack Summary

| Layer | Technology | Version | Notes |
|-------|-----------|--------|-------|
| Frontend Framework | Next.js | <wireguard@14+ | App Router, Server Components |
| Backend Framework | FastAPI | 0.100+ | Python async |
| Language (FE) | TypeScript | 5.x | Strict mode |
| Language (BE) | Python | 3.11+ | Type hints, async/await |
| Styling | Tailwind CSS | 3.x | Mobile-first responsive |
| Database | MongoDB | Latest | Motor async driver |
| DB Host | MongoDB Atlas | 10.60.184.61:27017 | Specified instance |
| Runtime | Bun | Latest | Monorepo package manager |
| Hosting | Vercel | — | Serverless functions |
| WebSocket | FastAPI WebSocket | — | Real-time communication |

## 4. Security Considerations
- Anonymous player IDs (UUID v4) — no PII stored
- No authentication required for core gameplay
- Input validation on all API endpoints with Pydantic
- Rate limiting on API routes
- Room codes are random 6-character alphanumeric

## 5. Cost Projection (Free Tier)

| Service | Free Tier Limit | Projected Usage | Buffer |
|---------|-----------------|-----------------|--------|
| Vercel | 100GB bandwidth/mo | ~5GB (100 users x 50MB) | OK |
| MongoDB Atlas | External host | Provided instance | N/A |
| GitHub | Unlimited | ~10K req/day | OK |

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| WebSocket disconnections | Medium | Medium | Auto-reconnect with exponential backoff |
| Concurrent game limit | Low | Medium | Implement game room limits |
| Invalid card combinations | Low | High | Strict validation on API |
| Player drops mid-game | Medium | Medium | 30-second timeout, auto-pass |

## 7. Card Game Specific Rules

### 7.1 Valid Combinations
| Type | Description | Example |
|------|-------------|---------|
| Single | One card | 7♠ |
| Pair | Two cards same rank | 5♥ 5♦ |
| Triple | Three cards same rank | J♠ J♥ J♦ |
| Straight | 3+ consecutive cards, same suit | 3♥ 4♥ 5♥ |
| Full House | Triple + Pair | 9♠ 9♥ 9♦ + 4♣ 4♦ |
| Bomb | Four of a kind | K♠ K♥ K♦ K♣ |

### 7.2 Rank Hierarchy
3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2

### 7.3 Combo Beating Rules
- Single beats single (higher rank wins)
- Pair beats pair (higher rank wins)
- Triple beats triple (higher rank wins)
- Straight beats straight (longer wins, same length = higher last card)
- Full House beats Full House (triple rank wins)
- Bomb beats all non-bomb combinations
- Bomb beats Bomb (higher rank wins, four 2s is highest)

### 7.4 Special Rules
- **First play**: Must play 3♦ or contain 3♦ (passing is allowed first turn only)
- **Passing**: Can only pass if cannot beat current combination
- **Last card**: Must announce "Bao" (empty) when playing last card
- **Winning**: First to empty hand wins
