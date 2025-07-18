# About Page Requirements Specification

**Date:** 2025-07-16 **Status:** Complete **Version:** 1.0

## 1. Problem Statement

MESSAI needs an About page to communicate its vision, mission, team, and journey
to visitors. Currently, there is no dedicated page that tells the story of
MESSAI, introduces the team, or showcases the platform's development milestones.

## 2. Solution Overview

Create a comprehensive About page that:

- Communicates MESSAI's vision and mission clearly
- Introduces team members with photos and roles
- Displays an interactive timeline of key milestones
- Maintains consistency with the existing design system
- Provides an engaging user experience with scroll-triggered animations

## 3. Functional Requirements

### 3.1 Page Sections

1. **Hero Section**
   - Page title: "About MESSAI"
   - Brief tagline about democratizing electrochemical systems research
   - Smooth scroll indicator

2. **Mission & Vision Section**
   - Display MESSAI's vision statement
   - Display MESSAI's mission statement
   - Core values (Innovation, Sustainability, Collaboration, Open Science)
   - Use alternating background (white)

3. **Statistics Section**
   - Display key metrics in an engaging format:
     - 3,721+ Research Papers
     - 1,500+ MESS Parameters
     - 1,200+ Knowledge Nodes
     - 4 Original MESS Models
   - Use alternating background (gray-50)

4. **Team Section**
   - Grid layout of team member cards
   - Each card includes:
     - Photo (stored in `/public/images/team/`)
     - Name
     - Role/Title
     - Brief bio (1-2 sentences)
   - Responsive grid (1 column mobile, 2 tablet, 3 desktop)
   - Use alternating background (white)

5. **Timeline Section**
   - Vertical timeline showing MESSAI's journey
   - Key milestones with dates and descriptions
   - Interactive elements with hover effects
   - Visual connectors between milestones
   - Use alternating background (gray-50)

6. **Call-to-Action Section**
   - Encouraging message about joining the mission
   - Links to relevant pages (Research, Lab, Get Started)
   - Use alternating background (white)

### 3.2 Navigation Integration

- Add "About" link to main navigation
- Position between "Research" and "Lab" in navigation order
- Route: `/about`

### 3.3 Animations

- Implement scroll-triggered animations using IntersectionObserver
- Fade-in and slide-up effects for sections
- Staggered animations for team cards and timeline items
- Follow existing animation patterns from home page

## 4. Technical Requirements

### 4.1 File Structure

```
apps/web/src/app/about/
├── page.tsx                    # Main About page component
├── components/
│   ├── AboutHero.tsx          # Hero section
│   ├── MissionVision.tsx      # Mission & vision content
│   ├── TeamSection.tsx        # Team grid container
│   ├── TeamMember.tsx         # Individual team member card
│   ├── Timeline.tsx           # Milestone timeline component
│   ├── TimelineItem.tsx       # Individual timeline entry
│   ├── StatsSection.tsx       # Statistics display
│   └── AboutCTA.tsx           # Call-to-action section
└── data/
    ├── team.ts                # Team member data
    └── milestones.ts          # Timeline milestone data
```

### 4.2 Data Structure

**Team Member Interface:**

```typescript
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string; // Path relative to /public/images/team/
}
```

**Milestone Interface:**

```typescript
interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon?: string; // Optional icon identifier
}
```

### 4.3 Component Requirements

1. **Reuse existing UI components:**
   - Card from @messai/ui
   - Button from @messai/ui
   - Badge from @messai/ui
   - Layout wrapper

2. **Follow existing patterns:**
   - Use `container-grid` and `grid-12` for layouts
   - Apply responsive column spans
   - Maintain consistent padding (py-24)
   - Use established typography classes

3. **Image Optimization:**
   - Use Next.js Image component
   - Lazy loading for team photos
   - Appropriate image sizes and formats

### 4.4 Styling Requirements

- **Colors:** Follow existing palette (cream background, dark text)
- **Typography:** Crimson Text for headings, DM Mono for body
- **Spacing:** Consistent with existing pages
- **Responsive:** Mobile-first approach
- **Backgrounds:** Alternating white/gray-50 sections

## 5. Implementation Hints

1. **Animation Hook:**
   - Create a reusable `useScrollAnimation` hook
   - Based on existing IntersectionObserver pattern

2. **Data Files:**
   - Store team data in `/about/data/team.ts`
   - Store milestone data in `/about/data/milestones.ts`
   - Export as TypeScript constants with proper typing

3. **Image Guidelines:**
   - Team photos: 400x400px, optimized JPG/WebP
   - Consistent styling (circular or rounded square)
   - Fallback placeholder for missing images

4. **Timeline Design:**
   - Vertical line with dots for each milestone
   - Alternating left/right positioning on desktop
   - Single column on mobile
   - Subtle hover effects on milestone items

## 6. Acceptance Criteria

1. ✓ About page is accessible at `/about` route
2. ✓ "About" link is added to main navigation
3. ✓ All sections render with proper content
4. ✓ Team member cards display photos, names, and roles
5. ✓ Timeline shows milestones in chronological order
6. ✓ Scroll animations trigger smoothly
7. ✓ Page is fully responsive across devices
8. ✓ Maintains visual consistency with existing pages
9. ✓ All images load properly from `/public/images/team/`
10. ✓ No TypeScript errors or warnings
11. ✓ Follows established coding patterns

## 7. Future Enhancements (Out of Scope)

- CMS integration for content management
- Team member social media links
- Animated statistics counters
- Video content or testimonials
- Multi-language support
- Contact form integration

## 8. Dependencies

- Next.js 15 (existing)
- React 18 (existing)
- @messai/ui component library (existing)
- Tailwind CSS (existing)
- TypeScript (existing)

## 9. Assumptions

- Content for vision, mission, and milestones will be provided
- Team member information and photos will be supplied
- No backend API integration needed (static content)
- No authentication required to view the page
- Content won't change frequently enough to require CMS
