import axios from 'axios';
import { getBackendUrl } from '../config/backend';

const API_BASE_URL = getBackendUrl();

// Create axios instance with better configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.message);
    return Promise.reject(error);
  }
);

// Payment API service
export const paymentAPI = {
  // Get all payments for a user
  getUserPayments: async (userId: number) => {
    try {
      const response = await apiClient.get(`/payments/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  },

  // Get payment by ID
  getPayment: async (paymentId: number) => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  // Get payment by appointment ID
  getPaymentByAppointment: async (appointmentId: number) => {
    try {
      const response = await apiClient.get(`/payments/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment by appointment:', error);
      throw error;
    }
  },

  // Create a new payment
  createPayment: async (paymentData: {
    appointment_id: number;
    user_id: number;
    amount: number;
    payment_method: 'cash' | 'card' | 'gcash' | 'paymaya' | 'bank_transfer';
    transaction_id?: string;
    payment_reference?: string;
    receipt_image?: string;
  }) => {
    try {
      console.log('Creating payment with data:', paymentData);
      const response = await apiClient.post('/payments', paymentData);
      console.log('Payment creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (paymentId: number, paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded', paymentDate?: Date) => {
    try {
      const response = await apiClient.put(`/payments/${paymentId}/status`, {
        payment_status: paymentStatus,
        payment_date: paymentDate
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Get user's payment methods
  getPaymentMethods: async (userId: number) => {
    try {
      const response = await apiClient.get(`/payments/methods/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Add a new payment method
  addPaymentMethod: async (methodData: {
    user_id: number;
    method_type: 'card' | 'gcash' | 'paymaya' | 'bank_account';
    method_name: string;
    is_default?: boolean;
  }) => {
    try {
      console.log('Adding payment method:', methodData);
      const response = await apiClient.post('/payments/methods', methodData);
      console.log('Payment method response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  // Update payment method
  updatePaymentMethod: async (methodId: number, methodData: {
    method_name?: string;
    is_default?: boolean;
    is_active?: boolean;
  }) => {
    try {
      const response = await apiClient.put(`/payments/methods/${methodId}`, methodData);
      return response.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  // Delete payment method
  deletePaymentMethod: async (methodId: number) => {
    try {
      const response = await apiClient.delete(`/payments/methods/${methodId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }
};

// Payment processing utilities
export const paymentUtils = {
  // Generate a mock transaction ID (in real app, this would come from payment gateway)
  generateTransactionId: () => {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Simulate payment processing (in real app, this would integrate with payment gateway)
  processPayment: async (paymentData: {
    amount: number;
    payment_method: string;
    user_id: number;
    appointment_id: number;
  }) => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock payment processing - 90% success rate
    const isSuccessful = Math.random() > 0.1;
    
    if (isSuccessful) {
      return {
        success: true,
        transaction_id: paymentUtils.generateTransactionId(),
        payment_reference: `REF_${Date.now()}`,
        message: 'Payment processed successfully'
      };
    } else {
      return {
        success: false,
        error: 'Payment processing failed. Please try again.',
        message: 'Payment could not be processed'
      };
    }
  },

  // Format currency
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  },

  // Get payment method display name
  getPaymentMethodDisplayName: (method: string) => {
    const methodNames: { [key: string]: string } = {
      'cash': 'Cash',
      'card': 'Credit/Debit Card',
      'gcash': 'GCash',
      'paymaya': 'PayMaya',
      'bank_transfer': 'Bank Transfer'
    };
    return methodNames[method] || method;
  }
};
