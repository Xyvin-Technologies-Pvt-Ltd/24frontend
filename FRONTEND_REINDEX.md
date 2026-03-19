# 24Connect Frontend - Codebase Index & Reindex

## Project Structure Overview

```
src/
├── components/
│   ├── custom/               # Custom business components
│   │   ├── app-layout.tsx    # Main app layout with routing
│   │   ├── dashboard-sidebar.tsx  # Navigation sidebar
│   │   ├── top-bar.tsx       # Top navigation bar
│   │   ├── approvals/        # Approval-related components
│   │   ├── contentManagment/ # Content management sub-components
│   │   ├── levels/           # Levels-related components
│   │   ├── settings/         # Settings components
│   │   └── userManagement/   # User management components
│   ├── icons/                # Icon components
│   └── ui/                   # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── sidebar.tsx
│       ├── navigation-item.tsx
│       ├── dropdown-menu.tsx
│       ├── modal.tsx
│       ├── toast.tsx
│       └── ...
├── pages/
│   ├── dashboard.tsx         # Dashboard page
│   ├── survey-form.tsx       # Public survey form
│   ├── survey-success.tsx    # Survey success page
│   ├── auth/                 # Authentication pages
│   ├── approvals/            # Approval pages
│   │   ├── posts.tsx
│   │   └── campaigns.tsx
│   ├── contentManagement/    # Content management pages
│   │   ├── campaigns.tsx
│   │   ├── events.tsx
│   │   ├── notifications.tsx
│   │   ├── promotions.tsx
│   │   ├── resources.tsx
│   │   ├── surveys.tsx
│   │   └── financial-programmes/   # NEW
│   │       ├── financial-programmes.tsx
│   │       └── index.ts
│   ├── level/                # Levels page
│   ├── qr/                   # QR-related pages
│   ├── settings/             # Settings pages
│   │   ├── admin-management.tsx
│   │   ├── app-settings.tsx
│   │   └── role-management.tsx
│   └── user/                 # User pages
│       ├── user-management.tsx
│       └── user-profile.tsx
├── hooks/                    # Custom React hooks
├── lib/                      # Utility libraries
├── services/                 # API services
├── types/                    # TypeScript type definitions
│   ├── campaign.ts
│   ├── event.ts
│   ├── financial-programme.ts  # NEW
│   └── ...
├── utils/                    # Utility functions
├── App.tsx                   # Main App component
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## Theme Consistency

### Color Scheme
- **Primary Background**: `bg-gray-50` (main content area)
- **Card Background**: `bg-white`
- **Borders**: `border-gray-200` on cards, `border-gray-300` on input fields
- **Primary Button**: `bg-black hover:bg-gray-800` (black buttons for actions)
- **Secondary Button**: `variant="outline"` with gray borders
- **Status Badges**: 
  - Active: `bg-green-100 text-green-800`
  - Inactive: `bg-gray-100 text-gray-800`
  - Completed: `bg-blue-100 text-blue-800`

### Component Patterns

#### Page Layout
```
1. TopBar (fixed at top)
2. Main content area:
   - Breadcrumb navigation
   - Header with action buttons (Create, Download)
   - Tab navigation (if applicable)
   - Content section:
     - Search & filter bar
     - Data table or content grid
     - Pagination (if table)
