# Teen Budget Tracker - Complete Requirements Document

## Project Overview

### Purpose
A modern, mobile-first budget tracking application designed specifically for teenagers to learn financial literacy through gamification, expense tracking, and savings goal management.

### Target Audience
- Primary: Teenagers (ages 13-18)
- Secondary: Parents wanting to teach financial responsibility
- Use Case: Personal finance education, allowance tracking, saving goals

### Key Principles
- Mobile-first responsive design
- Simple, intuitive interface
- Educational focus with gamification
- Euro (EUR) currency throughout
- Privacy-focused with demo account option

---

## Technology Stack

---

## Core Features

### 1. Authentication System

**Security Features**
- JWT-based sessions
- NextAuth.js integration
- Secure credential validation
- Session persistence

### 2. Transaction Management
**Transaction Types**
- Income: Allowance, gifts, part-time work
- Expenses: All spending categories

**Transaction Properties**
- Amount (Euro, 2 decimal places)
- Description (required)
- Category (user-selected)
- Date (defaults to today)
- Automatic timestamps (created/updated)

**Transaction Operations**
- Create new transactions
- View transaction history
- Edit existing transactions
- Delete transactions
- Sort by date (newest first)
- Filter by category/date range

### 3. Category System
**Default Income Categories**
- Food & Drinks (🍔, orange)
- Clothes (pick an icon, purple)
- Hygiene (🛍️, pink)
- Taschengeld (💰, yellow)
- Other (📌, gray)

**Default Expense Categories**
- Food & Drinks (🍔, orange)
- Clothes (pick an icon, purple)
- Sports (🛍️, pink)
- Games (💰, yellow)
- Other (📌, gray)

**Category Properties**
- Name (required, user-defined)
- Icon (100+ emoji options)
- Color (predefined Tailwind colors)
- User ownership (per-user categories)

**Category Management**
- Create custom categories
- Edit category name, icon, color
- Delete categories (with safeguards)
- Visual icon picker interface
- Color picker with predefined options

### 4. Budget Management
**Budget Features**
- calculate monthly amount according to income categories
- Set spending limits per expense category
- Monthly/weekly/daily periods
- Visual progress indicators
- Over-budget warnings
- Budget vs. actual spending comparison

**Budget Properties**
- Amount limit (Euro)
- Time period (MONTHLY, WEEKLY, DAILY)
- Associated category
- Start and end dates
- Progress calculation

**Budget Display**
- Progress bars with color coding:
  - Green: Under 80% of budget
  - Yellow: 80-99% of budget
  - Red: Over budget
- Spending summaries
- Budget overview dashboard

**Savings Goal**
- possible to define one goal
- expense categorie "savings" helps achieve the goal.

**Inventory**
- how much money (cash or balance) do you have? How much should you have?
----------------------------- 

### 5. Dashboard & Analytics
**Home Dashboard Cards**
- Total Balance (Income - Expenses)
- Monthly Spending summary
- Savings Goal progress

**Transaction Lists**
- Recent transactions display
- Category-based organization
- Date-based filtering
- Quick expense entry

**Budget Overview**
- Category-wise spending vs. budgets
- Overall budget utilization
- Visual progress indicators
- Alert system for overspending

### 6. Currency & Localization
**Currency Settings**
- Base currency: Euro (EUR)
- German locale formatting (de-DE)
- Symbol: €
- Format: €123.45
- Input validation for currency amounts

