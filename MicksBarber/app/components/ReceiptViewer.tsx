import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AdminTheme } from '@/constants/AdminTheme';
import { appointmentAPI } from '@/services/api';
import { paymentAPI } from '@/services/paymentAPI';
import Constants from 'expo-constants';

// Resolve base URL that works on device (Expo Go) and emulator
function resolveBaseUrl(): string {
  // Default to localhost (works on web/emulator)
  let host = 'localhost';

  // Try to infer LAN IP from Expo (works on Expo Go on device)
  const hostUri = (Constants as any)?.expoConfig?.hostUri;
  if (hostUri) {
    // Extract IP from hostUri (format: "192.168.1.100:8081")
    const parts = hostUri.split(':');
    if (parts.length >= 1) {
      host = parts[0];
    }
  }

  return `http://${host}:3000`;
}

interface ReceiptViewerProps {
  visible: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    user_name: string;
    service_name: string;
    service_price: number;
    appointment_date: string;
    appointment_time: string;
    barber_name: string;
    payment_status?: string;
    payment_id?: number;
  };
  onStatusUpdate: () => void;
  isAdmin?: boolean; // New prop to determine if this is admin or customer view
}

export default function ReceiptViewer({ 
  visible, 
  onClose, 
  appointment, 
  onStatusUpdate,
  isAdmin = false 
}: ReceiptViewerProps) {
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Fetch receipt image when modal opens
  React.useEffect(() => {
    if (visible && appointment.id) {
      fetchReceiptImage();
    }
  }, [visible, appointment.id]);

  const fetchReceiptImage = async () => {
    try {
      setLoading(true);
      console.log('Fetching payment for appointment:', appointment.id);
      
      // Fetch payment data for this appointment
      const paymentData = await paymentAPI.getPaymentByAppointment(appointment.id);
      console.log('Payment data:', paymentData);
      
      if (paymentData && paymentData.receipt_image) {
        // Construct the full URL for the receipt image
        const baseUrl = resolveBaseUrl();
        const receiptUrl = `${baseUrl}${paymentData.receipt_image}`;
        console.log('Receipt URL:', receiptUrl);
        setReceiptImage(receiptUrl);
      } else {
        console.log('No receipt image found for this payment');
        setReceiptImage(null);
      }
    } catch (error: any) {
      console.error('Error fetching receipt:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        Alert.alert('No Payment Found', 'No payment record found for this appointment. The customer may not have completed the payment process yet.');
      } else {
        Alert.alert('Error', 'Failed to load receipt image');
      }
      setReceiptImage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await appointmentAPI.updateAppointmentStatus(appointment.id, 'confirmed');
      Alert.alert('Success', 'Appointment approved successfully!');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error approving appointment:', error);
      Alert.alert('Error', 'Failed to approve appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await appointmentAPI.updateAppointmentStatus(appointment.id, 'cancelled');
      Alert.alert('Success', 'Appointment rejected');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      Alert.alert('Error', 'Failed to reject appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Receipt Verification</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Appointment Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>{appointment.user_name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue}>{appointment.service_name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Barber:</Text>
              <Text style={styles.detailValue}>{appointment.barber_name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(appointment.appointment_date)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{formatTime(appointment.appointment_time)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>₱{appointment.service_price}</Text>
            </View>
          </View>

          {/* Receipt Image */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionTitle}>Payment Receipt</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={AdminTheme.colors.accent} />
                <Text style={styles.loadingText}>Loading receipt...</Text>
              </View>
            ) : receiptImage ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: receiptImage }} 
                  style={styles.receiptImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.noReceiptContainer}>
                <Text style={styles.noReceiptText}>No receipt available</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons - Only show for admin */}
        {isAdmin && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.rejectButton]} 
              onPress={handleReject}
              disabled={loading}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.approveButton]} 
              onPress={handleApprove}
              disabled={loading}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminTheme.colors.background,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AdminTheme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AdminTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: AdminTheme.colors.mutedText,
  },
  content: {
    flex: 1,
    padding: AdminTheme.spacing.lg,
  },
  detailsSection: {
    backgroundColor: AdminTheme.colors.white,
    borderRadius: AdminTheme.radius.md,
    padding: AdminTheme.spacing.lg,
    marginBottom: AdminTheme.spacing.lg,
    shadowColor: AdminTheme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AdminTheme.colors.text,
    marginBottom: AdminTheme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: AdminTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AdminTheme.colors.border,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AdminTheme.colors.mutedText,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: AdminTheme.colors.text,
    flex: 2,
    textAlign: 'right',
  },
  receiptSection: {
    backgroundColor: AdminTheme.colors.white,
    borderRadius: AdminTheme.radius.md,
    padding: AdminTheme.spacing.lg,
    marginBottom: AdminTheme.spacing.lg,
    shadowColor: AdminTheme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: AdminTheme.spacing.xl,
  },
  loadingText: {
    marginTop: AdminTheme.spacing.sm,
    color: AdminTheme.colors.mutedText,
  },
  imageContainer: {
    alignItems: 'center',
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: AdminTheme.radius.sm,
  },
  noReceiptContainer: {
    alignItems: 'center',
    padding: AdminTheme.spacing.xl,
  },
  noReceiptText: {
    fontSize: 16,
    color: AdminTheme.colors.mutedText,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: AdminTheme.spacing.lg,
    backgroundColor: AdminTheme.colors.white,
    borderTopWidth: 1,
    borderTopColor: AdminTheme.colors.border,
    gap: AdminTheme.spacing.md,
  },
  button: {
    flex: 1,
    padding: AdminTheme.spacing.md,
    borderRadius: AdminTheme.radius.md,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: AdminTheme.colors.black,
  },
  rejectButtonText: {
    color: AdminTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: AdminTheme.colors.accent,
  },
  approveButtonText: {
    color: AdminTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
