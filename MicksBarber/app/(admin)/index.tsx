import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { AdminTheme } from '@/constants/AdminTheme';
import { AuthContext } from '../_layout';
import { appointmentAPI } from '@/services/api';
import ReceiptViewer from '../components/ReceiptViewer';

interface Appointment {
  id: number;
  user_id: number;
  barber_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  user_name?: string;
  barber_name?: string;
  service_name?: string;
  service_price?: number;
}

export default function AdminDashboard() {
  const { user, signOut } = useContext(AuthContext);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [allAppointmentsHistory, setAllAppointmentsHistory] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);

  const fetchAppointments = async () => {
    try {
      console.log('🔄 Fetching appointments from database...');
      
      // Fetch from the real API only
      const response = await appointmentAPI.getAllAppointments();
      if (response.success) {
        setAppointments(response.data);
        console.log('✅ Database data loaded:', response.data.length, 'appointments');
      } else {
        console.log('⚠️ No appointments found in database');
        setAppointments([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setAppointments([]);
      Alert.alert('Error', 'Failed to load appointments from database');
    }
  };

  const fetchAllAppointmentsHistory = async () => {
    try {
      console.log('🔄 Fetching all appointment history...');
      const response = await appointmentAPI.getAllAppointments();
      if (response.success) {
        setAllAppointmentsHistory(response.data);
        setFilteredAppointments(response.data);
        console.log('✅ All appointment history loaded:', response.data.length, 'appointments');
      }
    } catch (error) {
      console.error('❌ Error loading appointment history:', error);
    }
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredAppointments(allAppointmentsHistory);
    } else {
      const filtered = allAppointmentsHistory.filter(appointment => 
        appointment.user_name?.toLowerCase().includes(query.toLowerCase()) ||
        appointment.barber_name?.toLowerCase().includes(query.toLowerCase()) ||
        appointment.service_name?.toLowerCase().includes(query.toLowerCase()) ||
        appointment.appointment_date?.includes(query) ||
        appointment.appointment_time?.includes(query) ||
        appointment.status?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAppointments(filtered);
    }
  };

  useEffect(() => {
    console.log('Admin dashboard mounted, fetching appointments...');
    fetchAppointments();
    fetchAllAppointmentsHistory();
    setLoading(false);
  }, []);

  // Refresh data when component becomes visible again
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Admin dashboard focused, refreshing data...');
      fetchAppointments();
    };

    // This will trigger when the screen comes into focus
    const unsubscribe = () => {
      // In a real app, you'd use navigation focus events
      // For now, we'll refresh on every mount
    };

    return unsubscribe;
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Appointments updated:', appointments.length, 'appointments');
    console.log('Pending appointments:', appointments.filter(apt => apt.status === 'pending').length);
    console.log('Today appointments:', appointments.filter(apt => {
      const today = new Date().toISOString().split('T')[0];
      return apt.appointment_date === today && apt.status === 'confirmed';
    }).length);
  }, [appointments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    await fetchAllAppointmentsHistory();
    setRefreshing(false);
  };

  const handleApproveAppointment = async (appointmentId: number) => {
    try {
      // Update via API first
      await appointmentAPI.updateAppointmentStatus(appointmentId, 'confirmed');
      
      // Refresh data from database
      await fetchAppointments();
      await fetchAllAppointmentsHistory();
      
      Alert.alert('Success', 'Appointment approved!');
      console.log('✅ Appointment', appointmentId, 'approved in database');
    } catch (error) {
      console.error('❌ Error approving appointment:', error);
      Alert.alert('Error', 'Failed to approve appointment');
    }
  };

  const handleRejectAppointment = async (appointmentId: number) => {
    try {
      // Update via API first
      await appointmentAPI.updateAppointmentStatus(appointmentId, 'cancelled');
      
      // Refresh data from database
      await fetchAppointments();
      await fetchAllAppointmentsHistory();
      
      Alert.alert('Success', 'Appointment rejected!');
      console.log('✅ Appointment', appointmentId, 'rejected in database');
    } catch (error) {
      console.error('❌ Error rejecting appointment:', error);
      Alert.alert('Error', 'Failed to reject appointment');
    }
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
    fetchAppointments();
    fetchAllAppointmentsHistory();
  };

  // Calculate statistics
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.appointment_date === today && apt.status === 'confirmed';
  });
  const totalRevenue = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + (apt.service_price || 0), 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.adminName}>{user?.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={() => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => {
                    console.log('Admin signing out...');
                    signOut();
                    // Navigation will be handled automatically by the auth guard in _layout.tsx
                    console.log('Authentication state cleared, auth guard will handle navigation');
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]} 
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
              Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Statistics Cards */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Dashboard Overview</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{pendingAppointments.length}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                  <Text style={styles.statSubLabel}>Appointments</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{todayAppointments.length}</Text>
                  <Text style={styles.statLabel}>Today's</Text>
                  <Text style={styles.statSubLabel}>Appointments</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>₱{totalRevenue.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={styles.statSubLabel}>Revenue</Text>
                </View>
              </View>
            </View>


            {/* Pending Appointments */}
            <View style={styles.pendingSection}>
              <Text style={styles.sectionTitle}>Pending Approvals</Text>
              {pendingAppointments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No pending appointments</Text>
                </View>
              ) : (
                pendingAppointments.map((appointment) => (
                  <View key={appointment.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.customerName}>{appointment.user_name || 'Customer'}</Text>
                      <Text style={styles.appointmentStatus}>Pending</Text>
                    </View>
                    
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.appointmentText}>
                        📅 {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                      </Text>
                      <Text style={styles.appointmentText}>
                        💇 {appointment.barber_name || 'Barber'} - {appointment.service_name || 'Service'}
                      </Text>
                      <Text style={styles.appointmentText}>
                        💰 ₱{appointment.service_price || 0}
                      </Text>
                    </View>
                    
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.viewReceiptButton}
                        onPress={() => handleViewReceipt(appointment)}
                      >
                        <Text style={styles.viewReceiptButtonText}>📄 View Receipt</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.rejectButton}
                        onPress={() => handleRejectAppointment(appointment.id)}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.approveButton}
                        onPress={() => handleApproveAppointment(appointment.id)}
                      >
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Today's Appointments */}
            <View style={styles.todaySection}>
              <Text style={styles.sectionTitle}>Today's Appointments</Text>
              {todayAppointments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No appointments today</Text>
                </View>
              ) : (
                todayAppointments.map((appointment) => (
                  <View key={appointment.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.customerName}>{appointment.user_name || 'Customer'}</Text>
                      <Text style={[styles.appointmentStatus, styles.confirmedStatus]}>Confirmed</Text>
                    </View>
                    
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.appointmentText}>
                        ⏰ {formatTime(appointment.appointment_time)}
                      </Text>
                      <Text style={styles.appointmentText}>
                        💇 {appointment.barber_name || 'Barber'} - {appointment.service_name || 'Service'}
                      </Text>
                      <Text style={styles.appointmentText}>
                        💰 ₱{appointment.service_price || 0}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* History Content */}
        {activeTab === 'history' && (
          <>
            {/* Search Bar */}
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Appointment History</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search appointments..."
                  placeholderTextColor={AdminTheme.colors.mutedText}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                <Text style={styles.searchResults}>
                  {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                </Text>
              </View>
            </View>

            {/* Appointments History */}
            <View style={styles.historyListSection}>
              {filteredAppointments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No appointments match your search' : 'No appointments found'}
                  </Text>
                </View>
              ) : (
                filteredAppointments.map((appointment) => (
                  <View key={appointment.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.customerName}>{appointment.user_name || 'Customer'}</Text>
                      <Text style={[
                        styles.appointmentStatus,
                        appointment.status === 'confirmed' && styles.confirmedStatus,
                        appointment.status === 'cancelled' && styles.cancelledStatus,
                        appointment.status === 'pending' && styles.pendingStatus
                      ]}>
                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                      </Text>
                    </View>
                    
                    <View style={styles.historyDetails}>
                      <Text style={styles.historyText}>
                        <Text style={styles.historyLabel}>Date:</Text> {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                      </Text>
                      <Text style={styles.historyText}>
                        <Text style={styles.historyLabel}>Service:</Text> {appointment.service_name}
                      </Text>
                      <Text style={styles.historyText}>
                        <Text style={styles.historyLabel}>Barber:</Text> {appointment.barber_name}
                      </Text>
                      <Text style={styles.historyText}>
                        <Text style={styles.historyLabel}>Price:</Text> ₱{appointment.service_price || 0}
                      </Text>
                      <Text style={styles.historyText}>
                        <Text style={styles.historyLabel}>Created:</Text> {new Date(appointment.created_at).toLocaleString()}
                      </Text>
                    </View>
                    
                    {/* View Receipt button for history appointments */}
                    <TouchableOpacity 
                      style={styles.viewReceiptButton}
                      onPress={() => handleViewReceipt(appointment)}
                    >
                      <Text style={styles.viewReceiptButtonText}>📄 View Receipt</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* Receipt Viewer Modal */}
        {selectedAppointment && (
          <ReceiptViewer
            visible={showReceiptViewer}
            onClose={handleReceiptViewerClose}
            appointment={selectedAppointment}
            onStatusUpdate={handleStatusUpdate}
            isAdmin={true}
          />
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminTheme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AdminTheme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: AdminTheme.colors.mutedText,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: AdminTheme.spacing.lg,
    backgroundColor: AdminTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: AdminTheme.colors.border,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AdminTheme.spacing.sm,
  },
  welcomeText: {
    fontSize: 16,
    color: AdminTheme.colors.mutedText,
  },
  adminName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AdminTheme.colors.text,
  },
  signOutButton: {
    backgroundColor: AdminTheme.colors.accent,
    paddingHorizontal: AdminTheme.spacing.md,
    paddingVertical: AdminTheme.spacing.sm,
    borderRadius: AdminTheme.radius.sm,
  },
  signOutText: {
    color: AdminTheme.colors.white,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: AdminTheme.spacing.lg,
    gap: AdminTheme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: AdminTheme.colors.white,
    padding: AdminTheme.spacing.md,
    borderRadius: AdminTheme.radius.md,
    alignItems: 'center',
    shadowColor: AdminTheme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AdminTheme.colors.accent,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AdminTheme.colors.text,
    marginTop: 4,
  },
  statSubLabel: {
    fontSize: 12,
    color: AdminTheme.colors.mutedText,
  },
  section: {
    padding: AdminTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AdminTheme.colors.text,
    marginBottom: AdminTheme.spacing.md,
  },
  emptyState: {
    backgroundColor: AdminTheme.colors.white,
    padding: AdminTheme.spacing.lg,
    borderRadius: AdminTheme.radius.md,
    alignItems: 'center',
  },
  emptyText: {
    color: AdminTheme.colors.mutedText,
    fontSize: 16,
  },
  appointmentCard: {
    backgroundColor: AdminTheme.colors.white,
    padding: AdminTheme.spacing.md,
    borderRadius: AdminTheme.radius.md,
    marginBottom: AdminTheme.spacing.md,
    shadowColor: AdminTheme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AdminTheme.spacing.sm,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: AdminTheme.colors.text,
  },
  appointmentStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminTheme.colors.accent,
    backgroundColor: AdminTheme.colors.surface,
    paddingHorizontal: AdminTheme.spacing.sm,
    paddingVertical: 2,
    borderRadius: AdminTheme.radius.sm,
  },
  confirmedStatus: {
    color: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  appointmentDetails: {
    marginBottom: AdminTheme.spacing.md,
  },
  appointmentText: {
    fontSize: 14,
    color: AdminTheme.colors.mutedText,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: AdminTheme.spacing.sm,
  },
  viewReceiptButton: {
    flex: 1,
    backgroundColor: AdminTheme.colors.surface,
    padding: AdminTheme.spacing.sm,
    borderRadius: AdminTheme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AdminTheme.colors.border,
  },
  viewReceiptButtonText: {
    color: AdminTheme.colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: AdminTheme.colors.black,
    padding: AdminTheme.spacing.sm,
    borderRadius: AdminTheme.radius.sm,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: AdminTheme.colors.white,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    backgroundColor: AdminTheme.colors.accent,
    padding: AdminTheme.spacing.sm,
    borderRadius: AdminTheme.radius.sm,
    alignItems: 'center',
  },
  approveButtonText: {
    color: AdminTheme.colors.white,
    fontWeight: '600',
  },
  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: AdminTheme.colors.white,
    marginHorizontal: AdminTheme.spacing.lg,
    marginTop: AdminTheme.spacing.sm,
    borderRadius: AdminTheme.radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: AdminTheme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: AdminTheme.spacing.sm,
    alignItems: 'center',
    borderRadius: AdminTheme.radius.sm,
  },
  activeTab: {
    backgroundColor: AdminTheme.colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: AdminTheme.colors.mutedText,
  },
  activeTabText: {
    color: AdminTheme.colors.white,
  },
  // History Styles
  historyCard: {
    backgroundColor: AdminTheme.colors.white,
    padding: AdminTheme.spacing.md,
    borderRadius: AdminTheme.radius.md,
    marginBottom: AdminTheme.spacing.sm,
    borderWidth: 1,
    borderColor: AdminTheme.colors.border,
    shadowColor: AdminTheme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AdminTheme.spacing.sm,
  },
  historyAction: {
    fontSize: 16,
    fontWeight: '600',
    color: AdminTheme.colors.text,
  },
  historyTime: {
    fontSize: 12,
    color: AdminTheme.colors.mutedText,
  },
  historyDetails: {
    gap: 4,
  },
  historyText: {
    fontSize: 14,
    color: AdminTheme.colors.text,
  },
  historyLabel: {
    fontWeight: '600',
    color: AdminTheme.colors.mutedText,
  },
  cancelledStatus: {
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  pendingStatus: {
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  // Search Styles
  searchContainer: {
    marginBottom: AdminTheme.spacing.md,
  },
  searchInput: {
    backgroundColor: AdminTheme.colors.white,
    borderWidth: 1,
    borderColor: AdminTheme.colors.border,
    borderRadius: AdminTheme.radius.md,
    paddingHorizontal: AdminTheme.spacing.md,
    paddingVertical: AdminTheme.spacing.sm,
    fontSize: 16,
    color: AdminTheme.colors.text,
    marginBottom: AdminTheme.spacing.sm,
  },
  searchResults: {
    fontSize: 14,
    color: AdminTheme.colors.mutedText,
    textAlign: 'center',
  },
  // New styles for updated design
  topImageContainer: {
    position: 'relative',
    height: 200,
  },
  topImage: {
    width: '100%',
    height: '100%',
    backgroundColor: AdminTheme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    alignItems: 'center',
  },
  adminTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AdminTheme.colors.white,
    marginBottom: 8,
  },
  adminSubtitle: {
    fontSize: 16,
    color: AdminTheme.colors.white,
    opacity: 0.9,
  },
  mainContent: {
    backgroundColor: AdminTheme.colors.white,
    marginTop: 20,
    borderTopLeftRadius: AdminTheme.radius.lg,
    borderTopRightRadius: AdminTheme.radius.lg,
    paddingTop: AdminTheme.spacing.lg,
  },
  statsSection: {
    paddingHorizontal: AdminTheme.spacing.lg,
    marginBottom: AdminTheme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: AdminTheme.spacing.sm,
  },
  pendingSection: {
    paddingHorizontal: AdminTheme.spacing.lg,
    marginBottom: AdminTheme.spacing.xl,
  },
  todaySection: {
    paddingHorizontal: AdminTheme.spacing.lg,
    marginBottom: AdminTheme.spacing.xl,
  },
  historySection: {
    paddingHorizontal: AdminTheme.spacing.lg,
    marginBottom: AdminTheme.spacing.lg,
  },
  historyListSection: {
    paddingHorizontal: AdminTheme.spacing.lg,
    paddingBottom: AdminTheme.spacing.xl,
  },
});

