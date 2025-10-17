import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CustomerTheme } from '@/constants/CustomerTheme';
import { barberAPI, serviceAPI, appointmentAPI } from '@/services/api';
import PaymentMethod from './PaymentMethod';
import ReceiptPayment from './ReceiptPayment';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface Barber {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  email: string;
  phone: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
  user: User | null;
}

export default function BookingModal({ visible, onClose, onBookingComplete, user }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<number | null>(null);
  
  // Date and time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateObj, setSelectedDateObj] = useState<Date>(new Date());
  const [selectedTimeObj, setSelectedTimeObj] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showTimeGrid, setShowTimeGrid] = useState(false);

  const steps = [
    { id: 1, title: 'Booking', subtitle: 'Select Service' },
    { id: 2, title: 'Barber', subtitle: 'Choose a Barber' },
    { id: 3, title: 'Date', subtitle: 'Pick Date & Time' },
    { id: 4, title: 'Payment', subtitle: 'Payment Method' },
    { id: 5, title: 'Overview', subtitle: 'Overview' }
  ];

  const fetchData = async () => {
    try {
      const [servicesResponse, barbersResponse] = await Promise.all([
        serviceAPI.getServices(),
        barberAPI.getBarbers()
      ]);

      if (servicesResponse.success) {
        setServices(servicesResponse.data);
      }
      if (barbersResponse.success) {
        setBarbers(barbersResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  React.useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const handleNext = async () => {
    if (currentStep < 5) {
      // If moving to payment step (step 4), create appointment first
      if (currentStep === 3) {
        await createAppointmentForPayment();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const createAppointmentForPayment = async () => {
    if (!user || !selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please complete all booking details');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        user_id: user.id,
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        notes: '',
        total_amount: selectedService.price,
        payment_status: 'pending'
      };

      console.log('Creating appointment for payment:', appointmentData);
      const response = await appointmentAPI.createAppointment(appointmentData);
      console.log('Appointment creation response:', response);
      
      if (response.success) {
        setCreatedAppointmentId(response.appointmentId);
        setCurrentStep(4); // Move to payment step
      } else {
        Alert.alert('Error', response.message || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('Error', 'Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate('');
    setSelectedTime('');
    onClose();
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    
    // The backend already updated the appointment with payment info
    // So we just need to show success and close the modal
    Alert.alert('Success', 'Appointment booked and payment completed successfully!');
    handleCancel();
    onBookingComplete();
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Error', error);
  };

  // Date picker handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDateObj(selectedDate);
      const dateString = selectedDate.toISOString().split('T')[0];
      setSelectedDate(dateString);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTimeObj(selectedTime);
      const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      
      // Validate business hours
      const [hours] = timeString.split(':');
      const hour = parseInt(hours);
      
      if (hour >= 9 && hour <= 17) {
        setSelectedTime(timeString);
      } else {
        Alert.alert('Invalid Time', 'Please select a time between 9:00 AM and 5:59 PM');
      }
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return date.toDateString() === selected.toDateString();
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      setSelectedDateObj(date);
      const dateString = date.toISOString().split('T')[0];
      setSelectedDate(dateString);
      setShowCalendar(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const renderServiceStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Service</Text>
      <ScrollView style={styles.optionsList}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.optionCard,
              selectedService?.id === service.id && styles.selectedOption
            ]}
            onPress={() => setSelectedService(service)}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{service.name}</Text>
              <Text style={styles.optionPrice}>₱{service.price}</Text>
            </View>
            <View style={styles.optionMeta}>
              <Text style={styles.optionDuration}>⏱️ {service.duration} mins</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBarberStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose a Barber</Text>
      <ScrollView style={styles.optionsList}>
        {barbers.map((barber) => (
          <TouchableOpacity
            key={barber.id}
            style={[
              styles.optionCard,
              selectedBarber?.id === barber.id && styles.selectedOption
            ]}
            onPress={() => setSelectedBarber(barber)}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{barber.name}</Text>
              <Text style={styles.optionSubtitle}>{barber.specialty}</Text>
            </View>
            <View style={styles.optionMeta}>
              <Text style={styles.optionRating}>⭐ {barber.rating}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const validateAndSetDate = (dateString: string) => {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateString)) {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date >= today) {
        console.log('Valid date:', dateString);
        setSelectedDate(dateString);
        return true;
      } else {
        Alert.alert('Invalid Date', 'Please select a date from today onwards');
        return false;
      }
    } else {
      Alert.alert('Invalid Format', 'Please enter date in YYYY-MM-DD format (e.g., 2024-01-15)');
      return false;
    }
  };

  const validateTimeInput = (timeString: string) => {
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(timeString)) {
      console.log('Valid time:', timeString);
      setSelectedTime(timeString);
      return true;
    } else {
      Alert.alert('Invalid Format', 'Please enter time in HH:MM format (e.g., 14:30)');
      return false;
    }
  };

  const validateAndSetTime = (timeString: string) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(timeString)) {
      const [hours] = timeString.split(':');
      const hour = parseInt(hours);
      
      // Check business hours (9 AM to 5:59 PM)
      if (hour >= 9 && hour <= 17) {
        console.log('Valid time:', timeString);
        setSelectedTime(timeString);
        return true;
      } else {
        Alert.alert('Invalid Time', 'Please select a time between 9:00 AM and 5:59 PM');
        return false;
      }
    } else {
      Alert.alert('Invalid Format', 'Please enter time in HH:MM format (e.g., 14:30)');
      return false;
    }
  };

  // Get tomorrow's date to prevent same-day bookings
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate;
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return 'Select Time';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };



  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isDisabled = isDateDisabled(date);
      const isSelected = isDateSelected(date);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isDisabled && styles.calendarDayDisabled
          ]}
          onPress={() => handleDateSelect(date)}
          disabled={isDisabled}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            isDisabled && styles.calendarDayTextDisabled
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.calendarNavButton}>
            <Text style={styles.calendarNavText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.calendarNavButton}>
            <Text style={styles.calendarNavText}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarWeekdays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.calendarWeekdayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {days}
        </View>
      </View>
    );
  };

  const renderTimeGrid = () => {
    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isSelected = selectedTime === timeString;
        
        timeSlots.push(
          <TouchableOpacity
            key={timeString}
            style={[
              styles.timeSlot,
              isSelected && styles.timeSlotSelected
            ]}
            onPress={() => {
              setSelectedTime(timeString);
              setShowTimeGrid(false);
            }}
          >
            <Text style={[
              styles.timeSlotText,
              isSelected && styles.timeSlotTextSelected
            ]}>
              {formatTimeForDisplay(timeString)}
            </Text>
          </TouchableOpacity>
        );
      }
    }
    
    return (
      <View style={styles.timeGridContainer}>
        <View style={styles.timeGridHeader}>
          <Text style={styles.timeGridTitle}>Select Time</Text>
          <TouchableOpacity onPress={() => setShowTimeGrid(false)} style={styles.timeGridClose}>
            <Text style={styles.timeGridCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.timeGridScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.timeGrid}>
            {timeSlots}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDateTimeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Pick Date & Time</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Select Date</Text>
        <Text style={styles.inputHint}>Choose your preferred date</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              validateAndSetDate(e.target.value);
            }}
            min={getTomorrowDate().toISOString().split('T')[0]}
            max={getMaxDate().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '15px',
              border: `1px solid ${CustomerTheme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: CustomerTheme.colors.background,
              fontSize: '16px',
              color: CustomerTheme.colors.text,
              outline: 'none',
            }}
          />
        ) : (
          <TouchableOpacity 
            style={[
              styles.pickerButton,
              selectedDate && styles.pickerButtonActive
            ]} 
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={[styles.pickerButtonText, { color: '#000000' }]}>
              {selectedDate ? formatDateForDisplay(selectedDate) : '📅 Select Date'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showCalendar && Platform.OS !== 'web' && renderCalendar()}
      {showTimeGrid && Platform.OS !== 'web' && renderTimeGrid()}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Select Time</Text>
        <Text style={styles.inputHint}>Choose your preferred time</Text>
        <Text style={styles.businessHoursText}>Business Hours: 9:00 AM - 5:59 PM</Text>
        {Platform.OS === 'web' ? (
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => {
              validateTimeInput(e.target.value);
            }}
            min="09:00"
            max="17:59"
            style={{
              width: '100%',
              padding: '15px',
              border: `1px solid ${CustomerTheme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: CustomerTheme.colors.background,
              fontSize: '16px',
              color: CustomerTheme.colors.text,
              outline: 'none',
            }}
          />
        ) : (
          <TouchableOpacity 
            style={[
              styles.pickerButton,
              selectedTime && styles.pickerButtonActive
            ]} 
            onPress={() => setShowTimeGrid(!showTimeGrid)}
          >
            <Text style={[styles.pickerButtonText, { color: '#000000' }]}>
              {selectedTime ? formatTimeForDisplay(selectedTime) : '🕐 Select Time'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedDate && selectedTime && (
        <View style={styles.selectedDateTimeContainer}>
          <Text style={styles.selectedDateTimeText}>
            Selected: {formatDateForDisplay(selectedDate)} at {formatTimeForDisplay(selectedTime)}
          </Text>
        </View>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTimeObj}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      {user && selectedService && (
        <ReceiptPayment
          userId={user.id}
          amount={selectedService.price}
          appointmentId={createdAppointmentId || 0}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </View>
  );

  const renderOverviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Overview</Text>
      <View style={styles.overviewContainer}>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Service:</Text>
          <Text style={styles.overviewValue}>{selectedService?.name}</Text>
        </View>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Barber:</Text>
          <Text style={styles.overviewValue}>{selectedBarber?.name}</Text>
        </View>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Date:</Text>
          <Text style={styles.overviewValue}>{formatDateForDisplay(selectedDate)}</Text>
        </View>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Time:</Text>
          <Text style={styles.overviewValue}>{formatTimeForDisplay(selectedTime)}</Text>
        </View>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Duration:</Text>
          <Text style={styles.overviewValue}>{selectedService?.duration} mins</Text>
        </View>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Total:</Text>
          <Text style={styles.overviewTotal}>₱{selectedService?.price}</Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderServiceStep();
      case 2: return renderBarberStep();
      case 3: return renderDateTimeStep();
      case 4: return renderPaymentStep();
      case 5: return renderOverviewStep();
      default: return null;
    }
  };

  const canProceed = () => {
    const result = (() => {
      switch (currentStep) {
        case 1: return selectedService !== null;
        case 2: return selectedBarber !== null;
        case 3: return selectedDate !== '' && selectedTime !== '';
        case 4: return true; // Payment step - handled by PaymentMethod component
        case 5: return true;
        default: return false;
      }
    })();
    
    console.log(`canProceed check - Step ${currentStep}:`, {
      selectedService: !!selectedService,
      selectedBarber: !!selectedBarber,
      selectedDate,
      selectedTime,
      result
    });
    
    return result;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Step Indicators */}
          <View style={styles.stepIndicators}>
            {steps.map((step) => (
              <View key={step.id} style={styles.stepIndicator}>
                <Text style={[
                  styles.stepIndicatorText,
                  currentStep >= step.id && styles.activeStepText
                ]}>
                  {step.title}
                </Text>
              </View>
            ))}
          </View>

          {/* Main Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              {currentStep > 1 && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.cardTitle}>
                {steps[currentStep - 1].subtitle}
              </Text>
            </View>

            {renderStepContent()}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              {currentStep === 5 ? (
                <TouchableOpacity 
                  style={[styles.bookButton, !canProceed() && styles.disabledButton]} 
                  onPress={() => setCurrentStep(4)} // Go back to payment step
                  disabled={!canProceed() || loading}
                >
                  <Text style={styles.bookButtonText}>
                    Back to Payment
                  </Text>
                </TouchableOpacity>
              ) : currentStep === 4 ? (
                <TouchableOpacity 
                  style={[styles.nextButton, !canProceed() && styles.disabledButton]} 
                  onPress={handleNext}
                  disabled={!canProceed()}
                >
                  <Text style={styles.nextButtonText}>Review</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.nextButton, !canProceed() && styles.disabledButton]} 
                  onPress={handleNext}
                  disabled={!canProceed()}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepIndicator: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicatorText: {
    fontSize: 12,
    color: CustomerTheme.colors.mutedText,
    fontWeight: '500',
  },
  activeStepText: {
    color: CustomerTheme.colors.accent,
    fontWeight: 'bold',
  },
  mainCard: {
    backgroundColor: CustomerTheme.colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: CustomerTheme.colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: CustomerTheme.colors.accent,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  stepContent: {
    minHeight: 300,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomerTheme.colors.text,
    marginBottom: 15,
  },
  optionsList: {
    maxHeight: 250,
  },
  optionCard: {
    backgroundColor: CustomerTheme.colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: CustomerTheme.colors.accent,
    backgroundColor: CustomerTheme.colors.white,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomerTheme.colors.text,
    flex: 1,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomerTheme.colors.accent,
  },
  optionSubtitle: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
  },
  optionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionDuration: {
    fontSize: 12,
    color: CustomerTheme.colors.mutedText,
  },
  optionRating: {
    fontSize: 12,
    color: CustomerTheme.colors.accent,
    fontWeight: '600',
  },
  dateTimeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
    width: '100%',
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: CustomerTheme.colors.text,
    fontWeight: '500',
  },
  businessHoursText: {
    fontSize: 12,
    marginBottom: 4,
    color: CustomerTheme.colors.mutedText,
    fontStyle: 'italic',
  },
  timeFormatText: {
    fontSize: 11,
    marginBottom: 8,
    color: CustomerTheme.colors.accent,
    fontWeight: '500',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: CustomerTheme.colors.border,
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#ffffff',
    marginTop: 8,
    minHeight: 50,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerButtonActive: {
    borderColor: CustomerTheme.colors.accent,
    backgroundColor: CustomerTheme.colors.white,
    borderWidth: 2,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'left',
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: CustomerTheme.colors.border,
    borderRadius: 8,
    padding: 15,
    backgroundColor: CustomerTheme.colors.background,
    fontSize: 16,
    color: CustomerTheme.colors.text,
  },
  selectedDateTimeContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: CustomerTheme.colors.accent,
  },
  selectedDateTimeText: {
    fontSize: 16,
    color: CustomerTheme.colors.text,
    fontWeight: '500',
  },
  overviewContainer: {
    backgroundColor: CustomerTheme.colors.surface,
    borderRadius: 12,
    padding: 15,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: CustomerTheme.colors.border,
  },
  overviewLabel: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
  },
  overviewValue: {
    fontSize: 14,
    color: CustomerTheme.colors.text,
    fontWeight: '500',
  },
  overviewTotal: {
    fontSize: 16,
    color: CustomerTheme.colors.accent,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: CustomerTheme.colors.black,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: CustomerTheme.colors.white,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: CustomerTheme.colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: CustomerTheme.colors.white,
    fontWeight: '600',
  },
  bookButton: {
    flex: 1,
    backgroundColor: CustomerTheme.colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: CustomerTheme.colors.white,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: CustomerTheme.colors.mutedText,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomerTheme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: CustomerTheme.colors.border,
    borderRadius: 8,
    padding: 15,
    backgroundColor: CustomerTheme.colors.background,
    fontSize: 16,
    color: CustomerTheme.colors.text,
    marginTop: 8,
  },
  inputHint: {
    fontSize: 12,
    color: CustomerTheme.colors.mutedText,
    marginTop: 4,
    marginBottom: 8,
  },
  // Calendar styles
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: CustomerTheme.colors.surface,
  },
  calendarNavText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarWeekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: CustomerTheme.colors.mutedText,
    textAlign: 'center',
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
  },
  calendarDaySelected: {
    backgroundColor: CustomerTheme.colors.accent,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    color: CustomerTheme.colors.text,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  calendarDayTextDisabled: {
    color: CustomerTheme.colors.mutedText,
  },
  // Time grid styles
  timeGridContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 300,
  },
  timeGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeGridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
  },
  timeGridClose: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: CustomerTheme.colors.surface,
  },
  timeGridCloseText: {
    fontSize: 16,
    color: CustomerTheme.colors.text,
    fontWeight: 'bold',
  },
  timeGridScroll: {
    maxHeight: 200,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: CustomerTheme.colors.surface,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: CustomerTheme.colors.accent,
  },
  timeSlotText: {
    fontSize: 14,
    color: CustomerTheme.colors.text,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
