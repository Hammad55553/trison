import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import colors from '../constants/colors';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.notLoggedInText}>Not logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Phone Number:</Text>
        <Text style={styles.value}>{user.phone_number}</Text>
      </View>

      {user.first_name && (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>First Name:</Text>
          <Text style={styles.value}>{user.first_name}</Text>
        </View>
      )}

      {user.last_name && (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Last Name:</Text>
          <Text style={styles.value}>{user.last_name}</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user.role}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Total Points:</Text>
        <Text style={styles.value}>{user.total_points}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Token Status:</Text>
        <Text style={styles.value}>
          {accessToken ? '✅ Valid' : '❌ Invalid'}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  value: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
  notLoggedInText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
  logoutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UserProfile; 