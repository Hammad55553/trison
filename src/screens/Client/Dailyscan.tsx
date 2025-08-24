import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface ScanItem {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  points: number;
  status: 'completed' | 'pending';
}

const DailyScanHistoryScreen = () => {
  const navigation = useNavigation();
  const [scans, setScans] = useState<ScanItem[]>([
    {
      id: '1',
      name: 'Milk Delivery',
      date: '15 Jun 2023',
      time: '09:30 AM',
      location: 'Sector 12, Noida',
      points: 50,
      status: 'completed'
    },
    {
      id: '2',
      name: 'Newspaper',
      date: '15 Jun 2023',
      time: '08:15 AM',
      location: 'Sector 12, Noida',
      points: 20,
      status: 'completed'
    },
    {
      id: '3',
      name: 'Vegetables',
      date: '14 Jun 2023',
      time: '06:45 PM',
      location: 'Sector 12, Noida',
      points: 30,
      status: 'pending'
    },
    {
      id: '4',
      name: 'Bakery Items',
      date: '14 Jun 2023',
      time: '04:20 PM',
      location: 'Sector 12, Noida',
      points: 40,
      status: 'completed'
    },
    {
      id: '5',
      name: 'Grocery',
      date: '13 Jun 2023',
      time: '11:10 AM',
      location: 'Sector 12, Noida',
      points: 60,
      status: 'completed'
    },
  ]);

  const [showAllHistory, setShowAllHistory] = useState(false);

  const todayScans = scans.filter(scan => scan.date === '15 Jun 2023');
  const displayedScans = showAllHistory ? scans : todayScans;

  const renderScanItem = ({ item }: { item: ScanItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.pyramidContainer}>
          <View style={styles.pyramidLayer1} />
          <View style={styles.pyramidLayer2} />
          <View style={styles.pyramidLayer3} />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.location}</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{item.points}</Text>
          <Text style={styles.pointsLabel}>Points</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={16} color={colors.gray600} />
          <Text style={styles.infoText}>{item.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="clock-outline" size={16} color={colors.gray600} />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={[
          styles.statusBadge,
          item.status === 'completed' ? styles.completedBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Completed' : 'Pending'}
          </Text>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Header 
        title="Daily Scan History"
        rightComponent={
          <TouchableOpacity style={styles.addButton}>
            <Icon name="plus" size={24} color={colors.white} />
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>

        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, !showAllHistory && styles.activeToggle]}
            onPress={() => setShowAllHistory(false)}
          >
            <Text style={[styles.toggleText, !showAllHistory && styles.activeToggleText]}>
              Today's Scans
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, showAllHistory && styles.activeToggle]}
            onPress={() => setShowAllHistory(true)}
          >
            <Text style={[styles.toggleText, showAllHistory && styles.activeToggleText]}>
              All History
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayedScans}
          renderItem={renderScanItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="qrcode-scan" size={60} color={colors.gray300} />
              <Text style={styles.emptyText}>No scan history found</Text>
            </View>
          }
        />

        <TouchableOpacity style={styles.scanButton}>
          <Icon name="qrcode-scan" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    bottom: hp('10%'),
  },

  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 60,
    borderRadius: 20,
    right: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: colors.primaryLight,
  },
  toggleText: {
    color: colors.gray600,
    fontWeight: '500',
  },
  activeToggleText: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pyramidContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  pyramidLayer1: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.orange,
  },
  pyramidLayer2: {
    width: 24,
    height: 8,
    backgroundColor: colors.primaryLight,
    marginTop: -4,
  },
  pyramidLayer3: {
    width: 36,
    height: 6,
    backgroundColor: colors.primary,
    marginTop: -2,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.orange,
  },
  pointsLabel: {
    fontSize: 12,
    color: colors.gray600,
  },
  cardBody: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoText: {
    marginLeft: 8,
    color: colors.gray600,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  detailsButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: colors.gray600,
    fontSize: 16,
  },
  scanButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: colors.orange,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default DailyScanHistoryScreen;