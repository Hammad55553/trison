import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner, CameraDevice, CodeScanner } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import QRScanner from '../../components/QRScanner'; // Adjust the path as needed
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Define navigation prop types
type RootStackParamList = {
  QRScannerScreen: undefined;
  // Add other screens as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'QRScannerScreen'>;

interface QRScannerScreenProps {
  navigation: NavigationProp;
}

const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [flashEnabled, setFlashEnabled] = useState<boolean>(false);
  const [cameraDevice, setCameraDevice] = useState<'front' | 'back'>('back');
  const [zoom, setZoom] = useState<number>(1);
  const device = useCameraDevice(cameraDevice);

  const codeScanner: CodeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async (codes) => {
      const scannedValue = codes[0]?.value ?? null;
      if (scannedValue) {
        await processScannedQRCode(scannedValue);
      }
    },
  });

  // Flash toggle function
  const handleFlashToggle = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Camera flip function
  const handleCameraFlip = () => {
    setCameraDevice(cameraDevice === 'back' ? 'front' : 'back');
  };

  // Zoom change function
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  // History navigation function
  const handleHistoryPress = () => {
    navigation.navigate('History' as never);
  };

  // Image picker function
  const handleImagePicker = async () => {
    try {
      // Request permissions for Android
      if (Platform.OS === 'android') {
        let granted;
        if (Platform.Version >= 33) {
          // Android 13+ uses READ_MEDIA_IMAGES
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Gallery Permission',
              message: 'App needs access to your gallery to select images',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
        } else {
          // Android 12 and below uses READ_EXTERNAL_STORAGE
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Gallery Permission',
              message: 'App needs access to your gallery to select images',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
        }
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: 'Gallery access is required to select images'
          });
          return;
        }
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        includeBase64: true,
        selectionLimit: 1,
      });

      console.log('Image picker result:', result); // Debug log

      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        if (imageUri) {
          Toast.show({
            type: 'success',
            text1: 'Image Selected',
            text2: 'Processing image for QR code...'
          });
          
          // For now, show a message that this feature is coming soon
          setTimeout(() => {
            Toast.show({
              type: 'info',
              text1: 'Feature Coming Soon',
              text2: 'QR code extraction from images will be available soon!'
            });
          }, 2000);
        }
      } else if (result.didCancel) {
        console.log('User cancelled image picker');
      } else {
        console.log('No image selected');
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select image: ' + (error?.message || 'Unknown error')
      });
    }
  };

  // Process scanned QR code (shared function for camera and image)
  const processScannedQRCode = async (scannedValue: string) => {
    if (scannedValue && !isScanning) {
      setIsScanning(true); // Prevent multiple scans
      
      try {
        // Show success toast
        Toast.show({ 
          type: 'success', 
          text1: 'QR Code Scanned!', 
          text2: `Scanned Value: ${scannedValue}` 
        });

        // Navigate to History screen after 1.5 seconds
        setTimeout(() => {
          setIsScanning(false);
          navigation.navigate('History' as never);
        }, 1500);

      } catch (error) {
        console.error('Error processing QR code:', error);
        Toast.show({ 
          type: 'error', 
          text1: 'Error', 
          text2: 'Failed to process QR Code' 
        });
        setIsScanning(false);
      }
    }
  };

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const permission = await Camera.requestCameraPermission();
        if (permission === 'granted') {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          setError('Camera permission was denied.');
        }
      } catch (err) {
        console.error('Error requesting camera permission:', err);
        setHasPermission(false);
        setError('Failed to request camera permission.');
      }
    };
    requestCameraPermission();
  }, []);

  // Debug log
  console.log('Device:', device, 'Permission:', hasPermission, 'Error:', error);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>{error}</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Waiting for camera permission...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>No back camera available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={hasPermission}
        torch={flashEnabled ? 'on' : 'off'}
        zoom={zoom}
      />
      <QRScanner 
        flashEnabled={flashEnabled}
        onFlashToggle={handleFlashToggle}
        cameraDevice={cameraDevice}
        onCameraFlip={handleCameraFlip}
        onImagePicker={handleImagePicker}
        onHistoryPress={handleHistoryPress}
        zoom={zoom}
        onZoomChange={handleZoomChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#333',
  },
});

export default QRScannerScreen; 