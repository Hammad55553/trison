import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import SimpleLoader from '../components/SimpleLoader';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, isLoading, user, accessToken } = useSelector((state: RootState) => state.auth);

  console.log('RootNavigator: Auth state:', { 
    isAuthenticated, 
    isLoading, 
    hasUser: !!user, 
    hasToken: !!accessToken 
  });

  // Show loading while checking authentication status
  if (isLoading) {
    console.log('RootNavigator: Showing loader...');
    return <SimpleLoader message="Checking authentication..." />;
  }

  console.log('RootNavigator: Rendering navigation, isAuthenticated:', isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="ClientNavigator" component={ClientNavigator} />
        ) : (
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
