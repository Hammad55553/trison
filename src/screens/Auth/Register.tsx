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
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/Types';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, register } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import CustomButton from '../../components/CustomButton';
import colors from '../../constants/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import BlurLoader from '../../components/BlurLoader';

type RegisterNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<RegisterNavigationProp>();
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'retailer' | 'client' | null>(null);
  const [otp, setOtp] = useState('');
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
    phone: false,
    otp: false
  });
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const otpRef = useRef<TextInput>(null);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Handle successful registration
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      Toast.show({
        type: 'success',
        text1: 'Registration Successful! 🎉',
        text2: 'Welcome to Trison Solar!'
      });
      // Navigation will happen automatically via RootNavigator
    }
  }, [isAuthenticated, isLoading]);

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid phone number'
      });
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your full name'
      });
      return;
    }

    if (!userType) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select your role'
      });
      return;
    }

    try {
      setIsSendingOTP(true);
      console.log('Sending OTP for phone:', phoneNumber);
      const result = await dispatch(sendOTP(phoneNumber) as any).unwrap();
      console.log('OTP result:', result);
      
      setOtpSent(true);
      setCountdown(60);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP sent successfully!'
      });
      otpRef.current?.focus();
    } catch (error: any) {
      console.log('Caught error in handleSendOTP:', error);
      let errorMessage = 'Failed to send OTP';
      
      // Handle specific error cases
      if (error?.includes('already exists')) {
        errorMessage = 'User with this phone number already exists. Please login instead.';
      } else if (error) {
        errorMessage = error;
      }
      
      console.log('Showing toast for OTP error:', errorMessage);
      
      Toast.show({
        type: 'error',
        text1: 'OTP Failed',
        text2: errorMessage,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid OTP'
      });
      return;
    }

    try {
      setIsRegistering(true);
      const userData = {
        phone_number: phoneNumber,
        first_name: firstName,
        last_name: lastName,
        role: userType
      };
      
      console.log('Registering user with data:', userData);
      const result = await dispatch(register(userData) as any).unwrap();
      console.log('Registration result:', result);
      // Registration will be handled automatically by Redux
    } catch (error: any) {
      console.log('Caught error in handleVerifyOTP:', error);
      let errorMessage = 'Registration failed';
      
      // Handle specific error cases
      if (error?.includes('already exists')) {
        errorMessage = 'User with this phone number already exists. Please login instead.';
      } else if (error?.includes('Invalid OTP')) {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (error) {
        errorMessage = error;
      }
      
      console.log('Showing toast for registration error:', errorMessage);
      
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      await dispatch(sendOTP(phoneNumber) as any);
      setCountdown(60);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP resent successfully!'
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to resend OTP'
      });
    }
  };

  const handleFocus = (field: 'firstName' | 'lastName' | 'phone' | 'otp') => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: 'firstName' | 'lastName' | 'phone' | 'otp') => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
    }
  };

  const isFormValid = phoneNumber.length >= 10 && firstName.trim().length > 0 && lastName.trim().length > 0 && userType !== null;

  // Show BlurLoader overlay instead of replacing entire screen
  const showLoader = isLoading || isAuthenticated;
  const loaderMessage = isLoading ? "Setting up..." : "Welcome! Redirecting to dashboard...";

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.select({ ios: hp('2%'), android: 0 })}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/TRISON.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            
            {/* Test Toast Button */}
            <TouchableOpacity
              style={styles.testToastButton}
              onPress={() => {
                console.log('Test toast button pressed');
                Toast.show({
                  type: 'success',
                  text1: 'Test Toast',
                  text2: 'This is a test toast message!',
                  visibilityTime: 3000,
                  autoHide: true,
                  topOffset: 50,
                });
              }}
            >
              <Text style={styles.testToastButtonText}>🧪 Test Toast</Text>
            </TouchableOpacity>

            {/* Form container */}
            <View style={styles.formContainer}>
              {/* First Name Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Enter your first name</Text>
                <TextInput
                  ref={firstNameRef}
                  style={[
                    styles.input,
                    isFocused.firstName && styles.inputFocused
                  ]}
                  placeholder="First Name"
                  placeholderTextColor={colors.gray600}
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => handleFocus('firstName')}
                  onBlur={() => handleBlur('firstName')}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
              </View>

              {/* Last Name Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Enter your last name</Text>
                <TextInput
                  ref={lastNameRef}
                  style={[
                    styles.input,
                    isFocused.lastName && styles.inputFocused
                  ]}
                  placeholder="Last Name"
                  placeholderTextColor={colors.gray600}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => handleFocus('lastName')}
                  onBlur={() => handleBlur('lastName')}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>

              {/* Phone Input Section */}
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
                />
                <Text style={styles.helpText}>
                  If you already have an account, please use the Login screen instead.
                </Text>
              </View>

              {/* User Type Selection */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Select your role</Text>
                <View style={styles.userTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'retailer' && styles.userTypeButtonSelected
                    ]}
                    onPress={() => setUserType('retailer')}
                  >
                    <Text style={[
                      styles.userTypeText,
                      userType === 'retailer' && styles.userTypeTextSelected
                    ]}>
                      Retailer
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'client' && styles.userTypeButtonSelected
                    ]}
                    onPress={() => setUserType('client')}
                  >
                    <Text style={[
                      styles.userTypeText,
                      userType === 'client' && styles.userTypeTextSelected
                    ]}>
                      Client
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {!otpSent ? (
                <CustomButton
                  title={isSendingOTP ? "Sending OTP..." : "Send OTP"}
                  onPress={handleSendOTP}
                  style={styles.registerButton}
                  textStyle={styles.registerButtonText}
                  disabled={!isFormValid || isSendingOTP}
                />
              ) : (
                <>
                  <View style={styles.inputSection}>
                    <Text style={styles.label}>Enter OTP</Text>
                    <TextInput
                      ref={otpRef}
                      style={[
                        styles.input,
                        isFocused.otp && styles.inputFocused
                      ]}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor={colors.gray600}
                      keyboardType="numeric"
                      value={otp}
                      onChangeText={setOtp}
                      onFocus={() => handleFocus('otp')}
                      onBlur={() => handleBlur('otp')}
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyOTP}
                      maxLength={6}
                    />
                  </View>

                  <CustomButton
                    title={isRegistering ? "Registering..." : "Verify OTP & Register"}
                    onPress={handleVerifyOTP}
                    style={styles.registerButton}
                    textStyle={styles.registerButtonText}
                    disabled={otp.length < 4 || isRegistering}
                  />

                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                      Didn't receive OTP?{' '}
                      {countdown > 0 ? (
                        <Text style={styles.countdownText}>
                          Resend in {countdown}s
                        </Text>
                      ) : (
                        <Text
                          style={styles.resendLink}
                          onPress={handleResendOTP}
                        >
                          Resend OTP
                        </Text>
                      )}
                    </Text>
                  </View>

                  <CustomButton
                    title="Change Phone Number"
                    onPress={() => {
                      setOtpSent(false);
                      setOtp('');
                      setCountdown(0);
                      phoneRef.current?.focus();
                    }}
                    style={styles.changePhoneButton}
                    textStyle={styles.changePhoneButtonText}
                  />
                </>
              )}
            </View>

            {/* Login Button */}
            <View style={styles.loginContainer}>
              <Text style={styles.label2}>Already have an account?</Text>
              <CustomButton
                title="Login"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      
      {/* BlurLoader Overlay */}
      <BlurLoader 
        visible={showLoader}
        message={loaderMessage}
        size="large"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: hp('2%'),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('5%'),
  },
  logoImage: {
    width: wp('80%'),
    height: hp('20%'),
  },
  formContainer: {
    paddingHorizontal: wp('6%'),
    marginBottom: hp('2%'),
  },
  inputSection: {
    marginBottom: hp('2.5%'),
  },
  label: {
    fontSize: hp('1.8%'),
    marginBottom: hp('1%'),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    height: hp('6%'),
    borderColor: colors.gray300,
    borderWidth: 1,
    borderRadius: wp('50%'),
    paddingHorizontal: wp('4%'),
    fontSize: hp('1.8%'),
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
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  userTypeButton: {
    flex: 1,
    height: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: wp('50%'),
    marginHorizontal: wp('1%'),
    backgroundColor: colors.white,
  },
  userTypeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  userTypeText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: hp('1.7%'),
  },
  userTypeTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: hp('2%'),
    borderRadius: wp('50%'),
    marginTop: hp('2%'),
  },
  registerButtonText: {
    color: colors.orange,
    fontSize: hp('2%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginContainer: {
    paddingHorizontal: wp('6%'),
  },
  label2: {
    fontSize: hp('1.8%'),
    marginBottom: hp('1%'),
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.white,
    paddingVertical: hp('1.5%'),
    borderRadius: wp('50%'),
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: hp('1%'),
  },
  loginButtonText: {
    color: colors.primary,
    fontSize: hp('1.8%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  resendText: {
    fontSize: hp('1.7%'),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resendLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  countdownText: {
    color: colors.gray600,
    fontWeight: '500',
  },
  changePhoneButton: {
    backgroundColor: colors.white,
    paddingVertical: hp('1.5%'),
    borderRadius: wp('50%'),
    borderWidth: 2,
    borderColor: colors.gray300,
    marginTop: hp('2%'),
  },
  changePhoneButtonText: {
    color: colors.gray600,
    fontSize: hp('1.7%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpText: {
    fontSize: hp('1.4%'),
    color: colors.gray600,
    marginTop: hp('1%'),
    textAlign: 'center',
    fontStyle: 'italic',
  },
  testToastButton: {
    backgroundColor: colors.primary,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('50%'),
    alignSelf: 'center',
    marginBottom: hp('2%'),
  },
  testToastButtonText: {
    color: colors.white,
    fontSize: hp('1.6%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RegisterScreen;