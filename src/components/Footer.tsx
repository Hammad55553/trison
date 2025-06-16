import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;
const BAR_HEIGHT = 80;
const ACTIVE_ICON_SIZE = 28;
const INACTIVE_ICON_SIZE = 24;

const CurvedNavigationBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeIndex, setActiveIndex] = useState(2); // default center index

  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', screen: 'ClientHome' },
    { name: 'Space', icon: 'rocket-outline', activeIcon: 'rocket', screen: 'Space' },
    { name: 'Inam', icon: 'gift-outline', activeIcon: 'gift', screen: 'Inam' },
    { name: 'Chat', icon: 'message-outline', activeIcon: 'message', screen: 'Chat' },
    { name: 'Profile', icon: 'account-outline', activeIcon: 'account', screen: 'Profile' },
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
    const curveHeight = 20;

    return `
      M0,0 
      H${left - 25}
      C${left - 10},0 ${center - 15},${curveHeight} ${center},${curveHeight} 
      C${center + 15},${curveHeight} ${left + TAB_WIDTH + 10},0 ${left + TAB_WIDTH + 25},0 
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
            fill={colors.white}
            stroke={colors.orange}
            strokeWidth={0.5}
          />
        </AnimatedSvg>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => {
          const isActive = tabs[activeIndex].screen === tab.screen;
          const iconName = isActive ? tab.activeIcon : tab.icon;

          const translateY = animatedValue.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0, -15, 0],
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
                <Icon
                  name={iconName}
                  size={isActive ? ACTIVE_ICON_SIZE : INACTIVE_ICON_SIZE}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
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
    bottom: 0,
    width: '100%',
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  label: {
    fontSize: 10,
    marginTop: 4,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default CurvedNavigationBar;