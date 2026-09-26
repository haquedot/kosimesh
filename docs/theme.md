# KosiMesh — UI Theme

A minimal, modern emergency-response dashboard theme based on the approved KosiMesh UI direction.

## 1. Design Direction

- **Style:** Clean Minimal
- **Primary accent:** Orange
- **Background:** Warm off-white / white
- **Typography:** Dark charcoal
- **Cards:** White with subtle borders and very soft shadows
- **Corners:** Rounded, but not overly pill-shaped
- **Density:** Compact and information-first
- **Maps:** Keep the map visually rich while keeping the surrounding UI minimal
- **Icons:** Simple outline icons with orange accent states

---

## 2. Tailwind Color Palette

### Brand / Orange

| Token | Tailwind | Hex | Usage |
|---|---|---|---|
| Primary | `orange-500` | `#f97316` | Main actions, active navigation, accents |
| Primary Strong | `orange-600` | `#ea580c` | Hover/pressed states |
| Primary Dark | `orange-700` | `#c2410c` | Strong emphasis |
| Primary Soft | `orange-50` | `#fff7ed` | Active nav background, soft highlights |
| Primary Tint | `orange-100` | `#ffedd5` | Icon backgrounds, selected states |
| Primary Border | `orange-200` | `#fed7aa` | Orange-tinted borders |

### Recommended Brand CSS Variables

```css
:root {
  --brand: #f97316;
  --brand-hover: #ea580c;
  --brand-dark: #c2410c;
  --brand-soft: #fff7ed;
  --brand-tint: #ffedd5;
  --brand-border: #fed7aa;
}
```

---

## 3. Neutral Palette

The UI should use warm neutrals instead of pure gray wherever possible.

| Token | Tailwind | Hex | Usage |
|---|---|---|---|
| Background | `stone-50` | `#fafaf9` | Application background |
| Surface | `white` | `#ffffff` | Cards, panels, tables |
| Surface Muted | `stone-50` | `#fafaf9` | Secondary surfaces |
| Border | `stone-200` | `#e7e5e4` | Card/input/table borders |
| Border Strong | `stone-300` | `#d6d3d1` | Dividers, focused structure |
| Text Primary | `slate-900` | `#0f172a` | Main headings |
| Text Secondary | `slate-600` | `#475569` | Body text |
| Text Muted | `slate-500` | `#64748b` | Metadata, timestamps |
| Text Disabled | `slate-400` | `#94a3b8` | Disabled content |

### Tailwind usage

```html
<body class="bg-stone-50 text-slate-900">
```

---

## 4. Status / Severity Colors

Severity is operationally important and must remain visually distinct from the orange brand color.

### P1 — Critical

```text
bg-red-50
text-red-600
border-red-200
```

Hex:

```text
#fef2f2
#dc2626
#fecaca
```

### P2 — High

```text
bg-orange-50
text-orange-600
border-orange-200
```

Hex:

```text
#fff7ed
#ea580c
#fed7aa
```

### P3 — Moderate

```text
bg-amber-50
text-amber-600
border-amber-200
```

Hex:

```text
#fffbeb
#d97706
#fde68a
```

### P4 — Low

```text
bg-slate-100
text-slate-600
border-slate-200
```

Hex:

```text
#f1f5f9
#475569
#e2e8f0
```

---

## 5. System Status Colors

### Online / Success

```text
bg-green-50
text-green-600
border-green-200
```

Primary status:

```text
#16a34a
```

### Warning

```text
bg-amber-50
text-amber-600
border-amber-200
```

Primary status:

```text
#d97706
```

### Offline / Error

```text
bg-red-50
text-red-600
border-red-200
```

Primary status:

```text
#dc2626
```

### Informational

```text
bg-blue-50
text-blue-600
border-blue-200
```

Primary status:

```text
#2563eb
```

---

## 6. Tailwind Theme Extension

For a Tailwind config, use:

```ts
// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },

        surface: {
          DEFAULT: "#ffffff",
          muted: "#fafaf9",
        },

        ink: {
          DEFAULT: "#0f172a",
          secondary: "#475569",
          muted: "#64748b",
          disabled: "#94a3b8",
        },

        severity: {
          p1: "#dc2626",
          p2: "#ea580c",
          p3: "#d97706",
          p4: "#64748b",
        },
      },
    },
  },
};

export default config;
```

