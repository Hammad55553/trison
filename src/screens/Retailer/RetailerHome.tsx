// screens/Retailer/RetailerHomeScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RetailerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👨‍💼 Welcome to Retailer Home</Text>
    </View>
  );
};

export default RetailerHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});
