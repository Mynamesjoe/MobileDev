import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

export default function ConnectionTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing connection to backend...');
      
      // Test basic connection
      const response = await axios.get('http://localhost:3000/', {
        timeout: 5000,
      });
      
      console.log('Connection test response:', response.data);
      setResult(`✅ Connection successful! Server response: ${JSON.stringify(response.data)}`);
      
    } catch (error) {
      console.error('Connection test error:', error);
      
      let errorMessage = '❌ Connection failed: ';
      if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Server not running or not accessible';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage += 'Network error - check your connection';
      } else if (error.code === 'TIMEOUT') {
        errorMessage += 'Request timeout - server might be slow';
      } else {
        errorMessage += error.message;
      }
      
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testPaymentEndpoint = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing payment endpoint...');
      
      const response = await axios.get('http://localhost:3000/api/payments/methods/1', {
        timeout: 5000,
      });
      
      console.log('Payment endpoint response:', response.data);
      setResult(`✅ Payment endpoint working! Found ${response.data.length} payment methods`);
      
    } catch (error) {
      console.error('Payment endpoint test error:', error);
      
      let errorMessage = '❌ Payment endpoint failed: ';
      if (error.response) {
        errorMessage += `Status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      } else {
        errorMessage += error.message;
      }
      
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Basic Connection'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={testPaymentEndpoint}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Payment Endpoint'}
        </Text>
      </TouchableOpacity>

      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
  resultContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 5,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
