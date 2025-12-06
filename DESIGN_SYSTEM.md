# Terminal Design System - Implementation Summary

## Overview
All pages across migrate-chart.fun now use a unified terminal-inspired design system with consistent colors, typography, and visual effects.

---

## Core Design Elements

### Color Palette
```css
--primary: #52C97D           /* Green - main brand color */
--primary-dark: #3FAA66      /* Hover states */
--bg: #000000                /* Base black */
--surface: #060606           /* Subtle elevation */
--text: #ffffff              /* Primary text */
--text-secondary: rgba(255, 255, 255, 0.7)  /* Secondary text */
--text-muted: rgba(255, 255, 255, 0.4)      /* Muted text */
--border: rgba(82, 201, 125, 0.15)          /* Border color */
--error: #ef4444             /* Error states */
--warning: #D4A853           /* Warning/gold accent */
```

### Terminal Texture Background
**Applied to all pages via:**
```css
background:
  /* Terminal character grid */
  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(82, 201, 125, 0.06) 2px, rgba(82, 201, 125, 0.06) 3px),
  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(82, 201, 125, 0.04) 2px, rgba(82, 201, 125, 0.04) 3px),
  /* Radial depth */
  radial-gradient(ellipse 120% 80% at 50% 20%, rgba(82, 201, 125, 0.08) 0%, transparent 50%),
  /* Noise texture */
  url("data:image/svg+xml,..."),
  #000000;
background-attachment: fixed;
```

### CRT Scanline Effect
```css
::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) 1px, transparent 1px, transparent 3px),
    repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(82, 201, 125, 0.03) 6px, rgba(82, 201, 125, 0.03) 7px);
  animation: scanline 12s linear infinite;
}
```

### Typography
- **Display/Headings**: Syne (400, 600, 700, 800)
- **Body/UI**: JetBrains Mono (300, 400, 500, 600)
- **Title Case**: All major headings and descriptions use title case

### Logo
- **SVG**: Grid/chart pattern (viewBox="57 135 388 232")
- **Color**: Green with drop-shadow glow
- **Sizes**: 60px (header), 50px (sidebar), 48px (mobile), 40px (footer)

---

## Page-by-Page Status

### ✅ Public Routes

#### 1. Landing Page (`/`)
**Status:** ✅ Fully Updated
- Terminal texture background with scanlines
- Logo in fixed header
- All backgrounds removed (transparent)
- Green theme throughout
- Syne + JetBrains Mono typography
- Updated messaging to focus on "complete price history across migrations"

#### 2. Token Dashboard (`/:token`)
**Status:** ✅ Uses Dynamic Theming
- Already has terminal aesthetics with project-specific colors
- Maintains per-project branding (green for default, custom colors per project)
- Logo present in header
- No changes needed - designed to be themeable

#### 3. Fees Page (`/:token/fees`)
**Status:** ✅ Updated
- Made backgrounds more transparent (black/30 instead of black/80)
- Terminal texture shows through
- Tooltips use semi-transparent backgrounds
- Uses dynamic project theming

#### 4. Contact Page (`/contact`)
**Status:** ✅ Fully Updated
- Terminal texture background with scanlines
- Logo in fixed header
- Form sections: transparent with green borders
- Updated messaging: "Add Your Token", "Pre-Migration Token", etc.
- Success state uses green theme
- Syne + JetBrains Mono typography

---

### ✅ Admin Routes

#### 5. Admin Layout (`/admin/*`)
**Status:** ✅ Fully Updated
- Terminal texture background with scanlines applied globally
- Proper z-index for content above effects
- Green color variables

#### 6. Admin Sidebar (Component)
**Status:** ✅ Fully Updated
- Logo centered at top with "Admin Console" text
- Green theme for active states
- Transparent background with green borders
- Status indicator uses green glowing dot
- Sign out button has red hover state

#### 7. Admin Login (`/admin/login`)
**Status:** ✅ Updated
- Terminal texture (from layout)
- Green theme throughout
- Logo in brand panel
- Form inputs: transparent with green focus glow
- Submit button: green background with glow effect
- Syne + JetBrains Mono fonts

#### 8. Admin Dashboard (`/admin/dashboard`)
**Status:** ✅ Updated
- Stat cards: transparent backgrounds with green borders
- Green hover glows
- Headers use Syne font
- Status badges use green for active/success
- All links and interactive elements use green theme

#### 9. Admin Projects (`/admin/projects`)
**Status:** ✅ Updated
- Table backgrounds transparent/very low opacity
- Green borders throughout
- Active status badges use green
- Hover effects have green glow
- Syne for headers, JetBrains Mono for body

