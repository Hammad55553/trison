import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  PanResponder,
  useWindowDimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../constants/colors';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNavigation } from '@react-navigation/native';

// Responsive utilities
const useResponsiveQR = () => {
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

const ScanQRScreen = () => {
  const { width, height, isTablet, isSmallDevice, isLargeDevice, wp, hp } = useResponsiveQR();
  const navigation = useNavigation();
  
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scannedData, setScannedData] = useState('');
  
  // Animated values
  const scanLinePosition = useRef(new Animated.Value(0)).current;
  const zoomSliderPosition = useRef(new Animated.Value(0.5)).current;

  // Scan line animation
  useEffect(() => {
    const animateScanLine = () => {
      Animated.sequence([
        Animated.timing(scanLinePosition, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scanLinePosition, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => animateScanLine());
    };
    animateScanLine();
  }, []);

  // Pan responder for zoom slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const newPosition = Math.max(0, Math.min(1, gestureState.moveX / (width - 60)));
        zoomSliderPosition.setValue(newPosition);
        setZoomLevel(0.5 + newPosition * 2); // Zoom range: 0.5x to 2.5x
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const scanLineTranslateY = scanLinePosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust based on your QR code size
  });

  const zoomSliderTranslateX = zoomSliderPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 80], // Adjust based on slider width
  });

  const onQRCodeRead = (e: any) => {
    setScannedData(e.data);
    Alert.alert(
      'QR Code Scanned!',
      `Data: ${e.data}`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScannedData(''),
        },
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // Dynamic styles based on responsive values
  const dynamicStyles = StyleSheet.create({
    qrFrame: {
      width: isTablet ? width * 0.5 : width * 0.7,
      height: isTablet ? width * 0.5 : width * 0.7,
      position: 'relative',
      backgroundColor: '#2a2a2a',
      borderRadius: 20,
      overflow: 'hidden',
    },
    scanButton: {
      width: isTablet ? wp(15) : 70,
      height: isTablet ? wp(15) : 70,
      borderRadius: isTablet ? wp(7.5) : 35,
      backgroundColor: colors.orange,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.orange,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    },
  });

  return (
    <View style={styles.container}>
      <Header 
        title="QR Scanner" 
        backgroundColor="rgba(0, 0, 0, 0.8)"
        titleColor="white"
        iconColor="white"
        rightComponent={
          <View style={styles.headerRightButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsFlashOn(!isFlashOn)}
            >
              <Icon 
                name={isFlashOn ? "flash" : "flash-off"} 
                size={isTablet ? wp(6) : 24} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsFrontCamera(!isFrontCamera)}
            >
              <Icon name="camera-switch" size={isTablet ? wp(6) : 24} color="white" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* QR Code Scanning Area */}
      <View style={styles.scanArea}>
        {/* QR Code Frame */}
        <View style={dynamicStyles.qrFrame}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Scan line */}
          <Animated.View 
            style={[
              styles.scanLine,
              {
                transform: [{ translateY: scanLineTranslateY }],
              },
            ]}
          />
          
          {/* QR Code (placeholder) */}
          <View style={styles.qrCodePlaceholder}>
            <View style={styles.qrCodeGrid}>
              {/* Generate a simple QR code pattern */}
              {Array.from({ length: 25 }, (_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.qrPixel,
                    { backgroundColor: Math.random() > 0.5 ? 'white' : 'black' }
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Zoom Slider */}
      <View style={styles.zoomContainer}>
        <View style={styles.zoomSlider}>
          <Text style={styles.zoomText}>-</Text>
          <View style={styles.sliderTrack}>
            <Animated.View 
              style={[
                styles.sliderHandle,
                {
                  transform: [{ translateX: zoomSliderTranslateX }],
                },
              ]}
              {...panResponder.panHandlers}
            />
          </View>
          <Text style={styles.zoomText}>+</Text>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: colors.orange,
  },
  topLeft: {
    top: 10,
    left: 10,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 10,
    right: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 10,
    left: 10,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 10,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: colors.orange,
    left: 0,
    top: 0,
  },
  qrCodePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  qrCodeGrid: {
    width: 100,
    height: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    padding: 2,
  },
  qrPixel: {
    width: 4,
    height: 4,
    margin: 0.5,
  },
  zoomContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  zoomSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zoomText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 20,
    position: 'relative',
  },
  sliderHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: colors.orange,
    borderRadius: 10,
    top: -8,
    left: 0,
  },



});

export default ScanQRScreen; 