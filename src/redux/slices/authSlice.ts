import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../../services/authService';

interface UserData {
  id: string;
  phone_number: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_verified: boolean;
  total_points: number;
  created_at: string;
  last_login?: string;
}

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const response = await authService.sendOTP(phoneNumber);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(phoneNumber, otp);
      if (response.success && response.data) {
        await authService.storeTokens(response.data.access_token, response.data.refresh_token);
        return response.data;
      }
      throw new Error('OTP verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify OTP');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(phoneNumber, otp);
      if (response.success && response.data) {
        await authService.storeTokens(response.data.access_token, response.data.refresh_token);
        return response.data;
      }
      throw new Error('Login failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        await authService.storeTokens(response.data.access_token, response.data.refresh_token);
        return response.data;
      }
      throw new Error('Registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await authService.getCurrentUser();
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user data');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        const accessToken = await authService.getAccessToken();
        const refreshToken = await authService.getRefreshToken();
        const userData = await authService.getUserData();
        
        // If we have tokens but no user data, try to fetch it
        if (accessToken && refreshToken && !userData) {
          try {
            const currentUser = await authService.getCurrentUser();
            await authService.storeUserData(currentUser);
            return {
              accessToken,
              refreshToken,
              userData: currentUser,
            };
          } catch (userError) {
            console.error('Error fetching user data:', userError);
            // Still return tokens even if user data fetch fails
            return {
              accessToken,
              refreshToken,
              userData: null,
            };
          }
        }
        
        return {
          accessToken,
          refreshToken,
          userData,
        };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check auth status');
    }
  }
);

export const setAuthFromLocalTokens = createAsyncThunk(
  'auth/setAuthFromLocalTokens',
  async (_, { rejectWithValue }) => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        const accessToken = await authService.getAccessToken();
        const refreshToken = await authService.getRefreshToken();
        const userData = await authService.getUserData();
        
        return {
          accessToken,
          refreshToken,
          userData,
        };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get local auth data');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Auth Status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        console.log('AuthSlice: checkAuthStatus pending');
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        console.log('AuthSlice: checkAuthStatus fulfilled with payload:', action.payload);
        state.isLoading = false;
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.userData;
          state.isAuthenticated = true;
          
          // Store user data in AsyncStorage if available
          if (action.payload.userData) {
            authService.storeUserData(action.payload.userData);
          }
        }
        console.log('AuthSlice: Final state after checkAuthStatus:', {
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          hasToken: !!state.accessToken
        });
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        console.log('AuthSlice: checkAuthStatus rejected with error:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Set Auth From Local Tokens
    builder
      .addCase(setAuthFromLocalTokens.pending, (state) => {
        console.log('AuthSlice: setAuthFromLocalTokens pending');
        state.isLoading = true;
      })
      .addCase(setAuthFromLocalTokens.fulfilled, (state, action) => {
        console.log('AuthSlice: setAuthFromLocalTokens fulfilled with payload:', action.payload);
        state.isLoading = false;
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.userData;
          state.isAuthenticated = true;
        }
        console.log('AuthSlice: Final state after setAuthFromLocalTokens:', {
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          hasToken: !!state.accessToken
        });
      })
      .addCase(setAuthFromLocalTokens.rejected, (state, action) => {
        console.log('AuthSlice: setAuthFromLocalTokens rejected with error:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;