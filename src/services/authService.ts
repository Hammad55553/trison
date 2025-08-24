import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - Using local server for development
// const API_BASE_URL = 'http://localhost:8000/api/v1';
const API_BASE_URL = 'https://dd41f2c65be9.ngrok-free.app/api/v1'; // ngrok URL (commented out)

// Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  IS_LOGGED_IN: 'isLoggedIn',
};

// Types
export interface LoginRequest {
  phone_number: string;
  otp: string;
}

export interface RegisterRequest {
  phone_number: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  referral_code?: string;
}

export interface OTPRequest {
  phone_number: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user_id: string;
    role: string;
  };
}

export interface UserData {
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

// API Functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

const authenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Authentication Functions
export const sendOTP = async (phoneNumber: string): Promise<AuthResponse> => {
  return apiRequest('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
};

export const verifyOTP = async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
  return apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber, otp }),
  });
};

export const login = async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber, otp }),
  });
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
};

export const logout = async (): Promise<void> => {
  try {
    const refreshToken = await getRefreshToken();
    const accessToken = await getAccessToken();
    
    if (refreshToken && accessToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await clearAllTokens();
  }
};

export const getCurrentUser = async (): Promise<UserData> => {
  const response = await authenticatedRequest('/auth/me');
  return response.data;
};

// Token Management
export const storeTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.IS_LOGGED_IN, 'true'],
    ]);
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('AuthService: getAccessToken result:', { hasToken: !!token });
    return token;
  } catch (error) {
    console.error('AuthService: Error getting access token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    console.log('AuthService: getRefreshToken result:', { hasToken: !!token });
    return token;
  } catch (error) {
    console.error('AuthService: Error getting refresh token:', error);
    return null;
  }
};

export const clearAllTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.IS_LOGGED_IN,
    ]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    const loginStatus = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    const result = !!(token && loginStatus === 'true');
    console.log('AuthService: isLoggedIn check:', { hasToken: !!token, loginStatus, result });
    return result;
  } catch (error) {
    console.error('AuthService: Error checking login status:', error);
    return false;
  }
};

// User Data Management
export const storeUserData = async (userData: UserData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const result = userData ? JSON.parse(userData) : null;
    console.log('AuthService: getUserData result:', { hasUserData: !!result });
    return result;
  } catch (error) {
    console.error('AuthService: Error getting user data:', error);
    return null;
  }
};

// Token Refresh Logic
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await refreshToken();
    if (response.success && response.data) {
      await storeTokens(response.data.access_token, response.data.refresh_token);
      return response.data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    await clearAllTokens();
    return null;
  }
};

// Auto-refresh token when making authenticated requests
export const authenticatedRequestWithRefresh = async (endpoint: string, options: RequestInit = {}) => {
  try {
    return await authenticatedRequest(endpoint, options);
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('token')) {
      // Token expired, try to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        return await authenticatedRequest(endpoint, options);
      }
    }
    throw error;
  }
}; 