import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;
const BAR_HEIGHT = 90;
const ACTIVE_ICON_SIZE = 28;
const INACTIVE_ICON_SIZE = 26;

const Footer = () => {
  console.log('Footer: Footer component rendering...');
  const navigation = useNavigation();
  const route = useRoute();
  const [activeIndex, setActiveIndex] = useState(2); // default center index

  const tabs = [
    { name: 'Home', icon: 'home-variant-outline', activeIcon: 'home-variant', screen: 'ClientHome' },
    { name: 'Rewards', icon: 'star-outline', activeIcon: 'star', screen: 'Rewards' },
    { name: 'Scan', icon: 'qrcode-scan', activeIcon: 'qrcode-scan', screen: 'ScanQR' },
    { name: 'History', icon: 'clock-outline', activeIcon: 'clock', screen: 'History' },
    { name: 'Profile', icon: 'account-circle-outline', activeIcon: 'account-circle', screen: 'Profile' },
  ];

  // Sync active index with current route
  useEffect(() => {
    const currentRouteIndex = tabs.findIndex(tab => tab.screen === route.name);
    if (currentRouteIndex !== -1 && currentRouteIndex !== activeIndex) {
      setActiveIndex(currentRouteIndex);
    }
  }, [route.name]);

  const animatedValue = useRef(new Animated.Value(activeIndex)).current;
  const animationConfig = {
    duration: 300,
    useNativeDriver: false, // needs to be false for path interpolation
  };

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: activeIndex,
      ...animationConfig,
    }).start();
  }, [activeIndex]);

  const getPath = (index: number) => {
    const left = TAB_WIDTH * index;
    const center = left + TAB_WIDTH / 2;
    const curveHeight = 30;

    return `
      M0,0 
      H${left - 35}
      C${left - 20},0 ${center - 25},${curveHeight} ${center},${curveHeight} 
      C${center + 25},${curveHeight} ${left + TAB_WIDTH + 20},0 ${left + TAB_WIDTH + 35},0 
      H${width} 
      V${BAR_HEIGHT} 
      H0 
      Z
    `;
  };

  const handlePress = (tab: typeof tabs[0], index: number) => {
    setActiveIndex(index);
    navigation.navigate(tab.screen as never);
  };

  const path = animatedValue.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => getPath(i)),
  });

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <AnimatedSvg
          width={width}
          height={BAR_HEIGHT}
          style={{ position: 'absolute', bottom: 0 }}
        >
          <AnimatedPath 
            d={path} 
            fill="transparent"
            stroke={colors.orange}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </AnimatedSvg>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => {
          const isActive = tabs[activeIndex].screen === tab.screen;
          const iconName = isActive ? tab.activeIcon : tab.icon;

          const translateY = animatedValue.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0, -20, 0],
            extrapolate: 'clamp',
          });

          const scale = animatedValue.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [1, 1.2, 1],
            extrapolate: 'clamp',
          });

          const opacity = animatedValue.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp',
          });

          return (
            <TouchableWithoutFeedback 
              key={index} 
              onPress={() => handlePress(tab, index)}
            >
              <Animated.View style={[
                styles.tab, 
                { 
                  transform: [{ translateY }, { scale }],
                  opacity,
                }
              ]}>
                <View style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer
                ]}>
                  <Icon
                    name={iconName}
                    size={isActive ? ACTIVE_ICON_SIZE : INACTIVE_ICON_SIZE}
                    color={isActive ? colors.orange : colors.primary}
                  />
                </View>
                {isActive && (
                  <Text style={styles.label}>{tab.name}</Text>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
    </View>
  );
};

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: hp('0'),
    width: '100%',
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    width: width,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: BAR_HEIGHT,
    position: 'absolute',
    bottom: 0,
    paddingBottom: 10,
  },
  tab: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'transparent',
  },
  activeIconContainer: {
    // backgroundColor: 'transparent',
    shadowColor: colors.orange,
    // shadowOffset: {
    //   width: 0,
    //   height: 6,
    // },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 8,
    color: colors.orange,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default Footer;