import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SignInPage from '../page'

// Mock the dependencies
jest.mock('next-auth/react')
jest.mock('next/navigation')

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const mockPush = jest.fn()

describe('SignInPage', () => {
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

  it('should render sign in form with demo button', () => {
    render(<SignInPage />)

    expect(screen.getByRole('heading', { name: /teen budget tracker/i })).toBeInTheDocument()
    expect(screen.getByText(/learn financial literacy through smart budgeting/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try demo account/i })).toBeInTheDocument()
    expect(screen.getByText(/no registration required/i)).toBeInTheDocument()
  })

  it('should call signIn when demo button is clicked', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null, url: '/', status: 200 })

    render(<SignInPage />)

    const demoButton = screen.getByRole('button', { name: /try demo account/i })
    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('demo', { redirect: false })
    })
  })

  it('should show loading state when signing in', async () => {
    // Make signIn return a promise that doesn't resolve immediately
    let resolveSignIn: (value: any) => void
    mockSignIn.mockReturnValue(
      new Promise(resolve => {
        resolveSignIn = resolve
      })
    )

    render(<SignInPage />)

    const demoButton = screen.getByRole('button', { name: /try demo account/i })
    fireEvent.click(demoButton)

    // Should show loading state
    expect(screen.getByText(/signing in.../i)).toBeInTheDocument()
    expect(demoButton).toBeDisabled()

    // Resolve the promise
    resolveSignIn!({ ok: true, error: null, url: '/', status: 200 })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should redirect to home on successful signin', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null, url: '/', status: 200 })

    render(<SignInPage />)

    const demoButton = screen.getByRole('button', { name: /try demo account/i })
    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should show error message on failed signin', async () => {
    mockSignIn.mockResolvedValue({ 
      ok: false, 
      error: 'CredentialsSignin', 
      url: null, 
      status: 401 
    })

    render(<SignInPage />)

    const demoButton = screen.getByRole('button', { name: /try demo account/i })
    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to sign in. please try again./i)).toBeInTheDocument()
    })

    // Button should be enabled again
    expect(demoButton).not.toBeDisabled()
  })

  it('should handle signin exception', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(<SignInPage />)

    const demoButton = screen.getByRole('button', { name: /try demo account/i })
    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred./i)).toBeInTheDocument()
    })
  })

  it('should clear error when retrying signin', async () => {
    // First call fails
    mockSignIn.mockResolvedValueOnce({ 
      ok: false, 
      error: 'CredentialsSignin', 
      url: null, 
      status: 401 
    })

    render(<SignInPage />)

    const demoButton = screen.getByRole('button', { name: /try demo account/i })
    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to sign in. please try again./i)).toBeInTheDocument()
    })

    // Second call succeeds
    mockSignIn.mockResolvedValueOnce({ ok: true, error: null, url: '/', status: 200 })

    fireEvent.click(demoButton)

    // Error should be cleared during loading
    await waitFor(() => {
      expect(screen.queryByText(/failed to sign in. please try again./i)).not.toBeInTheDocument()
    })
  })
}