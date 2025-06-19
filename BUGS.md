# Teen Budget Tracker - Bug Documentation

This file tracks known bugs, their status, and resolution steps.

## Active Bugs

None at this time.

## Recently Fixed Bugs

### BUG-008: Multi-architecture Docker build fails on AMD64 due to Prisma generation issue
- **Status**: ✅ Fixed
- **Priority**: Medium
- **Description**: Docker buildx multi-platform builds fail on AMD64 architecture during Prisma client generation with "assertion failed" error
- **Impact**: Cannot create universal multi-arch images, limiting deployment flexibility
- **Error**: `assertion failed [block != nullptr]: BasicBlock requested for unrecognized address (BuilderBase.h:557 block_for_offset)`
- **Root Cause**: Known issue with Prisma binary generation in multi-arch Docker builds on certain AMD64 environments
- **Resolution**: Build separate architecture-specific images and combine using multi-arch manifest
- **Fix Steps Applied**:
  1. Built AMD64-specific image: `tigreroll/teen-budget-tracker:v1.0.12-amd64`
  2. Built ARM64-specific image: `tigreroll/teen-budget-tracker:v1.0.12-arm64`
  3. Created multi-arch manifest combining both architectures
  4. Updated main tags (v1.0.12, latest) to use multi-arch manifest
  5. Verified both AMD64 and ARM64 compatibility
- **Result**: Multi-architecture image now available supporting both AMD64 and ARM64 platforms
- **Files Modified**: None (deployment strategy improvement)

## Recently Fixed Bugs

### BUG-007: Budget Overview API limit exceeded causing transaction fetch failures
- **Status**: ✅ Fixed
- **Priority**: High
- **Description**: Budget Overview was requesting 1000 transactions but API has maximum limit of 100, causing "Number must be less than or equal to 100" validation errors
- **Root Cause**: Hard-coded limit=1000 in budget overview hook exceeded API validation limit
- **Fix Steps**:
  1. Changed limit from 1000 to 100 in `src/hooks/use-budget-overview.ts`
  2. This provides sufficient transactions for budget calculations while staying within API limits
- **Files Modified**:
  - `src/hooks/use-budget-overview.ts` - Changed limit parameter from 1000 to 100 (line 55)

### BUG-006: Transactions do not count into budget consumption
- **Status**: ✅ Fixed
- **Priority**: High
- **Description**: Budget Overview was showing incorrect spending amounts - transactions were not being properly counted against budget categories
- **Root Cause**: Date mismatch between sample transactions and budget periods. Sample transactions were created relative to "now" (past days) while budgets were created for current month periods
- **Fix Steps**:
  1. Modified `prisma/seed.ts` to create sample transactions within the current month period to align with budget dates
  2. Changed transaction date generation from `Date.now() - X days` to `currentMonthStart + X days`
  3. Ensured all sample expense transactions fall within the budget period for accurate calculations
- **Files Modified**:
  - `prisma/seed.ts` - Fixed sample transaction date generation (lines 137-177)

### BUG-005: Budget Overview not incorporating transactions even after creating budgets
- **Status**: ✅ Fixed
- **Priority**: High
- **Description**: Budget Overview was showing "bogus numbers" and not incorporating transactions properly
- **Root Cause**: Multiple issues:
  1. No sample budgets in seed data
  2. Date range fetching logic was incorrect in use-budget-overview.ts
- **Fix Steps**:
  1. Added `createSampleBudgets()` function in `prisma/seed.ts`
  2. Fixed date range logic in `src/hooks/use-budget-overview.ts` (lines 75-85)
  3. Corrected transaction filtering to match budget periods exactly
- **Files Modified**:
  - `prisma/seed.ts` - Added sample budget creation
  - `src/hooks/use-budget-overview.ts` - Fixed date range filtering

### BUG-004: Recent Transactions not updating when transactions are deleted
- **Status**: ✅ Fixed
- **Priority**: Medium
- **Description**: Dashboard recent transactions section not refreshing after transaction deletion
- **Root Cause**: Missing cache invalidation for 'recent-transactions' query
- **Fix Steps**:
  1. Added cache invalidation in transaction delete mutation
  2. Added invalidation for both 'recent-transactions' and 'budget-overview' queries
- **Files Modified**:
  - `src/components/transactions/transaction-form.tsx` - Added queryClient.invalidateQueries calls

### BUG-003: Category deletion causing all fields to show '-' in popup
- **Status**: ✅ Fixed
- **Priority**: Medium  
- **Description**: When deleting categories in transaction form popup, all fields would show '-'
- **Root Cause**: Form state not being properly reset after category deletion
- **Fix Steps**:
  1. Added proper form reset logic in category management
  2. Ensured form data clears when categories are removed
- **Files Modified**: Various form components

### BUG-002: Dashboard recent transactions not showing
- **Status**: ✅ Fixed
- **Priority**: High
- **Description**: Recent transactions were not displaying on dashboard despite transactions existing
- **Root Cause**: Query key mismatch and cache invalidation issues
- **Fix Steps**:
  1. Fixed query key consistency
  2. Added proper cache invalidation
  3. Updated data fetching logic
- **Files Modified**: Dashboard and transaction components

### BUG-001: 502 Bad Gateway on Synology deployment
- **Status**: ✅ Fixed
- **Priority**: High
- **Description**: Container deployment on Synology NAS was failing with 502 errors
- **Root Cause**: Health check using wrong address and missing dependencies
- **Fix Steps**:
  1. Updated health check to use 0.0.0.0 instead of localhost
  2. Added missing dependencies (tsx, sqlite3, bcryptjs)
  3. Fixed Docker build permissions and entrypoint script
- **Files Modified**:
  - `Dockerfile.simple` - Added missing dependencies
  - `docker-entrypoint.sh` - Fixed startup script
  - Various docker-compose files

## Bug Report Template

When reporting new bugs, please use this format:

```markdown
### BUG-XXX: [Brief Description]
- **Status**: 🔴 Open
- **Priority**: [High/Medium/Low]
- **Description**: [Detailed description of the issue]
- **Impact**: [How this affects users]
- **Steps to Reproduce**:
  1. Step 1
  2. Step 2
  3. Expected vs Actual result
- **Root Cause**: [To be investigated/Known cause]
- **Fix Steps**: [Planned or completed fix steps]
- **Files Modified**: [List of files changed to fix the bug]
```

## Notes

- All bugs should be tracked in this file until resolution
- Include commit hashes when bugs are fixed for reference
- Update status and add resolution details when bugs are closed
- Cross-reference with GitHub issues if using external issue tracking