import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../constants/colors';

interface SimpleLoaderProps {
  message?: string;
  size?: 'small' | 'large';
}

const SimpleLoader: React.FC<SimpleLoaderProps> = ({ 
  message = 'Loading...', 
  size = 'large' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={colors.primary} 
        style={styles.spinner}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SimpleLoader; 