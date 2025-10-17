import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, StatusBar, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Theme } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();

    // Continuous rotation for admin icon
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Pulse animation for button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Shimmer effect for title
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    // Particle animation
    const particleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    particleAnimation.start();
  }, []);

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerInterpolate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const particleInterpolate = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B0000" />
      <LinearGradient
        colors={['#FFFFFF', '#8B0000']} // White to dark red/maroon
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Animated Background Elements */}
        <Animated.View style={[styles.backgroundCircle, styles.circle1, { transform: [{ translateY: floatInterpolate }] }]} />
        <Animated.View style={[styles.backgroundCircle, styles.circle2, { transform: [{ translateY: floatInterpolate }] }]} />
        <Animated.View style={[styles.backgroundCircle, styles.circle3, { transform: [{ translateY: floatInterpolate }] }]} />

        {/* Floating Particles */}
        <Animated.View style={[styles.particle, styles.particle1, { 
          opacity: particleInterpolate,
          transform: [{ translateY: floatInterpolate }] 
        }]} />
        <Animated.View style={[styles.particle, styles.particle2, { 
          opacity: particleInterpolate,
          transform: [{ translateY: floatInterpolate }] 
        }]} />
        <Animated.View style={[styles.particle, styles.particle3, { 
          opacity: particleInterpolate,
          transform: [{ translateY: floatInterpolate }] 
        }]} />

        {/* Admin Login Icon - Top Right with rotation */}
        <Animated.View style={[styles.adminIconContainer, { transform: [{ rotate: rotateInterpolate }] }]}>
          <TouchableOpacity 
            style={styles.adminIconButton} 
            onPress={() => {
              Vibration.vibrate(30);
              router.push('admin-login' as any);
            }}
          >
            <Text style={styles.adminIconText}>⚙️</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Main Content */}
        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Logo with floating animation */}
          <Animated.View style={[styles.logoContainer, { transform: [{ translateY: floatInterpolate }] }]}>
            <Image 
              source={require('@/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Animated Title with Shimmer */}
          <View style={styles.titleContainer}>
            <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
              Mick's Barber
            </Animated.Text>
            <Animated.View 
              style={[
                styles.shimmerOverlay,
                { 
                  transform: [{ translateX: shimmerInterpolate }],
                  opacity: fadeAnim 
                }
              ]} 
            />
          </View>

          <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
            Fresh cuts. Simple booking.
          </Animated.Text>

          {/* Feature Cards */}
          <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>✂️</Text>
              <Text style={styles.featureText}>Professional Cuts</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📅</Text>
              <Text style={styles.featureText}>Easy Booking</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>⭐</Text>
              <Text style={styles.featureText}>Top Rated</Text>
            </View>
          </Animated.View>

          {/* Animated Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => {
                Vibration.vibrate(50); // Haptic feedback
                router.push('login' as any);
              }}
            >
              <LinearGradient
                colors={['#FF6B6B', '#8B0000']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Bottom decorative elements */}
        <Animated.View style={[styles.bottomDecoration, { opacity: fadeAnim }]}>
          <View style={styles.decorationLine} />
          <Text style={styles.decorationText}>Est. 2024</Text>
          <View style={styles.decorationLine} />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
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
    left: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    top: height * 0.3,
    right: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#8B0000',
    bottom: 100,
    left: 50,
  },
  // Floating particles
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  particle1: {
    top: height * 0.2,
    left: width * 0.1,
  },
  particle2: {
    top: height * 0.6,
    right: width * 0.15,
  },
  particle3: {
    bottom: height * 0.3,
    left: width * 0.2,
  },
  // Admin icon with rotation container
  adminIconContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  adminIconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: Theme.spacing.md,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  adminIconText: {
    fontSize: 24,
  },
  // Main content container
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  // Logo section
  logoContainer: {
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  logoImage: {
    width: 280,
    height: 180,
  },
  // Typography
  titleContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
    height: '100%',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontWeight: '300',
    letterSpacing: 1,
  },
  // Feature cards
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: Theme.spacing.md,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 80,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Button styles
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl * 1.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: Theme.spacing.sm,
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Bottom decoration
  bottomDecoration: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  decorationLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Theme.spacing.md,
  },
  decorationText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 1,
  },
});
