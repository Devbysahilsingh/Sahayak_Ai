---
name: Civic Management System
colors:
  surface: '#f7f9ff'
  surface-dim: '#d1dbe8'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e4effd'
  surface-container-high: '#dfe9f7'
  surface-container-highest: '#d9e3f1'
  on-surface: '#121d26'
  on-surface-variant: '#43474d'
  inverse-surface: '#27313c'
  inverse-on-surface: '#e8f2ff'
  outline: '#74777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#48607d'
  primary: '#00152a'
  on-primary: '#ffffff'
  primary-container: '#0f2a44'
  on-primary-container: '#7992b1'
  inverse-primary: '#b0c9ea'
  secondary: '#006a6a'
  on-secondary: '#ffffff'
  secondary-container: '#91f3f2'
  on-secondary-container: '#007070'
  tertiary: '#201100'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c2300'
  on-tertiary-container: '#af895a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b0c9ea'
  on-primary-fixed: '#001d36'
  on-primary-fixed-variant: '#304864'
  secondary-fixed: '#91f3f2'
  secondary-fixed-dim: '#75d6d6'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f50'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ebbf8c'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#5f4119'
  background: '#f7f9ff'
  on-background: '#121d26'
  surface-variant: '#d9e3f1'
typography:
  display:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h1:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  h2:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  h3:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-uppercase:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max-width: 1280px
  sidebar-width: 260px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
---

## Brand & Style

This design system is built on the principles of **Institutional Integrity** and **Operational Efficiency**. It serves as a bridge between the state and the citizen, requiring an aesthetic that is authoritative yet accessible. The design direction follows a **Corporate / Modern** approach with a focus on high information density and absolute clarity.

The visual narrative avoids all superfluous ornamentation. There are no gradients, decorative organic shapes, or marketing-heavy "hero" sections. Instead, the system relies on structured grids, purposeful use of color to indicate status, and a rigorous typographic hierarchy. The goal is to evoke a sense of calm, order, and reliability, ensuring users feel their grievances are being handled within a stable, professional environment.

## Colors

The color palette is anchored by **Deep Navy Blue**, providing an institutional foundation that suggests tradition and trust. **Teal** serves as the primary action color for secondary navigation and utility, while **Saffron/Amber** is used sparingly as an accent to draw attention to critical calls-to-action or pending notifications.

Semantic colors (Success, Warning, Danger) are chosen for high legibility against the light grey background. 
- **Surface colors**: Pure white (#FFFFFF) is used for cards and content containers to pop against the **Light Grey** (#F5F7FA) application background.
- **Borders**: All structural boundaries use a consistent **Subtle Grey** (#E1E7EF) to maintain a clean, organized look without creating heavy visual noise.

## Typography

This design system utilizes **Public Sans** for headings to instill a sense of official government communication—it is clear, neutral, and highly legible. **Inter** is utilized for all body copy and UI labels due to its exceptional performance in dense, data-heavy layouts.

For ticket IDs and reference numbers, a monospaced font (**JetBrains Mono**) is introduced to ensure distinct characters (like '0' vs 'O') are easily distinguishable by officers.

- **Weight usage**: Use Semi-bold (600) for UI emphasis and Regular (400) for all long-form reading content.
- **Alignment**: Large data tables should use `body-sm` for maximum content density, while citizen-facing forms should use `body-lg`.

## Layout & Spacing

The system employs a **Fixed Grid** approach for internal dashboard views and a **Centered Panel** approach for authentication and citizen submission flows.

1.  **Officer Dashboard**: A persistent left sidebar (260px) houses the primary navigation. The main content area uses a fluid 12-column grid to accommodate complex data tables.
2.  **Citizen Portal**: A top-bar navigation with a centered container (max-width 1280px) ensures that information remains focused and accessible on large displays.
3.  **Authentication**: Use a single-column centered panel (max-width 480px) to minimize distraction and maximize completion rates.

The rhythm is based on a **4px base unit**. Component internal padding should default to 16px (4 units) or 12px (3 units) for "dense" modes.

## Elevation & Depth

This design system rejects heavy shadows in favor of **Low-Contrast Outlines** and **Tonal Layers**. Depth is communicated through the physical stacking of surfaces rather than light sources.

- **Level 0 (Base)**: Background (#F5F7FA).
- **Level 1 (Content)**: White cards (#FFFFFF) with a 1px solid border (#E1E7EF). No shadow.
- **Level 2 (Interactive/Floating)**: Modals and dropdown menus. These are the only elements permitted to have a shadow: `0 4px 12px rgba(15, 42, 68, 0.08)`.

Transitions between states (e.g., hovering over a table row) should be indicated by a subtle background color shift to `#F0F2F5` rather than an elevation change.

## Shapes

The shape language is conservative and professional. A **Soft** corner radius is applied across the system to prevent the UI from feeling overly aggressive or sharp, while maintaining a structured "document-like" feel.

- **Standard Elements**: 4px radius (Buttons, Input fields, Small badges).
- **Cards & Panels**: 8px radius. This is the maximum permitted radius in the system.
- **Status Pills**: Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary**: Solid Deep Navy (#0F2A44) with white text. 4px radius.
- **Secondary**: Solid Teal (#168A8A) with white text.
- **Ghost/Outline**: Transparent background with #E1E7EF border and #1F2933 text.

### Input Fields
- Use a 1px border (#E1E7EF). On focus, the border shifts to Primary Navy with a 2px inset ring.
- Labels must always be visible above the field (never use placeholder text as a label).

### Data Tables
- Header background: `#F5F7FA`. 
- Cell borders: Bottom-only 1px (#E1E7EF).
- Row hover: Subtle tint (#F0F2F5).
- Alignment: Text is left-aligned; numerical data is right-aligned.

### Status Badges
- Small, uppercase, bold text.
- Use a light tinted background (10% opacity of the semantic color) with high-contrast text of the same hue (e.g., Light Red background with Dark Red text for "Urgent").

### Cards
- White background, 1px border (#E1E7EF), 8px radius. 
- Use "Card Headers" with a bottom border to separate titles from content.