import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '../auth-guard'

// Mock the hooks
jest.mock('next-auth/react')
jest.mock('next/navigation')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const mockPush = jest.fn()

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    })
  })

  it('should show loading skeleton when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    // Should show skeleton, not the protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    // Check for skeleton elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should redirect to signin when user is unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(mockPush).toHaveBeenCalledWith('/auth/signin')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when user is authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'demo@teen-budget.app',
          name: 'Demo User',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should handle session status changes appropriately', () => {
    // Start with loading
    const { rerender } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })
    rerender(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()

    // Change to authenticated
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'demo@teen-budget.app',
          name: 'Demo User',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    })
    rerender(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
}