import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { authAPI } from '@/services/api';
import { AuthContext } from './_layout';
import Footer from './components/Footer';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('Attempting login with:', { email, password: '***' });
    
    try {
      const response = await authAPI.login(email, password);
      console.log('Login response:', response);
      
      if (response.success && response.user) {
        console.log('🔐 LOGIN SUCCESS:', response.user);
        signIn(response.user);
        // Navigation will be handled automatically by the auth guard in _layout.tsx
        console.log('🔐 CUSTOMER LOGIN SUCCESS - Auth guard will handle navigation');
      } else {
        console.log('Login failed:', response.message);
        Alert.alert('Login Failed', response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', error.message);
      Alert.alert('Login Failed', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B0000" />
      <LinearGradient
        colors={['#FFFFFF', '#8B0000']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Animated Background Elements */}
        <Animated.View style={[styles.backgroundCircle, styles.circle1, { transform: [{ translateY: floatInterpolate }] }]} />
        <Animated.View style={[styles.backgroundCircle, styles.circle2, { transform: [{ translateY: floatInterpolate }] }]} />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Header Section */}
        <Animated.View 
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.brandText}>Mick's Barber</Text>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </Animated.View>

        {/* Form Container */}
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={['#FF6B6B', '#8B0000']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
              {!loading && <Text style={styles.buttonIcon}>→</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('register' as any)}>
            <Text style={styles.linkText}>Don't have an account? </Text>
            <Text style={styles.linkAccent}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Footer */}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  // Background animated circles
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#8B0000',
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    bottom: 100,
    left: -75,
  },
  // Back Button
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#8B0000',
    fontWeight: 'bold',
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 80,
  },
  brandText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  // Form Container
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    height: 55,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  // Button Styles
  primaryButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Link Button
  linkButton: {
    marginTop: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  linkAccent: {
    fontSize: 16,
    color: '#8B0000',
    fontWeight: 'bold',
  },
});

