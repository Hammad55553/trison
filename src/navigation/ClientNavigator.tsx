import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ClientHome from '../screens/Client/Dashboard';
import Profile from '../screens/Client/ClientProfile';
import Dailyscan from '../screens/Client/Dailyscan';
import Spin from '../screens/Client/Spin';
import { RootStackParamList } from './Types';

const Stack = createStackNavigator<RootStackParamList>();

const ClientNavigator = () => (
  <Stack.Navigator
    initialRouteName="ClientHome"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="ClientHome" component={ClientHome} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Dailyscan" component={Dailyscan} />
    <Stack.Screen name="Spin" component={Spin} />
  </Stack.Navigator>
);

export default ClientNavigator;
