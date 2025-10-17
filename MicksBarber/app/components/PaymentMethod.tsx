import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { paymentAPI, paymentUtils } from '../../services/paymentAPI';

interface PaymentMethod {
  id: number;
  method_type: 'card' | 'gcash' | 'paymaya' | 'bank_account';
  method_name: string;
  is_default: boolean;
  is_active: boolean;
}

interface PaymentMethodProps {
  userId: number;
  amount: number;
  appointmentId: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentMethod({ userId, amount, appointmentId, onPaymentSuccess, onPaymentError }: PaymentMethodProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, [userId]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentAPI.getPaymentMethods(userId);
      setPaymentMethods(methods);
      
      // Set default method if available
      const defaultMethod = methods.find(method => method.is_default);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod.method_type);
      } else if (methods.length > 0) {
        setSelectedMethod(methods[0].method_type);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      onPaymentError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      const paymentResult = await paymentUtils.processPayment({
        amount,
        payment_method: selectedMethod,
        user_id: userId,
        appointment_id: appointmentId
      });

      if (paymentResult.success) {
        // Create payment record
        const paymentData = {
          appointment_id: appointmentId,
          user_id: userId,
          amount: amount,
          payment_method: selectedMethod as 'cash' | 'card' | 'gcash' | 'paymaya' | 'bank_transfer',
          transaction_id: paymentResult.transaction_id,
          payment_reference: paymentResult.payment_reference
        };

        const createdPayment = await paymentAPI.createPayment(paymentData);
        
        // Update payment status to completed
        await paymentAPI.updatePaymentStatus(createdPayment.id, 'completed', new Date());
        
        onPaymentSuccess({
          ...createdPayment,
          transaction_id: paymentResult.transaction_id,
          payment_reference: paymentResult.payment_reference
        });
      } else {
        onPaymentError(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addNewPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose a payment method to add:',
      [
        { text: 'GCash', onPress: () => addPaymentMethod('gcash') },
        { text: 'PayMaya', onPress: () => addPaymentMethod('paymaya') },
        { text: 'Bank Account', onPress: () => addPaymentMethod('bank_account') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const addPaymentMethod = async (methodType: 'gcash' | 'paymaya' | 'bank_account') => {
    try {
      const methodName = `${methodType.charAt(0).toUpperCase() + methodType.slice(1)} - ${new Date().toLocaleDateString()}`;
      
      console.log('Attempting to add payment method:', {
        user_id: userId,
        method_type: methodType,
        method_name: methodName,
        is_default: paymentMethods.length === 0
      });
      
      const result = await paymentAPI.addPaymentMethod({
        user_id: userId,
        method_type: methodType,
        method_name: methodName,
        is_default: paymentMethods.length === 0
      });

      console.log('Payment method added successfully:', result);
      
      // Refresh payment methods
      await fetchPaymentMethods();
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      
      let errorMessage = 'Failed to add payment method';
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      <Text style={styles.amount}>Total: {paymentUtils.formatCurrency(amount)}</Text>

      <View style={styles.methodsContainer}>
        {paymentMethods.length === 0 ? (
          <View style={styles.noMethodsContainer}>
            <Text style={styles.noMethodsText}>No payment methods saved</Text>
            <TouchableOpacity style={styles.addButton} onPress={addNewPaymentMethod}>
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodItem,
                  selectedMethod === method.method_type && styles.selectedMethod
                ]}
                onPress={() => setSelectedMethod(method.method_type)}
              >
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.method_name}</Text>
                  <Text style={styles.methodType}>
                    {paymentUtils.getPaymentMethodDisplayName(method.method_type)}
                  </Text>
                </View>
                {method.is_default && (
                  <Text style={styles.defaultBadge}>Default</Text>
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.addMoreButton} onPress={addNewPaymentMethod}>
              <Text style={styles.addMoreButtonText}>+ Add Another Method</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.payButton, (!selectedMethod || isProcessing) && styles.disabledButton]}
        onPress={handlePayment}
        disabled={!selectedMethod || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.payButtonText}>Pay {paymentUtils.formatCurrency(amount)}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  methodsContainer: {
    marginBottom: 20,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
  },
  selectedMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodType: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noMethodsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noMethodsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  addMoreButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  addMoreButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
