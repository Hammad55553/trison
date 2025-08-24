import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/Types';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTP } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import CustomButton from '../../components/CustomButton';
import colors from '../../constants/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BlurLoader from '../../components/BlurLoader';
import AuthStatus from '../../components/AuthStatus';

type LoginNavigationProp = StackNavigationProp<RootStackParamList, 'AuthNavigator'>;

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<LoginNavigationProp>();
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isFocused, setIsFocused] = useState({ phone: false, otp: false });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
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

  // Handle successful authentication
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Show success message briefly before navigation
      Alert.alert(
        'Login Successful! 🎉',
        'Welcome to Trison Solar!',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigation will happen automatically via RootNavigator
              // Reset form state
              setPhoneNumber('');
              setOtp('');
              setOtpSent(false);
              setCountdown(0);
            }
          }
        ]
      );
    }
  }, [isAuthenticated, authLoading]);

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid phone number'
      });
      return;
    }

    setIsLoading(true);
    try {
      // First check if user exists by trying to send OTP
      const response = await dispatch(sendOTP(phoneNumber) as any);
      
      // If OTP sent successfully, user exists
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP sent successfully!'
      });
      otpRef.current?.focus();
    } catch (error: any) {
      // If user doesn't exist, show message to register first
      if (error.message?.includes('User not found') || error.message?.includes('404')) {
        Toast.show({
          type: 'error',
          text1: 'User Not Found',
          text2: 'Please register first before logging in',
          onPress: () => navigation.navigate('Register' as never)
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to send OTP'
        });
      }
    } finally {
      setIsLoading(false);
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

    setIsLoading(true);
    try {
      await dispatch(verifyOTP({ phoneNumber, otp }) as any);
      // Navigation will be handled automatically by RootNavigator
      // when isAuthenticated becomes true in Redux state
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Invalid OTP'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = (field: 'phone' | 'otp') => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: 'phone' | 'otp') => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
    }
  };

  const handleOTPChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 6) {
      setOtp(cleaned);
    }
  };

  const isPhoneValid = phoneNumber.length >= 10;
  const isOTPValid = otp.length >= 4;

  // Show BlurLoader overlay instead of replacing entire screen
  const showLoader = isLoading || authLoading || isAuthenticated;
  const loaderMessage = isLoading || authLoading ? "Setting up..." : "Welcome back! Redirecting to dashboard...";

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
                  placeholder="Phone Number (e.g., 03001234567)"
                  placeholderTextColor={colors.gray600}
                  keyboardType="numeric"
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  onFocus={() => handleFocus('phone')}
                  onBlur={() => handleBlur('phone')}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOTP}
                  maxLength={11}
                  editable={!otpSent}
                />
              </View>

              {!otpSent ? (
                <CustomButton
                  title={isLoading ? "Sending OTP..." : "Send OTP"}
                  onPress={handleSendOTP}
                  style={styles.loginButton}
                  textStyle={styles.loginButtonText}
                  disabled={!isPhoneValid || isLoading}
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
                      onChangeText={handleOTPChange}
                      onFocus={() => handleFocus('otp')}
                      onBlur={() => handleBlur('otp')}
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyOTP}
                      maxLength={6}
                    />
                  </View>

                  <CustomButton
                    title={isLoading ? "Verifying..." : "Verify OTP & Login"}
                    onPress={handleVerifyOTP}
                    style={styles.loginButton}
                    textStyle={styles.loginButtonText}
                    disabled={!isOTPValid || isLoading}
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

            <View style={styles.registerContainer}>
              <Text style={styles.label2}>Don't have an account?</Text>
              <CustomButton
                title="Register First"
                onPress={() => navigation.navigate('Register' as never)}
                style={styles.registerButton}
                textStyle={styles.registerButtonText}
              />
              <Text style={styles.registerNote}>
                New users must register before they can login
              </Text>
            </View>

            {/* Debug: Show authentication status */}
            <AuthStatus />
            
            {/* Debug Component for Testing */}
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>🧪 Debug Mode</Text>
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => navigation.navigate('DebugAuth' as never)}
              >
                <Text style={styles.debugButtonText}>Open Debug Panel</Text>
              </TouchableOpacity>
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
  resendContainer: {
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  resendText: {
    fontSize: wp('3.5%'),
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
    borderRadius: wp('20%'),
    borderWidth: 2,
    borderColor: colors.gray300,
    marginTop: hp('2%'),
  },
  changePhoneButtonText: {
    color: colors.gray600,
    fontSize: wp('4%'),
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
  registerNote: {
    fontSize: wp('3%'),
    color: colors.gray600,
    textAlign: 'center',
    marginTop: hp('1%'),
    fontStyle: 'italic',
  },
  debugContainer: {
    paddingHorizontal: wp('6%'),
    marginTop: hp('3%'),
    alignItems: 'center',
  },
  debugTitle: {
    fontSize: wp('3.5%'),
    color: colors.gray600,
    marginBottom: hp('1%'),
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: colors.gray600,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('20%'),
  },
  debugButtonText: {
    color: colors.white,
    fontSize: wp('3%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;