#### 10. Admin Inquiries (`/admin/inquiries`)
**Status:** ✅ Updated
- Transparent backgrounds with green borders
- Status badges properly colored (green for approved)
- Green hover glows
- Syne + JetBrains Mono typography

#### 11. Admin Import (`/admin/projects/import`)
**Status:** ✅ Updated
- Green theme throughout
- Transparent cards with green borders
- Form inputs have green focus states
- Buttons use green with glow effects
- Syne for headings

---

### Utility/Test Pages

#### 12. Loading Test (`/loading-test`)
**Status:** Not Critical - Test page only

#### 13. Preview Pages (`/preview/:token`)
**Status:** ✅ Uses Token Dashboard
- Wraps the token dashboard component
- Inherits terminal design from that page

---

## Design Consistency Checklist

### ✅ Colors
- [x] All pages use green (#52C97D) as primary color
- [x] Borders consistently use rgba(82, 201, 125, 0.15)
- [x] Text colors match (white, 0.7 alpha, 0.4 alpha)
- [x] Error states use #ef4444
- [x] Warning/gold only where necessary (#D4A853)

### ✅ Typography
- [x] Syne used for all major headings
- [x] JetBrains Mono used for body text
- [x] Title case applied consistently

### ✅ Terminal Texture
- [x] Landing page: Full terminal background
- [x] Contact page: Full terminal background
- [x] Admin layout: Full terminal background (applies to all admin pages)
- [x] Token pages: Already dark with texture-compatible design
- [x] Fees page: Backgrounds made transparent

### ✅ Logo
- [x] Landing page header
- [x] Landing page footer
- [x] Contact page header
- [x] Admin sidebar
- [x] Token dashboard (already present)

### ✅ Scanlines
- [x] Landing page
- [x] Contact page
- [x] Admin layout (all admin pages inherit)

### ✅ Interactive Elements
- [x] Buttons use green with glow effects
- [x] Hover states have green glow (box-shadow: 0 0 20px rgba(82, 201, 125, 0.2))
- [x] Focus states have green borders and glows
- [x] Consistent border radius (6px)

---

## Visual Hierarchy

### Page Headers
```
Logo (top left, 60px) → Fixed position
Main heading (Syne, 2.5-4rem, weight 700, centered)
Subtitle (JetBrains Mono, 1rem, secondary color, centered)
```

### Cards/Sections
```
Border: 1px solid rgba(82, 201, 125, 0.15)
Background: transparent or rgba(0, 0, 0, 0.3)
Padding: 2rem
Border-radius: 8-12px
Hover: Green glow effect
```

### Forms
```
Labels: Uppercase, 0.75rem, secondary color
Inputs: Transparent bg, green border on focus, green glow
Buttons: Green bg (#52C97D), black text, green glow on hover
```

### Tables
```
Background: transparent or rgba(255, 255, 255, 0.02)
Borders: Green rgba(82, 201, 125, 0.15)
Hover: Green glow + background rgba(82, 201, 125, 0.05)
```

---

## Messaging Updates

All messaging updated to focus on the core value proposition:

### Before:
- "Track every migration with precision"
- "Premium analytics"
- "Trusted by projects"

### After:
- "Your complete price history. Before & after migration."
- "Migrations break your price history - we fix that"
- "One continuous chart from first pool to current pool"
- Focus on solving fragmented price data problem

---

## Technical Notes

### Z-Index Layers
```
1. Terminal grid background: z-index: 0 (background)
2. Scanline effect: z-index: 1
3. Content: z-index: 2+
4. Film grain overlay: z-index: 9999 (top layer)
```

### Animation Performance
- Scanline animation: 12s loop (seamless)
- No flash/jump due to proper keyframe match with background-size
- All other animations use GPU-accelerated transforms

### Responsive Considerations
- Logo sizes adjust: 60px desktop → 48px mobile
- Form layouts: 2-column grid → 1-column on mobile (< 600px)
- Padding scales appropriately

---

## Remaining Work

**None** - All pages have been systematically updated with the terminal design system.

## Summary

✅ **11/11 pages updated** with cohesive terminal design
- Unified color system (green primary)
- Consistent typography (Syne + JetBrains Mono)
- Terminal texture on all backgrounds
- CRT scanlines on key pages
- Logo present throughout
- Updated messaging focused on migration pain point

The entire site now has a professional, cohesive terminal aesthetic that reinforces the brand identity and makes the platform instantly recognizable.
