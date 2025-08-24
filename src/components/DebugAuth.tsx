import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { checkAuthStatus, logout } from '../redux/slices/authSlice';
import colors from '../constants/colors';

const DebugAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const handleCheckAuth = () => {
    dispatch(checkAuthStatus() as any);
  };

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  const handleTestAPI = async () => {
    try {
      const response = await fetch('https://78a5583fa550.ngrok-free.app/api/v1/health');
      const data = await response.json();
      console.log('API Test Response:', data);
    } catch (error) {
      console.error('API Test Error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Authentication Debug</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current State:</Text>
        <Text style={styles.info}>Is Authenticated: {auth.isAuthenticated ? '✅ Yes' : '❌ No'}</Text>
        <Text style={styles.info}>Is Loading: {auth.isLoading ? '🔄 Yes' : '⏸️ No'}</Text>
        <Text style={styles.info}>Has Error: {auth.error ? '❌ Yes' : '✅ No'}</Text>
        {auth.error && <Text style={styles.error}>Error: {auth.error}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Data:</Text>
        {auth.user ? (
          <>
            <Text style={styles.info}>ID: {auth.user.id}</Text>
            <Text style={styles.info}>Phone: {auth.user.phone_number}</Text>
            <Text style={styles.info}>Name: {auth.user.first_name} {auth.user.last_name}</Text>
            <Text style={styles.info}>Role: {auth.user.role}</Text>
            <Text style={styles.info}>Points: {auth.user.total_points}</Text>
          </>
        ) : (
          <Text style={styles.info}>No user data</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tokens:</Text>
        <Text style={styles.info}>Access Token: {auth.accessToken ? '✅ Present' : '❌ Missing'}</Text>
        <Text style={styles.info}>Refresh Token: {auth.refreshToken ? '✅ Present' : '❌ Missing'}</Text>
        {auth.accessToken && (
          <Text style={styles.tokenText} numberOfLines={2}>
            Token: {auth.accessToken.substring(0, 50)}...
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions:</Text>
        <TouchableOpacity style={styles.button} onPress={handleCheckAuth}>
          <Text style={styles.buttonText}>Check Auth Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleTestAPI}>
          <Text style={styles.buttonText}>Test API Connection</Text>
        </TouchableOpacity>
        
        {auth.isAuthenticated && (
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backend Status:</Text>
        <Text style={styles.info}>API URL: https://78a5583fa550.ngrok-free.app</Text>
        <Text style={styles.info}>Local URL: http://localhost:8000</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.gray300,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  error: {
    fontSize: 16,
    color: 'red',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tokenText: {
    fontSize: 12,
    color: colors.gray600,
    fontFamily: 'monospace',
    backgroundColor: colors.gray300,
    padding: 5,
    borderRadius: 5,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: colors.gray600,
  },
});

export default DebugAuth; 