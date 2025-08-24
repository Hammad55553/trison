import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Video from 'react-native-video';
import SimpleLoader from '../../components/SimpleLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthFromLocalTokens } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';

// Storage keys from authService
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  IS_LOGGED_IN: 'isLoggedIn',
};

const SplashScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [navigationAttempts, setNavigationAttempts] = useState(0);
  
  // Get auth state to check if we need to navigate
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const checkLoginStatus = async () => {
      try {
        // Prevent multiple checks
        if (hasChecked || !isMounted) return;
        
        console.log('Splash: Starting authentication check...');
        
        // Wait for 3 seconds (splash video duration)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check if component is still mounted
        if (!isMounted) return;

        // Show loading while checking auth
        setIsCheckingAuth(true);
        console.log('Splash: Checking authentication status...');

        // Set a timeout to prevent getting stuck in loading state
        timeoutId = setTimeout(() => {
          if (isMounted && isCheckingAuth) {
            console.log('Splash: Timeout reached, forcing navigation to Login');
            setIsCheckingAuth(false);
            setHasChecked(true);
            try {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            } catch (error) {
              console.error('Splash: Timeout navigation failed:', error);
              // Try regular navigation as fallback
              try {
                navigation.navigate('Login' as never);
              } catch (navigateError) {
                console.error('Splash: Timeout regular navigation also failed:', navigateError);
              }
            }
          }
        }, 5000); // 5 second timeout

        // Directly check for tokens in AsyncStorage
        const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        // Clear timeout since we got the result
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        console.log('Splash: Token check result:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          isLoggedIn,
          accessTokenLength: accessToken ? accessToken.length : 0,
          refreshTokenLength: refreshToken ? refreshToken.length : 0,
          navigationAttempts
        });

        // Mark as checked to prevent multiple attempts
        setHasChecked(true);

        // If user has valid tokens, update auth state to trigger navigation
        if (accessToken && refreshToken && 
            accessToken.trim() !== '' && refreshToken.trim() !== '' && 
            isLoggedIn === 'true') {
          console.log('Splash: User has valid tokens, updating auth state for Dashboard');
          // Update auth state to trigger navigation to Dashboard
          const result = await dispatch(setAuthFromLocalTokens() as any);
          console.log('Splash: setAuthFromLocalTokens result:', result);
          // Reset loading state
          setIsCheckingAuth(false);
        } else {
          console.log('Splash: No valid tokens found, navigating to Login within AuthNavigator');
          // Reset loading state first
          setIsCheckingAuth(false);
          // Small delay for smooth transition
          await new Promise(resolve => setTimeout(resolve, 300));
          // Navigate to Login screen within AuthNavigator using CommonActions
          try {
            console.log('Splash: Attempting to navigate to Login using CommonActions...');
            setNavigationAttempts(prev => prev + 1);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
            console.log('Splash: Successfully navigated to Login');
          } catch (navError) {
            console.error('Splash: CommonActions navigation to Login failed:', navError);
            // If CommonActions fails, try regular navigation
            try {
              setNavigationAttempts(prev => prev + 1);
              navigation.navigate('Login' as never);
            } catch (navigateError) {
              console.error('Splash: Regular navigation to Login also failed:', navigateError);
              // Last resort: try to reset the stack
              try {
                setNavigationAttempts(prev => prev + 1);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' as never }],
                });
              } catch (resetError) {
                console.error('Splash: Reset navigation also failed:', resetError);
              }
            }
          }
        }
        
      } catch (error) {
        console.error('Splash: Error checking auth status:', error);
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // On error, navigate to Login screen
        if (!hasChecked && isMounted) {
          setHasChecked(true);
          setIsCheckingAuth(false);
          try {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          } catch (error) {
            console.error('Splash: Error CommonActions navigation failed:', error);
            // Try regular navigation as fallback
            try {
              navigation.navigate('Login' as never);
            } catch (navigateError) {
              console.error('Splash: Error regular navigation also failed:', navigateError);
              // Last resort: try to reset the stack
              try {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' as never }],
                });
              } catch (resetError) {
                console.error('Splash: Error reset navigation also failed:', resetError);
              }
            }
          }
        }
      }
    };

    checkLoginStatus();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [dispatch, hasChecked, navigation, isCheckingAuth]);

  // If user is authenticated, we don't need to show anything
  // The RootNavigator will handle the navigation
  if (isAuthenticated) {
    console.log('Splash: User is authenticated, returning null to let RootNavigator handle navigation');
    return null;
  }

  // Show loading after video while checking auth
  if (isCheckingAuth) {
    return <SimpleLoader message="Checking authentication..." />;
  }

  // Fallback: if we've checked but still showing splash, force navigation to Login
  if (hasChecked && !isAuthenticated) {
    console.log('Splash: Fallback - forcing navigation to Login');
    // Use setTimeout to avoid navigation during render
    setTimeout(() => {
      try {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      } catch (error) {
        console.error('Splash: Fallback navigation failed:', error);
        // Try regular navigation as fallback
        try {
          navigation.navigate('Login' as never);
        } catch (navigateError) {
          console.error('Splash: Fallback regular navigation also failed:', navigateError);
        }
      }
    }, 100);
    return <SimpleLoader message="Redirecting to Login..." />;
  }

  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/images/splash.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        paused={false}
        repeat={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default SplashScreen;
