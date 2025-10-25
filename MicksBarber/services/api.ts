import axios from 'axios';
import { getBackendUrl } from '../config/backend';

const api = axios.create({
  baseURL: getBackendUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API functions
export const authAPI = {
  // Register a new user
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    try {
      console.log('API: Making login request to:', getBackendUrl() + '/auth/login');
      console.log('API: Login data:', { email, password: '***' });
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      console.log('API: Login response:', response.data);
      console.log('API: Response success:', response.data.success);
      console.log('API: Response user:', response.data.user);
      
      return response.data;
    } catch (error: any) {
      console.error('API: Login error:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
};

// Barber API functions
export const barberAPI = {
  getBarbers: async () => {
    try {
      console.log('Making request to:', getBackendUrl() + '/barbers');
      const response = await api.get('/barbers');
      console.log('Barbers API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Barbers API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Failed to fetch barbers');
    }
  },
  getBarber: async (id: number) => {
    try {
      const response = await api.get(`/barbers/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch barber');
    }
  },
};

// Service API functions
export const serviceAPI = {
  getServices: async () => {
    try {
      const response = await api.get('/services');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch services');
    }
  },
  getService: async (id: number) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service');
    }
  },
};

// Appointment API functions
export const appointmentAPI = {
  getUserAppointments: async (userId: number) => {
    try {
      const response = await api.get(`/appointments/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },
  createAppointment: async (appointmentData: {
    user_id: number;
    barber_id: number;
    service_id: number;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
    total_amount?: number;
    payment_status?: string;
  }) => {
    try {
      console.log('Creating appointment with data:', appointmentData);
      const response = await api.post('/appointments', appointmentData);
      console.log('Appointment creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Appointment creation error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  },
  updateAppointmentStatus: async (appointmentId: number, status: string) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
  },
  updateAppointment: async (appointmentId: number, updateData: {
    payment_status?: string;
    payment_id?: number;
  }) => {
    try {
      console.log('Updating appointment:', appointmentId, updateData);
      const response = await api.put(`/appointments/${appointmentId}`, updateData);
      console.log('Appointment update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Appointment update error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update appointment');
    }
  },
  cancelAppointment: async (appointmentId: number) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  },
  // Admin functions
  getAllAppointments: async () => {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all appointments');
    }
  },
};

export default api;
