import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomerTheme } from '@/constants/CustomerTheme';
import { appointmentAPI } from '@/services/api';
import { AuthContext } from '../_layout';
import BookingModal from '../components/BookingModal';
import ReceiptViewer from '../components/ReceiptViewer';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Appointment {
  id: number;
  user_name: string;
  service_name: string;
  service_price: number;
  appointment_date: string;
  appointment_time: string;
  barber_name: string;
  payment_status?: string;
  payment_id?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

export default function BookingScreen() {
  const { user, isAuthenticated, signIn } = useContext(AuthContext);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;

  console.log('BookingScreen - Current user:', user);
  console.log('BookingScreen - User ID:', user?.id);
  console.log('BookingScreen - Is authenticated:', isAuthenticated);

  useEffect(() => {
    console.log('BookingScreen useEffect - User changed:', user);
    if (user) {
      console.log('User exists, fetching appointments for user ID:', user.id);
      fetchAppointments();
      startAnimations();
    } else {
      console.log('No user, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // If no user and not loading, show login message
  if (!user && !loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please log in to view your appointments</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fetchAppointments = async () => {
    if (!user) {
      console.log('📅 BOOKING - No user, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('📅 BOOKING - Fetching appointments for user:', user.id);
      const response = await appointmentAPI.getUserAppointments(user.id);
      console.log('📅 BOOKING - API response:', response);

      if (response.success && response.data) {
        console.log('📅 BOOKING - Appointments loaded:', response.data.length, 'appointments');
        setAppointments(response.data);
      } else {
        console.log('📅 BOOKING - API failed:', response.message);
        Alert.alert('Error', response.message || 'Failed to fetch appointments');
        setAppointments([]);
      }
    } catch (error) {
      console.error('📅 BOOKING - Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch appointments. Please try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return CustomerTheme.colors.accent;
      case 'pending':
        return '#FFA500';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return CustomerTheme.colors.mutedText;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBookNew = () => {
    setShowBookingModal(true);
  };

  const handleBookingComplete = async () => {
    // Show refreshing state
    setRefreshing(true);
    
    // Small delay to ensure database is updated
    setTimeout(async () => {
      // Refresh appointments after booking
      await fetchAppointments();
      // Switch to upcoming tab to show the new appointment
      setActiveTab('upcoming');
      // Hide refreshing state
      setRefreshing(false);
    }, 500);
  };

  const handleViewReceipt = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowReceiptViewer(true);
  };

  const handleReceiptViewerClose = () => {
    setShowReceiptViewer(false);
    setSelectedAppointment(null);
  };

  const handleStatusUpdate = () => {
    // Refresh appointments when status is updated
    fetchAppointments();
  };

  const cancelAppointment = async (appointmentId: number) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await appointmentAPI.cancelAppointment(appointmentId);
              if (response.success) {
                // Update local state
                setAppointments(prev => 
                  prev.map(apt => 
                    apt.id === appointmentId 
                      ? { ...apt, status: 'cancelled' as const }
                      : apt
                  )
                );
                Alert.alert('Success', 'Appointment cancelled successfully');
              }
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.serviceName}>{item.service_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.appointmentDetails}>
        <Text style={styles.barberName}>Barber: {item.barber_name}</Text>
        <Text style={styles.appointmentDate}>{formatDate(item.appointment_date)}</Text>
        <Text style={styles.appointmentTime}>Time: {item.appointment_time}</Text>
        <Text style={styles.appointmentPrice}>Price: ₱{item.price}</Text>
      </View>

      <View style={styles.appointmentActions}>
        {item.status === 'confirmed' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => cancelAppointment(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        {/* Show View Receipt button for all appointments (customers can view their receipts) */}
        <TouchableOpacity 
          style={styles.viewReceiptButton}
          onPress={() => handleViewReceipt(item)}
        >
          <Text style={styles.viewReceiptButtonText}>📄 View Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'pending' || apt.status === 'confirmed'
  );
  
  const historyAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  );

  const currentAppointments = activeTab === 'upcoming' ? upcomingAppointments : historyAppointments;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CustomerTheme.colors.accent} />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Appointments</Text>
          <Text style={styles.subtitle}>Manage your bookings</Text>
        </View>
        <TouchableOpacity style={styles.bookNewButton} onPress={() => handleBookNew()}>
          <LinearGradient
            colors={['#FF6B6B', '#8B0000']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookNewButtonText}>+ Book New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.barbershopInfo,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.barbershopName}>Mick's Barbershop</Text>    
        <Text style={styles.barbershopLocation}>📍 Iligan City, Lanao del Norte, Philippines</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.tabContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History ({historyAppointments.length})
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.content}>
        {refreshing && (
          <View style={styles.refreshingContainer}>
            <ActivityIndicator size="small" color={CustomerTheme.colors.accent} />
            <Text style={styles.refreshingText}>Updating appointments...</Text>
          </View>
        )}
        
        {currentAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' 
                ? 'No upcoming appointments' 
                : 'No appointment history'
              }
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Book New Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={currentAppointments}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>

      {/* Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingComplete={handleBookingComplete}
        user={user}
      />

      {/* Receipt Viewer Modal */}
      {selectedAppointment && (
        <ReceiptViewer
          visible={showReceiptViewer}
          onClose={handleReceiptViewerClose}
          appointment={selectedAppointment}
          onStatusUpdate={handleStatusUpdate}
          isAdmin={false}
        />
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomerTheme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CustomerTheme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: CustomerTheme.colors.mutedText,
  },
  debugText: {
    marginTop: CustomerTheme.spacing.sm,
    fontSize: 12,
    color: CustomerTheme.colors.accent,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: CustomerTheme.colors.mutedText,
    fontWeight: '300',
  },
  bookNewButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  barbershopInfo: {
    backgroundColor: 'rgba(139, 0, 0, 0.05)',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.1)',
  },
  barbershopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  barbershopLocation: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
    textAlign: 'center',
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(139, 0, 0, 0.05)',
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: CustomerTheme.spacing.lg,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: CustomerTheme.spacing.sm,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: CustomerTheme.spacing.sm,
    paddingVertical: CustomerTheme.spacing.xs,
    borderRadius: CustomerTheme.radius.sm,
  },
  statusText: {
    color: CustomerTheme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginBottom: CustomerTheme.spacing.sm,
  },
  barberName: {
    fontSize: 14,
    color: CustomerTheme.colors.text,
    marginBottom: CustomerTheme.spacing.xs,
  },
  appointmentDate: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
    marginBottom: CustomerTheme.spacing.xs,
  },
  appointmentTime: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
    marginBottom: CustomerTheme.spacing.xs,
  },
  appointmentPrice: {
    fontSize: 14,
    color: CustomerTheme.colors.accent,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: CustomerTheme.spacing.sm,
    paddingHorizontal: CustomerTheme.spacing.md,
    borderRadius: CustomerTheme.radius.md,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: CustomerTheme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: CustomerTheme.spacing.sm,
    gap: CustomerTheme.spacing.sm,
  },
  viewReceiptButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewReceiptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: CustomerTheme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: CustomerTheme.colors.mutedText,
    textAlign: 'center',
    marginBottom: CustomerTheme.spacing.lg,
  },
  refreshingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: CustomerTheme.spacing.md,
    gap: CustomerTheme.spacing.sm,
  },
  refreshingText: {
    fontSize: 14,
    color: CustomerTheme.colors.accent,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: CustomerTheme.colors.accent,
    paddingVertical: CustomerTheme.spacing.md,
    paddingHorizontal: CustomerTheme.spacing.lg,
    borderRadius: CustomerTheme.radius.lg,
  },
  bookButtonText: {
    color: CustomerTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: CustomerTheme.colors.accent,
    paddingVertical: CustomerTheme.spacing.md,
    paddingHorizontal: CustomerTheme.spacing.xl,
    borderRadius: CustomerTheme.radius.lg,
    marginTop: CustomerTheme.spacing.md,
  },
  loginButtonText: {
    color: CustomerTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

