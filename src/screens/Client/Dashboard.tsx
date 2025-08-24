// screens/Client/ClientDashboardScreen.tsx
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Animated, 
  FlatList,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../constants/colors';
import Footer from '../../components/Footer';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ClientDashboardScreen = () => {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Promotional cards data
  const promoCards = [
    {
      id: 1,
      text: "Trison Solar proudly unveils its LATEST BATTERY, Delivering superior Efficiency and cutting-edge innovation for your Energy needs!",
      bgColor: colors.primaryLight
    },
    {
      id: 2,
      text: "Special offer: Get 10% discount on all solar products this month!",
      bgColor: colors.primary
    },
    {
      id: 3,
      text: "New inventory arriving next week - pre-order now!",
      bgColor: colors.primaryLight
    }
  ];

  // Inaam Bazaar items
  const bazaarItems = [
    { id: 1, name: 'Daily Scan', screen: 'Dailyscan' },
    { id: 2, name: 'Item Schemes', screen: 'ItemSchemes' },
    { id: 3, name: 'Spin & Win', screen: 'Spin' },
    { id: 4, name: 'QR Details', screen: 'QRDetails' }
  ];

  // Mazeed Options
  const mazeedOptions = [
    { id: 1, name: 'Shop Branding Request', screen: 'ShopBranding' },
    { id: 2, name: 'Complaints', screen: 'Complaints' },
    { id: 3, name: 'Claims', screen: 'Claims' }
  ];

 const handleNavigation = (screenName: string) => {
  navigation.navigate(screenName as never);
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container}>
          {/* Balance Card */}
          <View style={styles.card}>
            <Text style={styles.balanceAmount}>4,500</Text>
            <Text style={styles.balanceLabel}>Current Points Balance</Text>
          </View>

          {/* Send Money Card */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleNavigation('CashBhejein')}
          >
            <Text style={styles.cardTitle}>Cash Bhejein</Text>
            <Text style={styles.cardSubtitle}>Khaata</Text>
          </TouchableOpacity>

          {/* Swipeable Promotional Cards */}
          <View style={styles.promoContainer}>
            <FlatList
              data={promoCards}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              renderItem={({ item }) => (
                <View style={[styles.promoCard, { backgroundColor: item.bgColor }]}>
                  <Text style={styles.promoText}>{item.text}</Text>
                </View>
              )}
            />
            <View style={styles.indicatorContainer}>
              {promoCards.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [8, 16, 8],
                  extrapolate: 'clamp',
                });
                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View
                    key={`indicator-${i}`}
                    style={[styles.indicator, { width: dotWidth, opacity }]}
                  />
                );
              })}
            </View>
          </View>

          {/* Trison Brand Section */}
          <View style={styles.brandCard}>
            <Text style={styles.brandTitle}>Trison</Text>
            <Text style={styles.brandSubtitle}>10 YEARS VIBRANT</Text>
            <Text style={styles.brandSubtitle}>BERTRA BROST</Text>
          </View>

          {/* Inaam Bazaar Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inaam Bazaar</Text>
            <View style={styles.gridContainer}>
              {bazaarItems.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.gridItem}
                  onPress={() => handleNavigation(item.screen)}
                >
                  <Text style={styles.gridText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mazeed Options Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mazeed Options</Text>
            <View style={styles.optionsContainer}>
              {mazeedOptions.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.optionItem}
                  onPress={() => handleNavigation(item.screen)}
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* QR Code Button Section */}
          <View style={styles.section}>
            <View style={styles.qrButtonContainer}>
                        <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => handleNavigation('ScanQR')}
            activeOpacity={0.7}
          >
            <Icon name="qrcode-scan" size={20} color={colors.white} />
            <Text style={styles.qrButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        
        {/* Footer Component */}
        <Footer />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    marginTop: 10,
    padding: 15,
    marginBottom: 100, // Added space for footer
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.orange,
    textAlign: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  promoContainer: {
    marginBottom: 15,
  },
  promoCard: {
    width: width - 40,
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    height: 120,
    justifyContent: 'center',
  },
  promoText: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    marginHorizontal: 4,
  },
  brandCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.orange,
    marginBottom: 5,
  },
  brandSubtitle: {
    fontSize: 16,
    color: colors.white,
    marginTop: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    paddingLeft: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gridText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  optionItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  qrButtonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrButton: {
    backgroundColor: colors.orange,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 180,
  },
  qrButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});

export default ClientDashboardScreen;