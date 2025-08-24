# Authentication System Guide

## Overview
Your React Native app now has a complete global authentication system using Redux and AsyncStorage. When a user logs in, their token is automatically stored and available throughout the entire app.

## How It Works

### 1. Token Storage
- **Access Token**: Stored in AsyncStorage and Redux state
- **Refresh Token**: Automatically handled for token renewal
- **User Data**: Cached locally for offline access
- **Auto-login**: App remembers user sessions

### 2. Global State Access
The authentication state is available in every component through Redux.

## Usage Examples

### Basic Authentication Check
```tsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { isAuthenticated, user, accessToken } = useAuth();

  if (!isAuthenticated) {
    return <Text>Please login first</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.first_name}!</Text>
      <Text>Token: {accessToken ? 'Valid' : 'Invalid'}</Text>
    </View>
  );
};
```

### Role-Based Access Control
```tsx
const ProtectedComponent = () => {
  const { isClient, isRetailer, isAdmin, userRole } = useAuth();

  if (isClient) {
    return <ClientDashboard />;
  }

  if (isRetailer) {
    return <RetailerDashboard />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <Text>Access Denied</Text>;
};
```

### Making Authenticated API Calls
```tsx
import { authenticatedRequestWithRefresh } from '../services/authService';

const fetchUserData = async () => {
  try {
    const response = await authenticatedRequestWithRefresh('/auth/me');
    // Token is automatically included and refreshed if needed
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

### Logout Functionality
```tsx
const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // This clears all tokens and redirects to login
  };

  return (
    <TouchableOpacity onPress={handleLogout}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
};
```

## Available Auth State Properties

### User Information
- `user`: Complete user object with profile data
- `userRole`: User's role (client, retailer, admin)
- `userPoints`: User's total points
- `isClient`, `isRetailer`, `isAdmin`: Boolean role checks

### Authentication Status
- `isAuthenticated`: Whether user is logged in
- `accessToken`: Current access token
- `refreshToken`: Current refresh token
- `hasValidToken`: Boolean token validity check

### Loading & Error States
- `isLoading`: Loading state for auth operations
- `error`: Any authentication errors

## Available Actions

### Authentication Actions
- `sendOTP(phoneNumber)`: Send OTP to phone
- `verifyOTP(phoneNumber, otp)`: Verify OTP and login
- `login(phoneNumber, otp)`: Login with phone and OTP
- `register(userData)`: Register new user
- `logout()`: Logout and clear tokens

### User Management
- `getCurrentUser()`: Fetch current user data
- `checkAuthStatus()`: Check if user is still logged in
- `clearError()`: Clear any auth errors

## Token Management

### Automatic Token Handling
- Tokens are automatically stored when logging in
- Access tokens are included in all authenticated API calls
- Refresh tokens automatically renew expired access tokens
- Failed API calls due to expired tokens are automatically retried

### Manual Token Access
```tsx
import { getAccessToken, getRefreshToken } from '../services/authService';

const getTokens = async () => {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  
  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);
};
```

## Security Features

### Token Security
- Tokens are stored securely in AsyncStorage
- Automatic token refresh prevents session expiration
- Logout clears all stored tokens
- Failed authentication redirects to login

### API Security
- All authenticated requests include Bearer token
- Automatic 401 handling with token refresh
- Secure token storage and transmission

## Best Practices

### 1. Always Check Authentication
```tsx
const ProtectedScreen = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <NavigateToLogin />;
  }
  
  return <ProtectedContent />;
};
```

### 2. Use Role-Based Access
```tsx
const Dashboard = () => {
  const { isClient, isRetailer } = useAuth();
  
  if (isClient) return <ClientDashboard />;
  if (isRetailer) return <RetailerDashboard />;
  
  return <AccessDenied />;
};
```

### 3. Handle Loading States
```tsx
const UserProfile = () => {
  const { isLoading, user } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;
  
  return <ProfileContent user={user} />;
};
```

### 4. Error Handling
```tsx
const LoginForm = () => {
  const { error, clearError } = useAuth();
  
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);
  
  // ... rest of component
};
```

## Troubleshooting

### Common Issues

1. **Token Not Stored**: Check if `storeTokens` is called after successful login
2. **API Calls Fail**: Verify token is included in Authorization header
3. **Auto-login Not Working**: Check AsyncStorage permissions and token validity
4. **Role Access Issues**: Verify user role is properly set in backend

### Debug Information
Use the `AuthStatus` component to see current authentication state:
```tsx
import AuthStatus from '../components/AuthStatus';

// Add this to any screen to debug auth state
<AuthStatus />
```

## Integration with Navigation

The authentication state automatically integrates with your navigation system. Users are redirected based on their authentication status and role.

### Navigation Guards
```tsx
// In your navigation setup
const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  if (userRole === 'client') {
    return <ClientStack />;
  }

  if (userRole === 'retailer') {
    return <RetailerStack />;
  }

  return <AdminStack />;
};
```

This system provides a robust, secure, and easy-to-use authentication foundation for your entire React Native application! 