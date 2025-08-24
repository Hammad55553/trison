import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ClientHome from '../screens/Client/Dashboard';
import Profile from '../screens/Client/ClientProfile';
import Dailyscan from '../screens/Client/Dailyscan';
import Spin from '../screens/Client/Spin';
import ScanQR from '../screens/Client/ScanQR';
import ComingSoon from '../components/ComingSoon';
import { RootStackParamList } from './Types';

const Stack = createStackNavigator<RootStackParamList>();

const ClientNavigator = () => {
  console.log('ClientNavigator: Rendering...');
  
  return (
  <Stack.Navigator
    initialRouteName="ClientHome"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="ClientHome" component={ClientHome} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Dailyscan" component={Dailyscan} />
    <Stack.Screen name="Spin" component={Spin} />
    <Stack.Screen name="ScanQR" component={ScanQR} />
    
    {/* Footer Navigation Screens */}
    <Stack.Screen 
      name="Rewards" 
      component={() => (
        <ComingSoon 
          title="Rewards & Points"
          description="Earn points by scanning QR codes and unlock amazing rewards! Track your progress and redeem points for exclusive benefits."
          icon="star-circle"
          iconColor="#FFC300"
        />
      )} 
    />
    <Stack.Screen 
      name="History" 
      component={() => (
        <ComingSoon 
          title="Scan History"
          description="View all your previous QR code scans, track your scanning activity, and manage your scan history."
          icon="history"
          iconColor="#4CAF50"
        />
      )} 
    />

    {/* Dashboard Inaam Bazaar Screens */}
    <Stack.Screen 
      name="ItemSchemes" 
      component={() => (
        <ComingSoon 
          title="Item Schemes"
          description="Explore exciting schemes and offers on various products. Get special discounts and exclusive deals!"
          icon="gift-outline"
          iconColor="#E91E63"
        />
      )} 
    />
    <Stack.Screen 
      name="QRDetails" 
      component={() => (
        <ComingSoon 
          title="QR Code Details"
          description="View detailed information about your scanned QR codes, including product details and special offers."
          icon="qrcode"
          iconColor="#2196F3"
        />
      )} 
    />

    {/* Dashboard Mazeed Options Screens */}
    <Stack.Screen 
      name="ShopBranding" 
      component={() => (
        <ComingSoon 
          title="Shop Branding Request"
          description="Request custom branding materials for your shop. Get professional signage and promotional materials."
          icon="store"
          iconColor="#9C27B0"
        />
      )} 
    />
    <Stack.Screen 
      name="Complaints" 
      component={() => (
        <ComingSoon 
          title="Complaints & Feedback"
          description="Submit complaints, suggestions, or feedback. We're here to help improve your experience."
          icon="message-alert"
          iconColor="#FF5722"
        />
      )} 
    />
    <Stack.Screen 
      name="Claims" 
      component={() => (
        <ComingSoon 
          title="Claims & Support"
          description="Submit claims for damaged products or request support for any issues you're facing."
          icon="shield-check"
          iconColor="#4CAF50"
        />
      )} 
    />

    {/* Dashboard Cash Bhejein Screen */}
    <Stack.Screen 
      name="CashBhejein" 
      component={() => (
        <ComingSoon 
          title="Cash Bhejein"
          description="Send money to your khaata (account) securely and instantly. Fast and reliable money transfer service."
          icon="cash-multiple"
          iconColor="#FF9800"
        />
      )} 
    />

    {/* Profile Options Screens */}
    <Stack.Screen 
      name="PersonalInformation" 
      component={() => (
        <ComingSoon 
          title="Personal Information"
          description="Update your personal details, contact information, and account settings."
          icon="account-edit"
          iconColor="#607D8B"
        />
      )} 
    />
    <Stack.Screen 
      name="TransactionHistory" 
      component={() => (
        <ComingSoon 
          title="Transaction History"
          description="View all your past transactions, payments, and financial activities in detail."
          icon="receipt"
          iconColor="#795548"
        />
      )} 
    />
    <Stack.Screen 
      name="HelpSupport" 
      component={() => (
        <ComingSoon 
          title="Help & Support"
          description="Get help with any issues, find answers to frequently asked questions, and contact our support team."
          icon="help-circle"
          iconColor="#00BCD4"
        />
      )} 
    />
  </Stack.Navigator>
);
};

export default ClientNavigator;
