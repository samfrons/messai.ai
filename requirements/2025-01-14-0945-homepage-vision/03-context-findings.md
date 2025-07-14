# Context Findings

## Phase 3: Targeted Context Gathering Results

### Existing Homepage Analysis

**File:** `/apps/web/src/app/page.tsx`

- Current implementation exists but doesn't follow the established minimalist
  design system
- Uses bold colors and heavy styling that conflicts with CETEP-inspired
  aesthetic
- Includes basic sections: hero, platform overview (3 cards), quick actions,
  design system preview
- Needs complete redesign to align with project's design language

### Design System & Components

**Key Design Principles:**

- **Color Palette:** Cream background (#F9F7F1), black text, minimal grays
- **Typography:**
  - Serif (Crimson Text) for headings with light font weights
  - Sans-serif (DM Mono) for body text
  - Responsive text classes available
- **Layout:** 12-column grid system with responsive utilities
- **Components:** Minimalist Card, Button (3 variants), Badge, Input components
- **Interactions:** Subtle transitions (200-300ms), opacity changes on hover

**Available UI Components:**

- `Button`: primary (black), secondary (cream), ghost variants
- `Card`: minimal styling with optional shadow
- `Badge`: status indicators with multiple color variants
- `Input`: underline style with icon support
- `Modal`: full-featured dialog component
- `Accordion`: for progressive disclosure (newly added)

### Animation Capabilities

**Current State:**

- No dedicated animation libraries (no Framer Motion, React Spring)
- Relies on CSS transitions and Tailwind utilities
- Custom animations in global.css (fade-in, slide-up)
- Design tokens define timing (150ms, 200ms, 300ms)
- Three.js animations for 3D components

**Recommendation:** Given performance requirements and existing patterns,
continue with CSS-based animations. Consider adding Framer Motion only if
complex gesture-based interactions are needed.

### Navigation & Section Patterns

**Layout Structure:**

- Minimalist header with logo, center navigation, user menu
- Consistent page headers with large serif titles and descriptive subtitles
- Content sections use Card components with generous spacing
- Full-width CTAs within cards for major actions

**Section Patterns Found:**

```tsx
// Page header pattern
<div className="grid-12">
  <div className="col-span-12">
    <h1 className="text-responsive-xl font-serif font-light tracking-tight">
    <p className="text-lg mt-4 opacity-60">
```

### Persona-Based Content Examples

The research page (`/apps/web/src/app/research/page.tsx`) demonstrates persona
awareness:

- Statistics dashboard for quick metrics overview
- Feature explanations in expandable sections
- Quick action cards for common tasks
- Progressive disclosure through modals

### Best Practices Research

**Scientific Platform Homepage Requirements (2024):**

1. Clear mission and value communication with storytelling
2. Accessibility with perfect scores (audio, clear fonts, visual cues)
3. Dynamic elements and real-time statistics
4. Content credibility and trust indicators
5. Mobile optimization and voice search readiness
6. AI-powered personalization capabilities

### Technical Constraints

1. **No Authentication on Homepage:** Confirmed no personalized content needed
2. **Single-Page Scroll:** All content accessible without navigation
3. **Performance:** Keep animations lightweight, use CSS over JS when possible
4. **Accessibility:** Must maintain high accessibility standards

### Files to Modify

1. **Primary:** `/apps/web/src/app/page.tsx` - Complete rewrite needed
2. **Potential New Components:**
   - Hero section with vision statement
   - Persona cards component
   - Statistics/metrics display
   - Feature showcase with animations
   - Testimonial or research highlight section
   - CTA section with clear next steps

### Implementation Patterns to Follow

1. Use existing Card and Button components
2. Apply 12-column grid system consistently
3. Follow typography hierarchy (serif headers, sans-serif body)
4. Maintain cream/black color scheme
5. Use `space-y-12` between major sections
6. Keep animations subtle (opacity, transforms)
7. Ensure all content is accessible without login
