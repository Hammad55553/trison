import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // ✅ Import this
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const Stack = createStackNavigator(); // ✅ Initialize Stack

const RootNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="ClientNavigator" component={ClientNavigator} />
        ) : (
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
