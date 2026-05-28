# Lobby Screen

**Route**: `/`
**Purpose**: Entry point where players create or join rooms

## Layout (Desktop)

```
┌──────────────────────────────────────────────────────────┐
│  🃏 TIẾN LÊN MIỀN NAM                      [?] Trợ giúp  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Chào mừng đến với Tiến Lên!             │   │
│  │           Làm bạn tôi trong một ván bài?           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │               │  │               │  │             │  │
│  │  🎴 TẠO PHÒNG │  │  📋 DANH SÁCH │  │  🔗 THAM GIA│  │
│  │     MỚI      │  │     PHÒNG    │  │  BẰNG MÃ   │  │
│  │               │  │               │  │             │  │
│  └───────────────┘  └───────────────┘  └─────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │            PHÒ NG ĐANG CHỜ (2)                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ 🏠 Phòng của Minh           2/4 người [Tham   │  │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ 🏠 Phòng của Lan             3/4 người [Tham   │  │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Layout (Mobile 375px)

```
┌─────────────────────────┐
│ 🃏 TIẾN LÊN    [?]     │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │  Chào mừng đến   │  │
│  │  Tiến Lên!       │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   🎴 TẠO PHÒNG   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   📋 DANH SÁCH   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   🔗 THAM GIA    │  │
│  └───────────────────┘  │
│                         │
│  ── Phòng đang chờ ──  │
│                         │
│  ┌───────────────────┐  │
│  │ Minh · 2/4  [Jo]  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Lan · 3/4  [Jo]   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## Elements

| Element | Description | Behavior |
|---------|-------------|----------|
| Logo | Game title with card icon | Static |
| Help button [?] | Opens rules modal | Click → modal with rules |
| Create Room button | Large primary CTA | Click → create room modal |
| Browse Rooms button | Secondary button | Scrolls to room list |
| Join by Code button | Secondary button | Click → code input modal |
| Room Card | Card showing room info | Click → join room |
| Room list | List of public waiting rooms | Auto-refreshes every 5s |

## States

### Default
- Room list shows all public "lobby" status rooms
- Cards are clickable and show hover state

### Loading
- Skeleton loader for room cards while fetching
- Buttons show spinner on action

### Empty
- "Chưa có phòng nào" message
- Prominent "Tạo phòng mới" CTA

### Error
- Toast notification "Không thể tải danh sách phòng"
- Retry button

## Create Room Modal

| Field | Type | Default |
|-------|------|---------|
| Tên phòng | text input | "Phòng của {playerName}" |
| Riêng tư | checkbox | unchecked (public) |
| Số người | dropdown | 4 (max 4) |

## Join by Code Modal

| Field | Type | Validation |
|-------|------|------------|
| Mã phòng | text input (6 chars) | uppercase, alphanumeric |

## Key Interactions

1. **Click "Tạo phòng mới"**:
   - Modal opens
   - Enter name (or accept default)
   - Click "Tạo phòng"
   - Redirect to waiting room with new code

2. **Click room card "Tham gia"**:
   - Immediately joins room
   - Redirect to waiting room

3. **Enter room code and click "Tham gia"**:
   - Validates code format
   - If room exists and has space → join
   - If full → error toast "Phòng đã đầy"
   - If not found → error toast "Mã phòng không đúng"