```

#### Table Components
- Header row with column names
- Hover effects on rows
- Action buttons (View, Edit, Delete) in last column
- Pagination with rows per page selector
- Search functionality
- Filter drawer (right-side modal)

#### Forms
- Use `TopBar` component
- Breadcrumb navigation
- Input fields with labels
- Cancel and Save buttons
- Error/success notifications via ToastContainer

## Module Routing

### Navigation Structure (sidebar)
```
Dashboard
User Management
Content Management
├─ Events
├─ Promotions
├─ Resources
├─ Campaigns
├─ Notifications
├─ Surveys
└─ Financial Programmes (NEW)
Levels
Approvals
├─ Posts
└─ Campaigns
Settings
├─ Admin Management
├─ Role Management
└─ Application Settings
```

### Route Mapping
| Page | Path | Component | Type |
|------|------|-----------|------|
| Dashboard | `/dashboard` | DashboardPage | Main |
| User Management | `/user-management` | UserManagementPage | Main |
| User Profile | `/user-profile` | UserProfilePage | Sub |
| Events | `/events` | EventsPage | Content |
| Promotions | `/promotions` | PromotionsPage | Content |
| Resources | `/resources` | ResourcesPage | Content |
| Campaigns | `/campaigns` | CampaignsPage | Content |
| Notifications | `/notifications` | NotificationsPage | Content |
| Surveys | `/surveys` | SurveysPage | Content |
| **Financial Programmes** | **/financial-programmes** | **FinancialProgrammesPage** | **Content (NEW)** |
| Levels | `/levels` | LevelsPage | Main |
| Posts Approval | `/approval-posts` | PostsApprovalPage | Approval |
| Campaigns Approval | `/approval-campaigns` | CampaignsApprovalPage | Approval |
| Admin Management | `/admin-management` | AdminManagementPage | Settings |
| Role Management | `/role-management` | RoleManagementPage | Settings |
| App Settings | `/app-settings` | ApplicationSettingsPage | Settings |

## New Financial Programmes Module

### Files Created
1. **Page Component**: `src/pages/contentManagement/financial-programmes/financial-programmes.tsx`
   - Main data table displaying financial programmes
   - Features: Search, filter, pagination, CRUD actions
   - Mock data with 5 sample programmes

2. **Module Export**: `src/pages/contentManagement/financial-programmes/index.ts`
   - Exports FinancialProgrammesPage component

3. **TypeScript Types**: `src/types/financial-programme.ts`
   - `FinancialProgramme` interface
   - `FinancialProgrammesResponse` interface
   - `FinancialProgrammesQueryParams` interface

### Files Modified
1. **Sidebar**: `src/components/custom/dashboard-sidebar.tsx`
   - Added "financial-programmes" to Page type
   - Added to isContentManagementActive array
   - Added navigation item in Content Management section

2. **App Layout**: `src/components/custom/app-layout.tsx`
   - Imported FinancialProgrammesPage
   - Added "financial-programmes" to Page type
   - Added path detection in useEffect
   - Added navigation case in switch statement
   - Added route for `/financial-programmes`

## UI Features by Page

### Table Pages (Campaigns, Events, etc. + Financial Programmes)
- ✅ Search input field
- ✅ Filter drawer (right-side modal)
- ✅ Pagination with configurable rows per page
- ✅ Status badges with color coding
- ✅ Action buttons (View, Edit, Delete)
- ✅ Breadcrumb navigation
- ✅ Download button
- ✅ Create/Add button
- ✅ Empty state handling
- ✅ Loading state

### Interactive Elements
- Expandable sidebar menu items
- Active page highlighting
- Hover effects on table rows and buttons
- Modal overlays for filters
- Toast notifications for actions

## Dependencies & Imports

### UI Components (from @/components/ui/)
- `Button` - Action buttons
- `Input` - Search and form inputs
- `Badge` - Status indicators
- `Sidebar` - Main sidebar container
- `NavigationItem` - Menu items
- `ToastContainer` - Notification display

### Icons (from lucide-react)
- `Plus` - Create/Add actions
- `Search` - Search functionality
- `Edit` - Edit actions
- `Trash2` - Delete actions
- `Eye` - View actions
- `ChevronLeft/Right` - Pagination
- `SlidersHorizontal` - Filter button
- `Download` - Download action
- `MoreHorizontal` - More options (unused in tables)

### Custom Components (from @/components/custom/)
- `TopBar` - Top navigation bar
- Component-specific forms (add, edit forms)

### Hooks (from @/hooks/)
- `useToast` - Toast notifications
- `useQuery` hooks - API data fetching
- Page-specific hooks (useCampaigns, useEvents, etc.)

## Styling Approach

### Tailwind CSS Pattern
- Utility-first approach
- Predefined color scheme (gray, blue, green, red)
- Rounded corners: `rounded-lg`, `rounded-2xl`
- Consistent spacing: `p-4`, `p-6`, `gap-2`, `gap-4`
- Responsive design: `flex`, `grid`, `flex-col`

### Common Classes
- **Cards**: `bg-white rounded-2xl border border-gray-200`
- **Buttons**: 
  - Primary: `bg-black hover:bg-gray-800 text-white`
  - Secondary: `variant="outline" ... rounded-full`
- **Input**: `border-[#B3B3B3] focus:border-[#B3B3B3] rounded-full`
- **Table**: `w-full` with `hover:bg-gray-50` rows

## Next Steps for Enhancement

1. **API Integration**
   - Replace mock data with real API calls
   - Create financial-programmes API hooks

2. **Component Features**
   - Add/Edit forms for financial programmes
   - View modal/page for single programme details
   - Analytics section (similar to campaigns)

3. **Data Export**
   - Implement Excel download functionality
   - CSV export option

4. **Filters**
   - Date range filtering
   - Status filtering (already present)
   - Category/type filtering

5. **Validation**
   - Form validation for add/edit
   - Error handling for API calls
   - Empty state improvements

## Reindexing Complete

✅ Frontend structure organized and documented
✅ Financial Programmes module integrated
✅ Navigation updated
✅ Routes configured
✅ Types defined
✅ Theme consistency maintained

All files follow existing 24Connect patterns and conventions.
