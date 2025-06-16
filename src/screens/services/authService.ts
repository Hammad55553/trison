import AsyncStorage from '@react-native-async-storage/async-storage';

// Make sure all methods use consistent key names
export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'token']);
  } catch (error) {
    console.error('Error clearing token:', error);
  }
};