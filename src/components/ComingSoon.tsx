import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from './Header';
import Footer from './Footer';
import { ColorProperties } from 'react-native-reanimated/lib/typescript/Colors';
import colors from '../constants/colors';

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  showBackButton?: boolean;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon!",
  description = "This feature is under development and will be available soon. Stay tuned for updates!",
  icon = "rocket-launch",
  iconColor = "#A25B37",
  showBackButton = true
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header 
        title={title}
        showBack={showBackButton}
        onBackPress={handleBackPress}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon as any} 
            size={wp('15%')} 
            color={iconColor} 
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Description */}
        <Text style={styles.description}>{description}</Text>

        {/* Decorative Elements */}
        <View style={styles.decorativeContainer}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
        <Text style={styles.bottomText}>We're working hard to bring you amazing features!</Text>
      </View>

      {/* Footer */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('8%'),
    paddingTop: hp('5%'),
    paddingBottom: hp('10%'), // Space for footer
  },
  iconContainer: {
    marginBottom: hp('4%'),
    padding: wp('6%'),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: wp('15%'),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: hp('2%'),
    letterSpacing: 1,
  },
  description: {
    fontSize: wp('4%'),
    color: colors.primaryLight,
    textAlign: 'center',
    lineHeight: wp('6%'),
    maxWidth: wp('80%'),
    marginBottom: hp('6%'),
  },
  decorativeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('4%'),
  },
  dot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    marginHorizontal: wp('1%'),
  },
  dot1: {
    backgroundColor: '#FFC300',
    opacity: 0.8,
  },
  dot2: {
    backgroundColor: '#A25B37',
    opacity: 0.6,
  },
  dot3: {
    backgroundColor: '#FF6B6B',
    opacity: 0.8,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 25,
    marginBottom: hp('20%'),
  },
  bottomText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: wp('2%'),
    textAlign: 'center',
  },
});

export default ComingSoon; 