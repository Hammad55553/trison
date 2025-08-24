import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, useWindowDimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import colors from '../constants/colors';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
// Responsive utilities
const useResponsiveHeader = () => {
  const { width, height } = useWindowDimensions();
  
  const isTablet = () => {
    const aspectRatio = height / width;
    return aspectRatio <= 1.6;
  };
  
  const isSmallDevice = () => width <= 375;
  const isLargeDevice = () => width > 414;
  
  const wp = (percentage: number) => (width * percentage) / 100;
  const hp = (percentage: number) => (height * percentage) / 100;
  
  return {
    width,
    height,
    isTablet: isTablet(),
    isSmallDevice: isSmallDevice(),
    isLargeDevice: isLargeDevice(),
    wp,
    hp,
  };
};

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  iconColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBackPress,
  rightComponent,
  backgroundColor = colors.primary,
  titleColor = colors.white,
  iconColor = colors.white,
}) => {
  const navigation = useNavigation();
  const { isTablet, isSmallDevice, isLargeDevice, wp, hp } = useResponsiveHeader();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  // Dynamic styles based on responsive values
  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: isTablet ? wp(4) : 16,
      paddingVertical: isTablet ? hp(1.5) : 12,
      minHeight: isTablet ? hp(8) : 56,
      backgroundColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    title: {
      fontSize: isTablet ? wp(4) : 18,
      fontWeight: 'bold',
      textAlign: 'center',
      letterSpacing: 0.5,
      color: titleColor,
    },
    backButton: {
      padding: isTablet ? wp(2) : 8,
      borderRadius: isTablet ? wp(5) : 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  });

  return (
    <>
      <StatusBar 
        backgroundColor={backgroundColor} 
        barStyle="light-content" 
        translucent={true}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={[dynamicStyles.container, { marginTop: hp(2) }]}>
        {/* Left Section - Back Button */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity 
              style={dynamicStyles.backButton} 
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Icon 
                name="arrow-left" 
                size={isTablet ? wp(6) : 24} 
                color={iconColor} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section - Title */}
        <View style={styles.centerSection}>
          <Text style={dynamicStyles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Section - Optional Component */}
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
              </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    minWidth: 40,
    marginTop: hp('2%'),

  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 40,
  },
});

export default Header; 