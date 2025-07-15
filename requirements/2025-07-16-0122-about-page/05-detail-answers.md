# Detailed Requirements Answers

**Date Answered:** 2025-07-16 **Time:** 01:30

## Answers

### Q6: Should team member data be stored as a TypeScript constant in the component file following the pattern used in mockData.ts files?

**Answer:** No

### Q7: Will the timeline component need to support horizontal scrolling on mobile devices like the existing responsive patterns?

**Answer:** No

### Q8: Should the About page use the same scroll-triggered animation pattern with IntersectionObserver as the home page components?

**Answer:** Yes

### Q9: Will team photos be stored in /public/images/team/ directory following Next.js static asset conventions?

**Answer:** Yes

### Q10: Should the About page follow the alternating white/gray-50 background pattern for sections like the home page?

**Answer:** Yes

## Implementation Notes

- Team data will be stored separately (not as constants in component files)
- Timeline will be vertical-only (no horizontal scrolling)
- Will implement scroll-triggered animations using IntersectionObserver
- Team photos will be placed in `/public/images/team/`
- Will maintain visual consistency with alternating section backgrounds
