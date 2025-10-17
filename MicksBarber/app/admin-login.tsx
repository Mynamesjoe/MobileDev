import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { AdminTheme } from '@/constants/AdminTheme';
import { AuthContext } from './_layout';

export default function AdminLoginScreen() {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll use a simple admin check
      // In production, you'd want proper admin authentication
      if (email === 'admin@micksbarber.com' && password === 'admin123') {
        const adminUser = {
          id: 999,
          name: 'Admin',
          email: 'admin@micksbarber.com',
          role: 'admin'
        };
        
        signIn(adminUser);
        // Navigation will be handled automatically by the auth guard in _layout.tsx
        console.log('🔐 ADMIN LOGIN SUCCESS - Auth guard will handle navigation');
      } else {
        Alert.alert('Error', 'Invalid admin credentials');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToCustomerLogin = () => {
    router.push('/login' as any);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.brandText}>Mick's Barbershop</Text>
          <Text style={styles.adminText}>Admin Portal</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Access the admin dashboard</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@micksbarber.com"
              placeholderTextColor={AdminTheme.colors.mutedText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter admin password"
              placeholderTextColor={AdminTheme.colors.mutedText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleAdminLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customerLoginButton}
            onPress={goToCustomerLogin}
          >
            <Text style={styles.customerLoginText}>
              Customer Login Instead
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminTheme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: AdminTheme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: AdminTheme.spacing.xl,
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AdminTheme.colors.accent,
    marginBottom: 4,
  },
  adminText: {
    fontSize: 16,
    color: AdminTheme.colors.mutedText,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: AdminTheme.colors.white,
    borderRadius: AdminTheme.radius.lg,
    padding: AdminTheme.spacing.lg,
    shadowColor: AdminTheme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AdminTheme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AdminTheme.colors.mutedText,
    textAlign: 'center',
    marginBottom: AdminTheme.spacing.lg,
  },
  inputContainer: {
    marginBottom: AdminTheme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AdminTheme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: AdminTheme.colors.border,
    borderRadius: AdminTheme.radius.sm,
    padding: AdminTheme.spacing.md,
    fontSize: 16,
    color: AdminTheme.colors.text,
    backgroundColor: AdminTheme.colors.background,
  },
  loginButton: {
    backgroundColor: AdminTheme.colors.accent,
    borderRadius: AdminTheme.radius.sm,
    padding: AdminTheme.spacing.md,
    alignItems: 'center',
    marginTop: AdminTheme.spacing.md,
    marginBottom: AdminTheme.spacing.sm,
  },
  disabledButton: {
    backgroundColor: AdminTheme.colors.mutedText,
  },
  loginButtonText: {
    color: AdminTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  customerLoginButton: {
    alignItems: 'center',
    padding: AdminTheme.spacing.sm,
  },
  customerLoginText: {
    color: AdminTheme.colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: AdminTheme.spacing.sm,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 20,
    color: AdminTheme.colors.text,
    fontWeight: 'bold',
  },
});

