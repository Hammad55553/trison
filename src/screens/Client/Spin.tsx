import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  SafeAreaView,
  Modal,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import Footer from '../../components/Footer';

const { width } = Dimensions.get('window');

const SpinToWinScreen = () => {
  const navigation = useNavigation();
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  const prizes = [
    { id: 1, points: 50, color: '#FFD700' },
    { id: 2, points: 100, color: '#C0C0C0' },
    { id: 3, points: 20, color: '#CD7F32' },
    { id: 4, points: 200, color: '#FFD700' },
    { id: 5, points: 10, color: '#C0C0C0' },
    { id: 6, points: 150, color: '#CD7F32' },
  ];

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setWinner(null);
    
    // Random number of rotations (5-10 full rotations)
    const rotations = 5 + Math.floor(Math.random() * 5);
    const randomSegment = Math.floor(Math.random() * prizes.length);
    const totalDegrees = rotations * 360 + (randomSegment * (360 / prizes.length));
    
    Animated.timing(spinValue, {
      toValue: totalDegrees,
      duration: 5000,
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setWinner(prizes[randomSegment].points);
      setShowResult(true);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  const closeModal = () => {
    setShowResult(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spin to Win</Text>
          <View style={{ width: 24 }} /> {/* For balance */}
        </View>

        {/* Wheel Container */}
        <View style={styles.wheelContainer}>
          {/* Wheel */}
          <Animated.View 
            style={[styles.wheel, { transform: [{ rotate: spin }] }]}
          >
            {prizes.map((prize, index) => {
              const segmentAngle = 360 / prizes.length;
              const rotate = `${index * segmentAngle}deg`;
              
              return (
                <View 
                  key={prize.id}
                  style={[
                    styles.segment,
                    { 
                      backgroundColor: prize.color,
                      transform: [
                        { rotate: rotate },
                        { translateX: width * 0.35 }
                      ]
                    }
                  ]}
                >
                  <Text style={styles.segmentText}>{prize.points}</Text>
                </View>
              );
            })}
          </Animated.View>

          {/* Center circle */}
          <View style={styles.centerCircle}>
            <Text style={styles.centerText}>SPIN</Text>
          </View>

          {/* Pointer */}
          <View style={styles.pointer} />
        </View>

        {/* Spin Button */}
        <TouchableOpacity 
          style={[styles.spinButton, spinning && styles.disabledButton]}
          onPress={spinWheel}
          disabled={spinning}
        >
          <Text style={styles.spinButtonText}>
            {spinning ? 'Spinning...' : 'SPIN NOW'}
          </Text>
        </TouchableOpacity>

        {/* Result Modal */}
        <Modal
          visible={showResult}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.congratsText}>Congratulations!</Text>
              <Text style={styles.pointsText}>You won {winner} points!</Text>
              
              <Image
                source={require('../../assets/images/TRISON.jpg')}
                style={styles.confettiImage}
                resizeMode="contain"
              />
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Text style={styles.closeButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Footer />
      </View>
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
    alignItems: 'center',
    // paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  wheelContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  wheel: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.4,
    borderWidth: 10,
    borderColor: colors.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: '50%',
    transformOrigin: 'right bottom',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
  },
  segmentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    transform: [{ rotate: '60deg' }],
  },
  centerCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  pointer: {
    position: 'absolute',
    top: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.orange,
    zIndex: 5,
  },
  spinButton: {
    backgroundColor: colors.orange,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
  },
  spinButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  confettiImage: {
    width: 150,
    height: 150,
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SpinToWinScreen;