---

## 7. Backgrounds

### Application

```html
bg-stone-50
```

### Card

```html
bg-white
```

### Soft Orange

```html
bg-orange-50
```

### Selected / Active

```html
bg-orange-50
```

Avoid using orange as a large full-page background. Orange should act as an **accent**, not the dominant surface.

---

## 8. Cards

Recommended card:

```html
rounded-2xl
border border-stone-200
bg-white
shadow-sm
```

For important/interactive cards:

```html
rounded-2xl
border border-stone-200
bg-white
shadow-sm
transition-shadow
hover:shadow-md
```

Avoid heavy shadows such as:

```text
shadow-xl
shadow-2xl
```

The interface should feel lightweight.

---

## 9. Buttons

### Primary

```html
bg-orange-500
text-white
hover:bg-orange-600
active:bg-orange-700
```

Example:

```html
<button
  class="
    rounded-lg
    bg-orange-500
    px-4 py-2
    text-sm font-medium
    text-white
    hover:bg-orange-600
    active:bg-orange-700
  "
>
  Send Message
</button>
```

### Secondary

```html
border border-stone-200
bg-white
text-slate-700
hover:bg-stone-50
```

### Ghost

```html
text-slate-600
hover:bg-stone-100
hover:text-slate-900
```

---

## 10. Navigation

### Sidebar

```html
bg-white
border-r border-stone-200
```

### Active navigation item

```html
bg-orange-50
text-orange-600
```

Recommended active indicator:

```html
bg-orange-500
```

The active navigation state should be obvious but subtle.

---

## 11. Inputs

Default:

```html
border border-stone-200
bg-white
text-slate-900
placeholder:text-slate-400
```

Focus:

```html
focus:border-orange-500
focus:ring-2
focus:ring-orange-100
```

Example:

```html
<input
  class="
    h-10
    rounded-lg
    border border-stone-200
    bg-white
    px-3
    text-sm
    text-slate-900
    placeholder:text-slate-400
    outline-none
    focus:border-orange-500
    focus:ring-2
    focus:ring-orange-100
  "
/>
```

---

## 12. Typography

Recommended font:

```css
font-family: Inter, ui-sans-serif, system-ui, sans-serif;
```

Tailwind:

```html
font-sans
```

### Hierarchy

| Element | Tailwind |
|---|---|
| Page title | `text-xl font-semibold` |
| Section title | `text-base font-semibold` |
| Card metric | `text-2xl font-semibold` |
| Body | `text-sm text-slate-600` |
| Metadata | `text-xs text-slate-500` |
| Table text | `text-sm` |
| Badge | `text-xs font-medium` |

Avoid excessively large headings in the admin dashboard.

---

## 13. Badges

### P1

```html
rounded-md
bg-red-50
px-2 py-1
text-xs font-semibold
text-red-600
```

### P2

```html
rounded-md
bg-orange-50
px-2 py-1
text-xs font-semibold
text-orange-600
```

### P3

```html
rounded-md
bg-amber-50
px-2 py-1
text-xs font-semibold
text-amber-600
```

### P4

```html
rounded-md
bg-slate-100
px-2 py-1
text-xs font-semibold
text-slate-600
```

---

## 14. Role Colors

Roles should be visually distinguishable without competing with severity.

### Admin

```text
orange
```

### Responder

```text
green
```

Recommended:

```html
bg-green-50 text-green-700
```

### User

```text
blue
```

Recommended:

```html
bg-blue-50 text-blue-700
```

---

## 15. Device Status

### Online

```html
text-green-600
```

Indicator:

```html
h-2 w-2 rounded-full bg-green-500
```

### Offline

```html
text-red-600
```

Indicator:

```html
h-2 w-2 rounded-full bg-red-500
```

### Syncing

```html
text-orange-600
```

Indicator:

```html
h-2 w-2 rounded-full bg-orange-500
```

---

## 16. Layout

Recommended dashboard structure:

