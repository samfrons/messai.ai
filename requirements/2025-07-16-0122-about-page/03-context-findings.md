# Context Analysis Findings

**Date:** 2025-07-16 **Phase:** Context Gathering

## Key Findings

### 1. Existing UI Patterns and Components

#### Layout Structure

- **Container System**: Uses `container-grid` class with 12-column grid
  (`grid-12`)
- **Responsive Columns**: `col-span-12 lg:col-span-6` pattern for responsive
  layouts
- **Section Spacing**: Consistent `py-24` padding for sections
- **Background Alternation**: Sections alternate between white and `bg-gray-50`

#### Typography

- **Headings**: `font-serif font-light tracking-tight` (Crimson Text)
- **Body Text**: DM Mono font family
- **Text Sizes**: Responsive text sizing with custom utilities

#### Color Palette

- **Primary Background**: Cream (#f9f4ea)
- **Text Color**: Dark blue/black (rgb(12 22 56 / 90%))
- **Accent Colors**: Minimal use, mostly monochromatic

### 2. Animation Patterns

Found in `apps/web/src/app/home/components/*`:

- **Scroll-triggered animations** using `useEffect` with IntersectionObserver
- **CSS Transitions**: `opacity-0/100`, `translate-y-4/0`, `scale-95/100`
- **Staggered Delays**: `delay-${index * 100}` for sequential animations
- **Custom Animations**: `fade-in` and `slide-in` defined in Tailwind config

Example pattern:

```typescript
const [isVisible, setIsVisible] = useState(false);
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setIsVisible(entry.isIntersecting),
    { threshold: 0.1 }
  );
  // ... observer logic
}, []);
```

### 3. Component Library (@messai/ui)

Available components from `libs/shared/ui/src/components/`:

- **Card**: Minimal design with optional shadow effects
- **Button**: Multiple variants (primary, secondary, ghost, outline)
- **Badge**: For status indicators and labels
- **Layout**: Main app wrapper with navigation
- **Modal**: For overlays and dialogs
- **Input**: Form inputs with icon support

### 4. Image Handling

- Next.js Image component can be used for optimization
- Images allowed from: `self`, `blob:`, `data:`, `https:`
- No existing team photo or gallery components
- Images typically stored in `/public/` directory

### 5. Missing Components Needed

Based on requirements, we need to create:

1. **TeamMember Component**: For displaying team profiles with photos
2. **Timeline Component**: Interactive milestone visualization
3. **AboutSection Component**: Reusable section wrapper
4. **MilestoneCard Component**: Individual timeline items

### 6. Content from CLAUDE.md

Key content to include:

- **Vision**: "To democratize microbial electrochemical systems research..."
- **Mission**: "MESSAI empowers researchers, engineers, and innovators..."
- **Core Values**: Innovation, Sustainability, Collaboration, Open Science
- **Statistics**: 3,721+ papers, 1,500+ parameters, 1,200+ knowledge nodes

### 7. Navigation Integration

Current navigation in `layout.tsx`:

- Navigation items defined in an array
- Need to add "About" to the navigation items
- Route will be `/about`

### 8. File Structure Pattern

Following existing patterns:

```
apps/web/src/app/about/
├── page.tsx                 # Main About page
└── components/
    ├── TeamSection.tsx      # Team member grid
    ├── TeamMember.tsx       # Individual team card
    ├── Timeline.tsx         # Milestone timeline
    ├── MissionSection.tsx   # Vision/mission content
    └── StatsSection.tsx     # Key statistics
```

## Technical Implementation Notes

1. **Routing**: Next.js 13+ App Router pattern
2. **State Management**: Local component state with useState
3. **Styling**: Tailwind CSS with custom configuration
4. **TypeScript**: Strict mode enabled
5. **Performance**: Use dynamic imports for heavy components

## Files to Analyze Further

- `/apps/web/src/app/layout.tsx` - For navigation update
- `/apps/web/tailwind.config.js` - For animation definitions
- `/libs/shared/ui/src/components/*` - For reusable components
- `/apps/web/src/app/home/page.tsx` - For page structure patterns
