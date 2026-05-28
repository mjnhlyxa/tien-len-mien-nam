# Tiến Lên Miền Nam — Design System

## Colors

### Primary Palette
```css
--bg-dark: #0D1117;        /* Page background - deep navy */
--bg-surface: #161B22;     /* Card panels, modals */
--bg-elevated: #21262D;    /* Hover states, elevated elements */

--primary: #58A6FF;        /* Primary buttons, links */
--primary-hover: #79B8FF;  /* Button hover */
--primary-muted: #388BFD26; /* Primary backgrounds */

--accent-green: #3FB950;    /* Win, success, your turn */
--accent-red: #F85149;     /* Loss, error, opponent */
--accent-gold: #D29922;    /* Bombs, special cards */
--accent-purple: #A371F7;  /* VIP, stats */
```

### Card Colors
```css
--card-hearts: #E53935;    /* ♥ Red hearts */
--card-diamonds: #E53935;  /* ♦ Red diamonds */
--card-clubs: #1A1A2E;     /* ♣ Black clubs */
--card-spades: #1A1A2E;    /* ♠ Black spades */

--card-back: #1E3A5F;      /* Card back - navy blue */
--card-back-pattern: #2D5A87; /* Card back pattern */
```

### Game Table
```css
--table-felt: #1B5E20;     /* Traditional green felt */
--table-border: #2E7D32;  /* Table edge */
--table-shadow: #0D111780; /* Table shadow */
```

### Text Colors
```css
--text-primary: #F0F6FC;   /* Main text */
--text-secondary: #8B949E; /* Secondary text */
--text-muted: #484F58;     /* Disabled, hints */
--text-inverse: #0D1117;   /* Text on light backgrounds */
```

### Status Colors
```css
--status-online: #3FB950;  /* Connected */
--status-offline: #6E7681; /* Disconnected */
--status-waiting: #D29922; /* Waiting state */
--status-turn: #58A6FF;    /* Current turn indicator */
```

## Typography

### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Outfit', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px - badges, hints */
--text-sm: 0.875rem;   /* 14px - secondary text */
--text-base: 1rem;     /* 16px - body text */
--text-lg: 1.125rem;    /* 18px - card rank */
--text-xl: 1.25rem;     /* 20px - section headers */
--text-2xl: 1.5rem;     /* 24px - page titles */
--text-3xl: 1.875rem;   /* 30px - modal headers */
--text-4xl: 2.25rem;     /* 36px - victory text */
--text-5xl: 3rem;         /* 48px - hero numbers */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Spacing System (4px base)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

## Border Radius
```css
--radius-sm: 4px;        /* Badges, small elements */
--radius-md: 8px;        /* Cards, inputs, buttons */
--radius-lg: 12px;       /* Modals, large panels */
--radius-xl: 16px;       /* Special containers */
--radius-full: 9999px;   /* Avatars, pills */
```

## Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 8px rgba(0,0,0,0.4);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
--shadow-card: 0 2px 8px rgba(0,0,0,0.3);
--shadow-modal: 0 16px 48px rgba(0,0,0,0.6);
--shadow-glow-green: 0 0 20px rgba(63,185,80,0.4);
--shadow-glow-blue: 0 0 20px rgba(88,166,255,0.4);
```

## Breakpoints
```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

## Card Component Sizes
```css
--card-sm-width: 48px;
--card-sm-height: 64px;
--card-md-width: 64px;
--card-md-height: 96px;
--card-lg-width: 80px;
--card-lg-height: 120px;
```

## Animations
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
--transition-bounce: 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Z-Index Scale
```css
--z-base: 0;
--z-cards: 10;
--z-play-area: 20;
--z-player-hand: 30;
--z-modals: 100;
--z-toast: 200;
```

## Component Tokens

### Button
```css
--btn-height-sm: 32px;
--btn-height-md: 40px;
--btn-height-lg: 48px;
--btn-padding-x-sm: 12px;
--btn-padding-x-md: 16px;
--btn-padding-x-lg: 24px;
```

### Input
```css
--input-height: 40px;
--input-padding: 12px;
--input-border: 1px solid #30363D;
--input-focus-ring: 2px solid var(--primary);
```

### Modal
```css
--modal-padding: 24px;
--modal-width-sm: 320px;
--modal-width-md: 400px;
--modal-width-lg: 500px;
```

## Accessibility
```css
--focus-ring: 2px solid var(--primary);
--focus-offset: 2px;
--min-touch-target: 44px;
```
