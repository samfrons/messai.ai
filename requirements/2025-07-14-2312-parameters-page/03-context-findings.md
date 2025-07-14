# Context Findings - Parameters Page

## Current Parameter Implementation

### Parameter Structure

- **Location**: `apps/web/src/data/prediction-constants.ts`
- **Types**: `apps/web/src/types/predictions.ts`
- **Categories**: Electrode Materials (6), Microbial Species (6), System
  Configurations (4), Substrates (6), Operating Conditions
- **Properties**: Each parameter has specific properties (conductivity, surface
  area, cost, biocompatibility, etc.)

### Database Schema

```prisma
model Material {
  id              String    @id @default(cuid())
  name            String    @unique
  category        String    // electrode, membrane, substrate, microbe
  type            String    // anode, cathode, separator, etc.
  properties      Json      // Flexible property storage
  compatibility   Json?     // Compatible materials/microbes
  source          String?   // Literature reference
  verified        Boolean   @default(false)
}
```

### Parameter Flow

1. Constants defined in `prediction-constants.ts`
2. Used in Predictions page form (`apps/web/src/app/predictions/page.tsx`)
3. Validated against constraints
4. Passed to prediction calculations
5. Results displayed with optimization recommendations

### UI Patterns Observed

- **Forms**: Range sliders with numeric inputs, real-time validation
- **Data Display**: Cards, badges, modals for details
- **Layout**: Consistent `space-y-6` spacing, border-b dividers
- **Components**: All from `@messai/ui` shared library

## Files to Modify/Create

### New Files

1. `apps/web/src/app/parameters/page.tsx` - Main parameters page
2. `apps/web/src/app/parameters/components/ParameterList.tsx` - Parameter
   listing/grid
3. `apps/web/src/app/parameters/components/ParameterDetail.tsx` - Detail view
   modal
4. `apps/web/src/app/parameters/components/ParameterForm.tsx` - Create/edit form
5. `apps/web/src/app/parameters/components/CompatibilityMatrix.tsx` - Visual
   compatibility
6. `apps/web/src/types/parameters.ts` - Extended parameter types
7. `apps/web/src/app/api/parameters/route.ts` - API endpoints

### Files to Modify

1. `apps/web/src/app/layout.tsx` - Add navigation entry
2. `prisma/schema.prisma` - Potentially enhance Material model
3. `apps/web/src/data/prediction-constants.ts` - Extend with full parameter set

## Patterns to Follow

### Page Structure

```tsx
'use client';
export default function ParametersPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">MESS Parameters</h1>
        <p className="text-gray-600 mt-2">Description</p>
      </div>
      {/* Main content */}
    </div>
  );
}
```

### Component Patterns

- Use `Card` component for grouping
- Implement search with `Input` component with search icon
- Use `Badge` for categories/types
- Implement `Modal` for parameter details
- Follow existing form patterns from Predictions page

## Technical Constraints

1. **JSON Storage**: Material properties stored as JSON - need structured access
2. **Performance**: 1500+ parameters require pagination/virtualization
3. **Validation**: Must maintain compatibility with existing prediction engine
4. **Auth**: Consider user-specific custom parameters (requires auth context)

## Integration Points

1. **Predictions Page**: Parameters selected here flow to predictions
2. **Research Page**: Link parameters to supporting research papers
3. **Lab Page**: Visual representation of parameter effects in 3D models
4. **API**: Need endpoints for CRUD operations on parameters

## Similar Features Analyzed

### Research Page Pattern

- Search with debouncing
- Filter sidebar
- Card-based results
- Modal for details
- Pagination

### Predictions Page Pattern

- Multi-section form
- Real-time validation
- Preset configurations
- Results display

## Key Functionality Gaps

1. No bulk import/export functionality
2. No parameter versioning system
3. No visual compatibility matrix
4. No parameter comparison tools
5. No linkage to research papers
6. No user-defined custom parameters UI
