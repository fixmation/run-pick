import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define interfaces for user data and authentication context
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: SignUpData) => Promise<void>; // Changed from separate params to object
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null; // Added error state
}

// Define types for login and signup
interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  username: string;
  email: string;
  password: string;
  role: string;
  adminSecret?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for error messages

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check authentication status
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors
      const response = await fetch('/api/auth/user', { // Changed endpoint to '/api/auth/user' as per common practice
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache' // Ensure we get fresh data
        }
      });

      console.log('Auth status response:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User authenticated successfully:', userData.username, 'Role:', userData.role);
        setUser(userData);
      } else {
        console.log('❌ Auth check failed:', response.status);
        setUser(null);
        // Optionally set an error message here if the status indicates a specific issue
        // if (response.status === 401) {
        //   setError('Session expired. Please log in again.');
        // }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setError('An error occurred while checking authentication status.'); // Set a generic error message
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        // Attempt to parse error message from response body, fall back to a default
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      console.log('✅ Login successful:', data.user.username);

      // Redirect to role-specific dashboard
      setTimeout(() => {
        switch (data.user.role) {
          case 'admin':
            window.location.href = '/admin-dashboard';
            break;
          case 'driver':
            window.location.href = '/driver-dashboard';
            break;
          case 'vendor':
            window.location.href = '/vendor-dashboard';
            break;
          case 'customer':
          default:
            window.location.href = '/customer-dashboard';
            break;
        }
      }, 100); // Small delay to ensure state update before redirect
    } catch (error) {
      // Handle errors by setting the error state and re-throwing
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ Login error:', errorMessage);
      setError(errorMessage);
      throw error; // Re-throw the error to be handled by the caller
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: SignUpData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      // Prepare the request body, including adminSecret if role is admin
      const body: any = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password, // Assuming password and confirmPassword are the same for registration
        role: userData.role
      };

      if (userData.role === "admin" && userData.adminSecret) {
        body.adminSecret = userData.adminSecret;
      }

      const response = await fetch('/api/auth/register', { // Assuming endpoint is '/api/auth/register'
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Attempt to parse error message from response body, fall back to a default
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      console.log('✅ Registration successful:', data.user.username);

      // Redirect to role-specific dashboard
      setTimeout(() => {
        switch (data.user.role) {
          case 'admin':
            window.location.href = '/admin-dashboard';
            break;
          case 'driver':
            window.location.href = '/driver-dashboard';
            break;
          case 'vendor':
            window.location.href = '/vendor-dashboard';
            break;
          case 'customer':
          default:
            window.location.href = '/customer-dashboard';
            break;
        }
      }, 100); // Small delay to ensure state update before redirect
    } catch (error) {
      // Handle errors by setting the error state and re-throwing
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      console.error('❌ Registration error:', errorMessage);
      setError(errorMessage);
      throw error; // Re-throw the error to be handled by the caller
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      setError('An error occurred during logout.'); // Set error message for logout failure
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password function
  const forgotPassword = async (email: string) => {
    try {
      // setIsLoading(true); // Consider if loading state should be managed here
      setError(null); // Clear previous errors
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to send password reset email');
      }
      // Consider returning a success message or status
      // return { success: true, message: 'Password reset email sent successfully.' };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email';
      setError(errorMessage);
      throw error;
    } finally {
      // setIsLoading(false);
    }
  };

  // Reset Password function
  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      // setIsLoading(true); // Consider if loading state should be managed here
      setError(null); // Clear previous errors
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password, confirmPassword }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to reset password');
      }
      // Consider returning a success message or status
      // return { success: true, message: 'Password reset successfully.' };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);
      throw error;
    } finally {
      // setIsLoading(false);
    }
  };

  // Value provided by the context
  const value = {
    user,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    isLoading,
    error // Provide error state to the context
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};