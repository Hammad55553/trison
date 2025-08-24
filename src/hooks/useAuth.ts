import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { 
  sendOTP, 
  verifyOTP, 
  login, 
  register, 
  logout, 
  getCurrentUser,
  checkAuthStatus,
  clearError 
} from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  return {
    // State
    user: auth.user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,

    // Actions
    sendOTP: (phoneNumber: string) => dispatch(sendOTP(phoneNumber) as any),
    verifyOTP: (phoneNumber: string, otp: string) => 
      dispatch(verifyOTP({ phoneNumber, otp }) as any),
    login: (phoneNumber: string, otp: string) => 
      dispatch(login({ phoneNumber, otp }) as any),
    register: (userData: any) => dispatch(register(userData) as any),
    logout: () => dispatch(logout() as any),
    getCurrentUser: () => dispatch(getCurrentUser() as any),
    checkAuthStatus: () => dispatch(checkAuthStatus() as any),
    clearError: () => dispatch(clearError()),

    // Computed values
    hasValidToken: !!auth.accessToken,
    userRole: auth.user?.role,
    userPoints: auth.user?.total_points || 0,
    isClient: auth.user?.role === 'client',
    isRetailer: auth.user?.role === 'retailer',
    isAdmin: auth.user?.role === 'admin',
  };
}; 