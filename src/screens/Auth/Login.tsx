import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/Types';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import CustomButton from '../../components/CustomButton';
import colors from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LogoLoader from '../../components/LogoLoader';

type LoginNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<LoginNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFocused, setIsFocused] = useState({ phone: false });
  const [isLoading, setIsLoading] = useState(false);
  const phoneRef = useRef<TextInput>(null);

// Change the storage keys to be consistent
const handleLogin = async () => {
  if (phoneNumber.length === 11) {
    setIsLoading(true);
    setTimeout(async () => {
      setIsLoading(false);
      const token = 'mock-token';
      const role = 'client';
      
      dispatch(setCredentials({ token, role }));
      
      try {
        await AsyncStorage.multiSet([
          ['userToken', token],
          ['userRole', role],
          ['isAuthenticated', 'true']
        ]);
      } catch (e) {
        console.log('Error saving credentials', e);
      }
    }, 2000);
  }
};

  const handleFocus = (field: 'phone') => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: 'phone') => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
    }
  };

  const isPhoneValid = phoneNumber.length === 11;

  if (isLoading) {
    return <LogoLoader />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/TRISON.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputSection}>
                <Text style={styles.label}>Enter your phone number</Text>
                <TextInput
                  ref={phoneRef}
                  style={[
                    styles.input,
                    isFocused.phone && styles.inputFocused
                  ]}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.gray600}
                  keyboardType="numeric"
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  onFocus={() => handleFocus('phone')}
                  onBlur={() => handleBlur('phone')}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  maxLength={11}
                />
              </View>

              <CustomButton
                title="Login"
                onPress={handleLogin}
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
                disabled={!isPhoneValid}
              />
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.label2}>Don't have an account?</Text>
              <CustomButton
                title="Register"
                onPress={() => navigation.navigate('Register')}
                style={styles.registerButton}
                textStyle={styles.registerButtonText}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9eede',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: hp('3%'),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('5%'),
  },
  logoImage: {
    width: wp('80%'),
    height: hp('25%'),
  },
  formContainer: {
    paddingHorizontal: wp('6%'),
    marginBottom: hp('15%'),
  },
  inputSection: {
    marginBottom: hp('3%'),
  },
  label: {
    fontSize: wp('4.2%'),
    marginBottom: hp('1%'),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    height: hp('6.5%'),
    borderColor: colors.gray300,
    borderWidth: 1,
    borderRadius: wp('20%'),
    paddingHorizontal: wp('4%'),
    fontSize: wp('4.2%'),
    backgroundColor: colors.white,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: hp('2.2%'),
    borderRadius: wp('20%'),
    marginTop: hp('2%'),
  },
  loginButtonText: {
    color: colors.orange,
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerContainer: {
    paddingHorizontal: wp('6%'),
  },
  label2: {
    fontSize: wp('4.2%'),
    marginBottom: hp('1%'),
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: colors.white,
    paddingVertical: hp('1.5%'),
    borderRadius: wp('20%'),
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: hp('1%'),
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: wp('4%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;
