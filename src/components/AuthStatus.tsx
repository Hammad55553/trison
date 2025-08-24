import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const AuthStatus = () => {
  const authState = useSelector((state: RootState) => state.auth);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Authentication Status</Text>
      <Text style={styles.status}>Is Authenticated: {authState.isAuthenticated ? '✅ Yes' : '❌ No'}</Text>
      <Text style={styles.status}>Loading: {authState.isLoading ? '⏳ Yes' : '✅ No'}</Text>
      <Text style={styles.status}>Access Token: {authState.accessToken ? '✅ Present' : '❌ None'}</Text>
      <Text style={styles.status}>User Role: {authState.user?.role || 'None'}</Text>
      {authState.error && (
        <Text style={styles.error}>Error: {authState.error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  error: {
    fontSize: 14,
    marginTop: 8,
    color: 'red',
    fontWeight: 'bold',
  },
});

export default AuthStatus; 