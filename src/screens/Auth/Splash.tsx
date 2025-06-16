import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions, NavigationProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import Video from 'react-native-video';
import { RootStackParamList } from '../../navigation/Types'; // Adjust the path according to your project

// Define navigation prop type according to your navigation stack
type SplashScreenNavigationProp = NavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Wait for 3 seconds (splash video duration)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Fetch token and role from AsyncStorage
       const token = await AsyncStorage.getItem('userToken');
const role = await AsyncStorage.getItem('userRole');


        if (token && role) {
          // Save credentials in Redux store
          dispatch(setCredentials({ token, role }));

          // Navigate to ClientHome and reset navigation stack
          navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [
      {
        name: 'ClientNavigator',
        state: {
          index: 0,
          routes: [{ name: 'ClientHome' }],
        },
      },
    ],
  })
);

        } else {
          // No token found, navigate to Login and reset navigation stack
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          );
        }
      } catch (error) {
        // On error, navigate to Login screen
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    };

    checkLoginStatus();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/images/splash.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        paused={false}
        repeat={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default SplashScreen;
