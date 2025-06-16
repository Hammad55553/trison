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
import CustomButton from '../../components/CustomButton';
import colors from '../../constants/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type RegisterNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'shopkeeper' | 'client' | null>(null);
  const [isFocused, setIsFocused] = useState({
    phone: false,
    name: false
  });
  const phoneRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const handleRegister = () => {
    console.log('Registering with:', { name, phoneNumber, userType });
    if (userType === 'shopkeeper') {
      navigation.navigate('ShopkeeperVerification' as never);
    } else {
      navigation.navigate('ClientHome' as never);
    }
  };

  const handleFocus = (field: 'phone' | 'name') => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: 'phone' | 'name') => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
    }
  };

  const isFormValid = phoneNumber.length === 11 && name.length > 0 && userType !== null;

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

            {/* Form container */}
            <View style={styles.formContainer}>
              {/* Name Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Enter your name</Text>
                <TextInput
                  ref={nameRef}
                  style={[
                    styles.input,
                    isFocused.name && styles.inputFocused
                  ]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.gray600}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => handleFocus('name')}
                  onBlur={() => handleBlur('name')}
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
              </View>

              {/* User Type Selection */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Select your role</Text>
                <View style={styles.userTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'shopkeeper' && styles.userTypeButtonSelected
                    ]}
                    onPress={() => setUserType('shopkeeper')}
                  >
                    <Text style={[
                      styles.userTypeText,
                      userType === 'shopkeeper' && styles.userTypeTextSelected
                    ]}>
                      Shopkeeper
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
              {/* Register Button */}
              <CustomButton
                title="Register"
                onPress={handleRegister}
                style={styles.registerButton}
                textStyle={styles.registerButtonText}
                disabled={!isFormValid}
              />
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
});

export default RegisterScreen;