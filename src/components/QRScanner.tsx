import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Modal } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface QRScannerProps {
  flashEnabled?: boolean;
  onFlashToggle?: () => void;
  cameraDevice?: 'front' | 'back';
  onCameraFlip?: () => void;
  onImagePicker?: () => void;
  onHistoryPress?: () => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  flashEnabled = false, 
  onFlashToggle, 
  cameraDevice = 'back',
  onCameraFlip,
  onImagePicker,
  onHistoryPress,
  zoom = 1,
  onZoomChange
}) => {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const sliderWidth = 120; // Width of slider track

  // Zoom controls
  const handleZoomIn = () => {
    if (onZoomChange && zoom < 3) {
      onZoomChange(Math.min(zoom + 0.5, 3));
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange && zoom > 1) {
      onZoomChange(Math.max(zoom - 0.5, 1));
    }
  };

  const handleSliderDrag = (event: any) => {
    if (onZoomChange) {
      const { translationX } = event.nativeEvent;
      const sliderStartX = 0;
      const sliderEndX = sliderWidth;
      
      // Calculate new position
      const newPosition = Math.max(0, Math.min(sliderWidth, translationX));
      
      // Convert position to zoom value (0-100 to 1-3)
      const zoomPercent = newPosition / sliderWidth;
      const newZoom = 1 + (zoomPercent * 2);
      
      // Update zoom
      onZoomChange(Math.max(1, Math.min(3, newZoom)));
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: new Animated.Value(0) } }],
    { useNativeDriver: false, listener: handleSliderDrag }
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  const scanAreaSize = wp('70%');
  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scanAreaSize - 4],
  });

  return (
    <View style={styles.page2} pointerEvents="box-none">
      {/* Top bar */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.topIcon} onPress={onImagePicker}>
          <MaterialCommunityIcons name="image-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topIcon} onPress={onFlashToggle}>
          <MaterialCommunityIcons 
            name={flashEnabled ? "flash" : "flash-off"} 
            size={28} 
            color={flashEnabled ? "#FFC300" : "#fff"} 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topIcon} onPress={onCameraFlip}>
          <MaterialCommunityIcons name="camera-flip-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Scan area with yellow corners */}
      <View style={styles.scanAreaWrap} pointerEvents="box-none">
        <View style={[{ width: scanAreaSize, height: scanAreaSize, position: 'relative' }]}>
          {/* Corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          {/* Animated scan line */}
          <Animated.View
            style={[styles.scanLine, { width: scanAreaSize, transform: [{ translateY: scanLineY }] }]}
          />
        </View>
      </View>
      {/* Zoom slider */}
      <View style={styles.sliderWrap} pointerEvents="box-none">
        <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
          <MaterialCommunityIcons name="minus" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.sliderTrack}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.END) {
                // Gesture ended, no need to reset translation
              }
            }}
          >
            <Animated.View 
              style={[
                styles.sliderThumb, 
                { 
                  left: ((zoom - 1) / 2) * sliderWidth,
                  transform: [{ translateX: new Animated.Value(0) }]
                }
              ]}
            />
          </PanGestureHandler>
        </View>
        <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Bottom navigation */}
      <View style={styles.bottomNav} pointerEvents="box-none">
        <TouchableOpacity style={styles.bottomNavBtn} onPress={() => setShowGenerateModal(true)}>
          <MaterialCommunityIcons name="qrcode-edit" size={28} color="#fff" />
          <Text style={styles.bottomNavText}>Generate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavBtn} onPress={onHistoryPress}>
          <MaterialCommunityIcons name="history" size={28} color="#fff" />
          <Text style={styles.bottomNavText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Generate Modal */}
      <Modal
        visible={showGenerateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowGenerateModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <MaterialCommunityIcons name="qrcode-edit" size={80} color="#A25B37" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Coming Soon!</Text>
            <Text style={styles.modalText}>
              QR Code Generator feature will be available soon. Stay tuned for updates!
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  page2: {
    flex: 1,
    backgroundColor: 'transparent', // Changed to transparent to avoid obscuring camera
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 10,
  },
  topIcon: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    padding: 8,
  },
  scanAreaWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFC300',
    zIndex: 2,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FFC300',
    borderRadius: 2,
    zIndex: 3,
  },
  sliderWrap: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sliderTrack: {
    width: 120,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  sliderThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFC300',
    position: 'absolute',
    top: -7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  zoomButton: {
    padding: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 20,
  },
  bottomNavBtn: {
    alignItems: 'center',
    flex: 1,
  },
  bottomNavBtnActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    borderRadius: 40,
    width: 64,
    height: 64,
    marginTop: -32,
    borderWidth: 4,
    borderColor: '#FFC300',
    shadowColor: '#FFC300',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNavText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: '#FF4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A25B37',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default QRScanner; 