```text
┌──────────────┬────────────────────────────────────────┐
│              │ Header / Search                        │
│              ├────────────────────────────────────────┤
│   Sidebar    │ KPI Cards                              │
│              ├────────────────────────┬───────────────┤
│              │                        │               │
│              │       Live Map         │   Messages    │
│              │                        │               │
│              ├────────────────────────┤               │
│              │ Connected Devices      │ Gemini        │
│              │                        │ Severity      │
│              └────────────────────────┴───────────────┘
└──────────────┴────────────────────────────────────────┘
```

Use:

```html
grid
grid-cols-12
gap-4
```

Main map:

```html
col-span-8
```

Right panel:

```html
col-span-4
```

On smaller screens:

```html
grid-cols-1
```

---

## 17. Spacing

Use a compact spacing system:

```text
4px   → gap-1
8px   → gap-2
12px  → gap-3
16px  → gap-4
20px  → gap-5
24px  → gap-6
32px  → gap-8
```

Default dashboard spacing:

```html
gap-4
```

Card padding:

```html
p-4
```

Large sections:

```html
p-6
```

---

## 18. Border Radius

Use moderate rounding:

```text
rounded-lg  → inputs/buttons
rounded-xl   → smaller cards
rounded-2xl  → major dashboard cards
```

Avoid excessive `rounded-full` except for:

- avatars
- status dots
- compact circular icon buttons

---

## 19. Shadows

Primary:

```html
shadow-sm
```

Hover:

```html
hover:shadow-md
```

Avoid heavy elevation.

---

## 20. Icon Styling

Use outline icons.

Recommended:

```text
Lucide Icons
```

Default:

```html
text-slate-500
```

Active:

```html
text-orange-500
```

Critical:

```html
text-red-600
```

Success:

```html
text-green-600
```

Icons should generally be `16px–20px`.

---

## 21. Dashboard-Specific Color Rules

### Do

- Use orange for brand and primary actions.
- Use red only for genuinely critical P1 alerts.
- Use green for online/success states.
- Use blue for user/device informational states.
- Keep most surfaces white or warm off-white.
- Use color to communicate status.

### Don't

- Make the entire dashboard orange.
- Use red for ordinary notifications.
- Use gradients everywhere.
- Use multiple competing accent colors.
- Use heavy shadows.
- Use oversized cards.
- Use excessive pill-shaped UI.

---

## 22. Gemini Severity Visualization

Recommended chart colors:

```text
P1 → #dc2626
P2 → #ea580c
P3 → #d97706
P4 → #94a3b8
```

Tailwind equivalents:

```text
P1 → red-600
P2 → orange-600
P3 → amber-600
P4 → slate-400
```

The visualization should remain simple:

```text
P1  ██████  6
P2  ████████ 8
P3  ███████ 7
P4  ███ 3
```

---

## 23. Map UI

The map is an exception to the minimal color palette because geographical data needs its own visual language.

Keep the surrounding controls minimal:

```html
bg-white
border border-stone-200
shadow-sm
```

Recommended map markers:

```text
P1 → red
P2 → orange
P3 → amber
P4 → slate
Responder → green
User → blue
```

Map controls:

```html
rounded-lg
bg-white/95
shadow-sm
```

---

## 24. Quick Copy/Paste Palette

```text
Brand:
orange-500  #f97316
orange-600  #ea580c
orange-700  #c2410c
orange-50   #fff7ed
orange-100  #ffedd5
orange-200  #fed7aa

Background:
stone-50    #fafaf9
white       #ffffff

Borders:
stone-200   #e7e5e4
stone-300   #d6d3d1

Text:
slate-900   #0f172a
slate-600   #475569
slate-500   #64748b
slate-400   #94a3b8

Severity:
P1          red-600    #dc2626
P2          orange-600 #ea580c
P3          amber-600  #d97706
P4          slate-500  #64748b

Status:
Success     green-600  #16a34a
Info        blue-600   #2563eb
Warning     amber-600  #d97706
Error       red-600    #dc2626
```

---

## 25. Design Principle

> **Minimal interface. Maximum operational clarity.**

KosiMesh should look like a modern SaaS dashboard, while the **severity system, live device location, and incoming messages provide the emergency-response layer**.

Orange is the product identity.  
Red/orange/amber represent urgency.  
Green/blue represent operational state.  
Everything else stays neutral.
