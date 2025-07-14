# Requirements Specification - MESS Parameters Page

## Problem Statement

MESSAI.AI currently has MESS parameters scattered across different components
and constants files. Users need a centralized interface to browse, search,
create, and manage the 1500+ parameters across 150 categories that are
fundamental to microbial electrochemical systems design and predictions.

## Solution Overview

Create a dedicated Parameters page that serves as the comprehensive parameter
management hub, allowing users to:

- Browse and search through all system and custom parameters
- Create and save private custom parameters
- View compatibility matrices with quantitative scores
- Calculate derived properties automatically
- Import/export parameter sets in bulk
- Seamlessly integrate with the Predictions workflow

## Functional Requirements

### 1. Parameter Display & Navigation

- Display parameters in a searchable, filterable grid/list view
- Categories: Electrode Materials, Microbial Species, Substrates, Operating
  Conditions, System Configurations
- Show key properties for each parameter (conductivity, cost, temperature range,
  etc.)
- Support pagination or virtual scrolling for 1500+ parameters
- Quick filters by category, type, and properties

### 2. Search & Filter Capabilities

- Full-text search across parameter names and descriptions
- Advanced filters:
  - Category (electrode, microbe, substrate, etc.)
  - Type (anode, cathode, etc.)
  - Property ranges (conductivity > X, cost < Y)
  - Compatibility with specific materials/microbes
- Save and reuse filter configurations

### 3. Custom Parameter Creation

- Form to create new parameters with:
  - Basic info (name, category, type, description)
  - Properties (based on category - conductivity, surface area, etc.)
  - Source/reference information
  - Initial compatibility settings
- Validation against fixed scientific constraints
- Parameters are private to user account

### 4. Compatibility Matrix

- Visual matrix showing compatibility between parameters
- Quantitative scores (0-100) rather than binary
- Color-coded for quick identification (red=incompatible, green=highly
  compatible)
- Filterable by parameter category
- Explanations for compatibility scores

### 5. Property Calculations

- Automatically calculate derived properties based on inputs
- Examples:
  - Power density from conductivity and surface area
  - Theoretical efficiency from thermodynamic properties
  - Cost per watt from material costs
- Real-time updates as base properties change

### 6. Bulk Operations

- Import parameters from CSV/JSON files
- Export selected parameters or entire sets
- Template files for import format
- Validation report for imports
- Batch update capabilities

### 7. Integration with Predictions

- "Use in Prediction" button for each parameter
- Pre-populate prediction forms with selected parameters
- Parameter sets/presets that can be saved and reused
- Link from predictions page to view/edit parameters

### 8. Parameter Details View

- Modal or dedicated page showing:
  - All properties and metadata
  - Compatibility information
  - Usage statistics (times used in predictions)
  - Related research papers (future)
  - Performance history in experiments

## Technical Requirements

### File Structure

```
apps/web/src/app/parameters/
├── page.tsx                          # Main parameters page
├── components/
│   ├── ParameterList.tsx            # Grid/list view component
│   ├── ParameterCard.tsx            # Individual parameter display
│   ├── ParameterDetail.tsx          # Detail view modal
│   ├── ParameterForm.tsx            # Create/edit form
│   ├── ParameterFilters.tsx         # Search and filter sidebar
│   ├── CompatibilityMatrix.tsx      # Visual compatibility display
│   ├── PropertyCalculator.tsx       # Derived property calculations
│   └── BulkOperations.tsx           # Import/export functionality
├── hooks/
│   ├── useParameters.ts             # Parameter data fetching
│   └── useParameterFilters.ts      # Filter state management
└── utils/
    ├── parameter-validation.ts      # Validation logic
    ├── compatibility-calculator.ts  # Compatibility scoring
    └── property-calculator.ts       # Derived property logic
```

### API Endpoints

```
POST   /api/parameters              # Create custom parameter
GET    /api/parameters              # List parameters (with filters)
GET    /api/parameters/:id          # Get parameter details
PUT    /api/parameters/:id          # Update custom parameter
DELETE /api/parameters/:id          # Delete custom parameter
POST   /api/parameters/import       # Bulk import
GET    /api/parameters/export       # Bulk export
GET    /api/parameters/compatibility # Get compatibility matrix
```

### Database Schema Updates

```prisma
model Parameter {
  id              String    @id @default(cuid())
  userId          String?   // null for system parameters
  name            String
  category        String
  type            String
  description     String?
  properties      Json
  compatibility   Json?
  source          String?
  isSystem        Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User?     @relation(fields: [userId], references: [id])

  @@unique([userId, name])
  @@index([category, type])
  @@index([userId])
}
```

### UI Components Required

- Use existing components from `@messai/ui`:
  - `Card` for parameter display
  - `Input` with search icon for search bar
  - `Button` for actions
  - `Badge` for categories/types
  - `Modal` for detail views
- New components needed:
  - Data table/grid component
  - Matrix visualization component
  - File upload component

## Implementation Hints

### 1. Start with Static Data

- Begin by displaying existing parameters from `prediction-constants.ts`
- Add database integration incrementally

### 2. Search Implementation

- Use debounced search similar to Research page
- Consider using Fuse.js for client-side fuzzy search

### 3. Compatibility Scoring

- Start with simple biocompatibility \* conductivity formula
- Expand to more sophisticated scoring based on research

### 4. Performance Optimization

- Implement virtual scrolling for large parameter lists
- Use React.memo for parameter cards
- Lazy load detail modals

### 5. State Management

- Use React hooks for local state
- Consider Zustand if state gets complex
- Keep filter state in URL params for shareability

## Acceptance Criteria

1. ✓ Users can view all system parameters in organized categories
2. ✓ Search returns relevant results within 300ms
3. ✓ Custom parameters are saved to user account only
4. ✓ Compatibility matrix shows quantitative scores
5. ✓ Property calculations update in real-time
6. ✓ Bulk import validates and reports errors clearly
7. ✓ Integration with Predictions page is seamless
8. ✓ Page follows existing design patterns and is responsive
9. ✓ All validation uses fixed scientific constraints
10. ✓ Page loads within 2 seconds with 1500+ parameters

## Assumptions

- No versioning system needed initially
- Parameters don't need approval workflow
- Compatibility scores use predefined algorithms
- No real-time collaboration features needed
- English-only interface initially