### 7. Progressive Web App (PWA)
**Manifest Configuration**
- App name: "Teen Budget Tracker"
- Short name: "Budget Tracker"
- Standalone display mode
- Portrait orientation
- Theme colors: Blue (#3b82f6)
- Icon support (192x192, 512x512)

---

## Database Schema (incomplete)

### User Model
```typescript
interface User {
  id: string            // CUID primary key
  email: string         // Unique identifier
  name?: string         // Display name
  image?: string        // Profile picture URL
  createdAt: DateTime   // Account creation
  updatedAt: DateTime   // Last modification
}
```

### Category Model
```typescript
interface Category {
  id: string            // CUID primary key
  name: string          // Category name
  icon?: string         // Emoji icon
  color?: string        // Tailwind color class
  userId: string        // Foreign key to User
  createdAt: DateTime   // Category creation
}
```

### Transaction Model
```typescript
interface Transaction {
  id: string            // CUID primary key
  amount: number        // Decimal amount in EUR
  type: string          // "INCOME" | "EXPENSE"
  description: string   // Transaction description
  date: DateTime        // Transaction date
  categoryId: string    // Foreign key to Category
  userId: string        // Foreign key to User
  receiptUrl?: string   // Optional receipt image
  createdAt: DateTime   // Record creation
  updatedAt: DateTime   // Last modification
}
```

### Budget Model
```typescript
interface Budget {
  id: string            // CUID primary key
  amount: number        // Budget limit in EUR
  period: string        // "MONTHLY" | "WEEKLY" | "DAILY"
  categoryId: string    // Foreign key to Category
  userId: string        // Foreign key to User
  startDate: DateTime   // Budget period start
  endDate: DateTime     // Budget period end
  createdAt: DateTime   // Budget creation
  updatedAt: DateTime   // Last modification
}
```

### Authentication Models (NextAuth)
```typescript
interface Account {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string
  access_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
  id_token?: string
  session_state?: string
}

interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: DateTime
}
```

### Future Models (Not Yet Implemented)
```typescript
interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: DateTime
  userId: string
  icon?: string
  createdAt: DateTime
  updatedAt: DateTime
}

interface Achievement {
  id: string
  type: string
  name: string
  description: string
  icon: string
  unlockedAt: DateTime
  userId: string
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/demo` - Create/login demo user
- `POST /api/demo/reset` - Reset all demo data
- `GET /api/auth/session` - Get current session
- NextAuth.js routes: `/api/auth/*`

### Transactions
- `GET /api/transactions` - List user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Categories
- `GET /api/categories` - List user categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Budgets
- `GET /api/budgets` - List user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

### Error Handling
- 401: Unauthorized (no session)
- 404: Resource not found
- 409: Conflict (duplicate budget)
- 500: Internal server error
- Consistent JSON error responses

---

## User Interface

### Design System
**Color Palette**
- Primary: Blue (#3b82f6)
- Background: White/Dark mode
- Cards: Subtle backgrounds
- Success: Green
- Warning: Yellow
- Error: Red
- Muted: Gray tones

**Typography**
- Font: Inter (system font)
- Headings: Bold, hierarchical sizing
- Body: Regular weight
- Labels: Medium weight
- Numbers: Tabular figures

**Spacing**
- Base unit: 0.25rem (4px)
- Card padding: 1rem-1.5rem
- Section spacing: 1.5rem-2rem
- Component gaps: 0.5rem-1rem

### Layout Structure
**Desktop Layout**
- Header navigation with logo and menu
- Main content area (max-width container)
- Sidebar for additional information
- User profile dropdown

**Mobile Layout**
- Bottom tab navigation (5 tabs)
- Full-width content
- Floating action buttons
- Swipe gestures support

### Navigation
**Desktop Navigation**
- Horizontal menu bar
- Logo/brand on left
- Navigation items in center
- User menu on right

**Mobile Navigation**
- Fixed bottom navigation
- 5 tabs: Home, Budget, Categories, Analytics, Achievements
- Active state indicators
- Icon + label design

### Key Pages
**Home Dashboard**
- 4-card summary grid
- Quick expense entry
- Recent transactions list
- Budget summary card

**Budget Management**
- Budget overview cards
- Create/edit budget forms
- Category-wise progress bars
- Spending alerts

**Categories**
- Grid view of categories
- Edit/delete actions on hover
- Create category dialog
- Icon and color pickers

**Transaction Form**
- Modal/dialog interface
- Income/expense toggle
- Amount input with currency
- Category selection
- Date picker
- Description field

### UI Components
**shadcn/ui Components Used**
- Button (variants: default, outline, ghost)
- Card (header, content, footer)
- Dialog (modal forms)
- Input (text, number, date)
- Select (dropdown menus)
- Progress (budget progress bars)
- Alert (error messages)
- Badge (status indicators)
- Skeleton (loading states)

**Custom Components**
- Navigation (desktop/mobile)
- AuthGuard (route protection)
- IconPicker (emoji selection)
- ColorPicker (color selection)
- CategoryEditDialog (CRUD operations)
- TransactionForm (transaction creation)
- BudgetOverview (budget dashboard)

---

## State Management

### React Query (TanStack Query)
**Queries**
- `useTransactions()` - Fetch user transactions
- `useCategories()` - Fetch user categories
- `useBudgets()` - Fetch user budgets

**Mutations**
- `useCreateTransaction()` - Create new transaction
- `useUpdateTransaction()` - Update existing transaction
- `useDeleteTransaction()` - Delete transaction
- `useCreateCategory()` - Create new category
- `useUpdateCategory()` - Update category
- `useDeleteCategory()` - Delete category
- `useCreateBudget()` - Create new budget
- `useUpdateBudget()` - Update budget
- `useDeleteBudget()` - Delete budget

**Cache Management**
- Automatic cache invalidation
- Background refetching
- Optimistic updates
- Error handling and retries

### NextAuth Session Management
- `useSession()` - Get current user session
- Server-side session validation
- JWT token management
- Automatic session refresh

### Local State (Zustand - Legacy)
- Gradually being replaced by React Query
- Used for UI state only
- Form state management
- Modal open/close states

---

## Deployment & Infrastructure

### Docker Configuration
**Standalone Deployment (Recommended)**
- Single container with SQLite
- No external dependencies
- Automatic database initialization
- Port 3001 (configurable)
- Volume mount for data persistence

**Docker Compose Deployment**
- Multi-container setup
- PostgreSQL database container
- Development environment
- Better for scaling

### Environment Variables
**Required**
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - JWT signing secret

**Optional**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `GITHUB_ID` - GitHub OAuth client ID
- `GITHUB_SECRET` - GitHub OAuth secret
- `PORT` - Application port (default: 3001)

### Production Considerations
**Security**
- Generate strong NEXTAUTH_SECRET
- Use HTTPS in production
- Secure database file permissions
- Rate limiting (future)

**Performance**
- Next.js standalone build
- Static asset optimization
- Database query optimization
- Caching strategies

**Monitoring**
- Container health checks
- Log aggregation
- Error tracking (future)
- Performance monitoring (future)

---

## Testing Strategy

### Test Categories
**Unit Tests**
- Utility functions (currency formatting)
- Component rendering
- Hook functionality
- API route handlers

**Integration Tests**
- Database operations
- API endpoint flows
- Authentication workflows
- Form submissions

**End-to-End Tests**
- User authentication
- Transaction creation flow
- Budget management
- Category management
- Mobile responsiveness

### Test Data
**Demo Data Creation**
- Default categories (6 categories)
- Sample transactions (income/expense)
- Sample budget (monthly food budget)
- Consistent user data

**Test Scenarios**
- New user onboarding
- Transaction CRUD operations
- Budget creation and tracking
- Category customization
- Mobile navigation
- Error handling

### Testing Tools (Future Implementation)
- Jest for unit tests
- React Testing Library for components
- Playwright for E2E tests
- Prisma test database
- Mock data factories

---

## Development Workflow

### File Structure (incomplete)
```
teen-budget-tracker/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (dashboard)/     # Dashboard routes
│   │   ├── api/            # API routes
│   │   ├── auth/           # Auth pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── categories/    # Category components
│   │   └── providers/     # Context providers
│   ├── lib/               # Utilities
│   │   ├── hooks/         # Custom hooks
│   │   ├── auth.ts        # NextAuth config
│   │   ├── currency.ts    # Currency utils
│   │   ├── prisma.ts      # Database client
│   │   └── utils.ts       # General utils
│   └── types/             # TypeScript types
├── prisma/                # Database schema
├── public/                # Static assets
├── docker/                # Docker configs
└── docs/                  # Documentation
```

### Development Command (if npm is used)
```bash
# Setup
npm install
npx prisma generate
npx prisma db push

# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:seed      # Seed database

# Docker
./build-standalone.sh    # Build standalone image
./run-standalone.sh      # Run standalone container
```

### Code Quality Standards
**TypeScript**
- Strict mode enabled
- No implicit any
- Interface over type aliases
- Proper error handling

**React**
- Functional components only
- Custom hooks for logic
- Proper dependency arrays
- Error boundaries

**Styling**
- Tailwind CSS utilities
- Component-scoped styles
- Responsive design patterns
- Dark mode support (prepared)

---

## Future Enhancements

### Phase 2 Features
**Savings Goals**
- Set financial targets
- Track progress
- Visual progress indicators
- Achievement rewards

**Analytics & Reports**
- Spending trends
- Category breakdowns
- Monthly/yearly reports
- Export functionality

**Gamification**
- Achievement system
- Saving streaks
- Badges and rewards
- Progress milestones

### Phase 3 Features
**Social Features**
- Family sharing
- Parent oversight
- Goal sharing
- Friendly competitions

**Advanced Budgeting**
- Envelope budgeting
- Automated categorization
- Smart spending alerts
- Predictive budgeting

**Educational Content**
- Financial literacy modules
- Budgeting tips
- Saving strategies
- Interactive tutorials

### Technical Improvements
**Performance**
- Database indexing
- Query optimization
- Lazy loading
- Image optimization

**Security**
- Rate limiting
- Input validation
- CSRF protection
- Security headers

**Accessibility**
- WCAG compliance
- Screen reader support
- Keyboard navigation
- High contrast mode

**Internationalization**
- Multi-language support
- Currency localization
- Date/time formatting
- Cultural considerations

---

## Critical Implementation Notes

### Demo Data Logic
- Demo user: `demo@teen-budget.app`
- Always create categories if missing
- Create sample data only if no transactions exist
- Consistent demo experience

### Database Initialization
- SQLite auto-creation in Docker
- Embedded schema creation SQL
- Foreign key constraints
- Proper indexes for performance

### Mobile Responsiveness
- Bottom navigation on mobile
- Touch-friendly interface
- Responsive grid layouts
- Proper viewport settings

### Error Handling
- Graceful degradation
- User-friendly error messages
- Logging for debugging
- Retry mechanisms

### Security Considerations
- Input sanitization
- SQL injection prevention
- XSS protection
- Session security

---

## Testing Checklist

### Core Functionality
- [ ] User can create demo account
- [ ] User can add income/expense transactions
- [ ] User can create/edit/delete categories
- [ ] User can set/modify budgets
- [ ] Dashboard shows correct calculations
- [ ] Currency formatting is consistent (EUR)

### User Experience
- [ ] Mobile navigation works properly
- [ ] Forms validate input correctly
- [ ] Loading states are shown
- [ ] Error messages are helpful
- [ ] Navigation is intuitive

### Technical Requirements
- [ ] Docker container starts correctly
- [ ] Database initializes properly
- [ ] API endpoints work as expected
- [ ] Authentication flow is secure
- [ ] Data persistence works

### Performance
- [ ] Page load times are acceptable
- [ ] Database queries are optimized
- [ ] Images are optimized
- [ ] Caching works correctly

### Cross-Browser Compatibility
- [ ] Works on Chrome/Safari/Firefox
- [ ] Mobile browsers supported
- [ ] Touch interactions work
- [ ] PWA features function

---
