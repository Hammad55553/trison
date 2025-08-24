import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import colors from '../constants/colors';

const ProtectedComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    accessToken, 
    userRole, 
    userPoints,
    logout 
  } = useAuth();

  const handleProtectedAction = () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please login to perform this action');
      return;
    }

    // This action requires authentication
    Alert.alert('Success', 'Protected action performed successfully!');
  };

  const handleRoleBasedAction = () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please login to perform this action');
      return;
    }

    if (userRole === 'client') {
      Alert.alert('Client Action', 'Performing client-specific action...');
    } else if (userRole === 'retailer') {
      Alert.alert('Retailer Action', 'Performing retailer-specific action...');
    } else {
      Alert.alert('Admin Action', 'Performing admin-specific action...');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.notLoggedInText}>Please login to access this feature</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Protected Component</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>Welcome, {user?.first_name || user?.phone_number}!</Text>
        <Text style={styles.roleText}>Role: {userRole}</Text>
        <Text style={styles.pointsText}>Points: {userPoints}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleProtectedAction}
        >
          <Text style={styles.actionButtonText}>Protected Action</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleRoleBasedAction}
        >
          <Text style={styles.actionButtonText}>Role-Based Action</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={logout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tokenInfo}>
        <Text style={styles.tokenLabel}>Token Status:</Text>
        <Text style={styles.tokenValue}>
          {accessToken ? '✅ Valid' : '❌ Invalid'}
        </Text>
      </View>
    </View>
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
  userInfo: {
    backgroundColor: colors.gray300,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  pointsText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: colors.gray600,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray300,
    padding: 15,
    borderRadius: 10,
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tokenValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  notLoggedInText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ProtectedComponent; 