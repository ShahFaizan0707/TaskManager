// context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  IAuthContextType, 
  IAuthState, 
  ILoginCredentials, 
  IRegisterData,
  IProfileUpdateData,
  IAddressData
} from '@/lib/types/auth';
import authApi, { setAuthToken } from "@/lib/api/authApi";

// Initial state
const initialState: IAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
type AuthAction =
  | { type: 'LOGIN_REQUEST' | 'REGISTER_REQUEST' | 'PROFILE_REQUEST' | 'LOGOUT' | 'CLEAR_ERROR' }
  | { type: 'LOGIN_SUCCESS' | 'REGISTER_SUCCESS' | 'PROFILE_SUCCESS'; payload: { user: any } }
  | { type: 'LOGIN_FAILURE' | 'REGISTER_FAILURE' | 'PROFILE_FAILURE'; payload: { error: string } }
  | { type: 'UPDATE_PROFILE_SUCCESS'; payload: { user: any } }
  | { type: 'UPDATE_ADDRESS_SUCCESS'; payload: { address: any } };

// Reducer function
const authReducer = (state: IAuthState, action: AuthAction): IAuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
    case 'PROFILE_REQUEST':
      return { ...state, isLoading: true, error: null };
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null
      };
    
    case 'PROFILE_SUCCESS':
    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        error: null
      };
    
    case 'UPDATE_ADDRESS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        // Ensure we're maintaining the user object structure and only updating the address
        user: state.user ? {
          ...state.user,
          address: action.payload.address
        } : null,
        error: null
      };
    
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'PROFILE_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        isAuthenticated: false
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};


// Create context
const AuthContext = createContext<IAuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      console.log('Initial load - Token exists:', !!token);
      
      if (token) {
        try {
          dispatch({ type: 'PROFILE_REQUEST' });
          console.log('Fetching user profile...');
          
          // Let's verify the token is being set in headers
          setAuthToken(token);
          
          const user = await authApi.getUserProfile();
          console.log('User profile fetched successfully:', user);
          
          dispatch({ 
            type: 'LOGIN_SUCCESS',  // Changed from PROFILE_SUCCESS
            payload: { user } 
          });
        } catch (error) {
          console.error('Failed to load user profile:', error);
          dispatch({ 
            type: 'PROFILE_FAILURE', 
            payload: { error: 'Authentication expired. Please login again.' } 
          });
          setAuthToken(null);
        }
      } else {
        console.log('No token found, logging out');
        dispatch({ type: 'LOGOUT' });
      }
    };
  
    loadUser();
  }, []);

  // Auth methods
  const login = async (credentials: ILoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const { user, token } = await authApi.login(credentials);
      setAuthToken(token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
      throw new Error(errorMessage);
    }
  };

  const register = async (data: IRegisterData) => {
    try {
      dispatch({ type: 'REGISTER_REQUEST' });
      const { user, token } = await authApi.register(data);
      setAuthToken(token);
      dispatch({ type: 'REGISTER_SUCCESS', payload: { user } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      dispatch({ type: 'REGISTER_FAILURE', payload: { error: errorMessage } });
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async (data: IProfileUpdateData) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });
      const updatedUser = await authApi.updateUserProfile(data);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: { user: updatedUser } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Profile update failed.';
      dispatch({ type: 'PROFILE_FAILURE', payload: { error: errorMessage } });
      throw new Error(errorMessage);
    }
  };

  const updateAddress = async (data: IAddressData) => {
    try {
      dispatch({ type: 'PROFILE_REQUEST' });
      const address = await authApi.updateUserAddress(data);
      dispatch({ type: 'UPDATE_ADDRESS_SUCCESS', payload: { address } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Address update failed.';
      dispatch({ type: 'PROFILE_FAILURE', payload: { error: errorMessage } });
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
    window.location.href = "/login"
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateProfile,
      updateAddress,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): IAuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};