import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../constants/colors';

interface BlurLoaderProps {
  message?: string;
  size?: 'small' | 'large';
  visible?: boolean;
}

const BlurLoader: React.FC<BlurLoaderProps> = ({ 
  message = 'Loading...', 
  size = 'large',
  visible = true
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Transparent overlay - background screen shows through */}
      <View style={styles.overlay} />
      
      {/* Loading content */}
      <View style={styles.contentContainer}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator 
            size={size} 
            color={colors.primary} 
            style={styles.spinner}
          />
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Very light dark overlay
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    minWidth: 120,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BlurLoader; 