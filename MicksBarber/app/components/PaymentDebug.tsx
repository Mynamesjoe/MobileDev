import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { paymentAPI } from '../../services/paymentAPI';

interface PaymentDebugProps {
  userId: number;
}

export default function PaymentDebug({ userId }: PaymentDebugProps) {
  const [loading, setLoading] = useState(false);

  const testAddPaymentMethod = async () => {
    setLoading(true);
    try {
      console.log('Testing add payment method...');
      const result = await paymentAPI.addPaymentMethod({
        user_id: userId,
        method_type: 'gcash',
        method_name: 'Debug Test GCash',
        is_default: false
      });
      console.log('Add payment method result:', result);
      Alert.alert('Success', 'Payment method added successfully!');
    } catch (error) {
      console.error('Add payment method error:', error);
      Alert.alert('Error', `Failed to add payment method: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetPaymentMethods = async () => {
    setLoading(true);
    try {
      console.log('Testing get payment methods...');
      const result = await paymentAPI.getPaymentMethods(userId);
      console.log('Get payment methods result:', result);
      Alert.alert('Success', `Found ${result.length} payment methods`);
    } catch (error) {
      console.error('Get payment methods error:', error);
      Alert.alert('Error', `Failed to get payment methods: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment API Debug</Text>
      <Text style={styles.subtitle}>User ID: {userId}</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={testGetPaymentMethods}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Test Get Payment Methods'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={testAddPaymentMethod}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Test Add Payment Method'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
