import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomerTheme } from '@/constants/CustomerTheme';
import { barberAPI, serviceAPI } from '@/services/api';
import { AuthContext } from '../_layout';
import BookingModal from '../components/BookingModal';
import Footer from '../components/Footer';
import { responsiveWidth, responsiveHeight, scale, DeviceType, getResponsivePadding, getResponsiveFontSize } from '@/utils/responsive';

const { width } = Dimensions.get('window');

interface Barber {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  email: string;
  phone: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export default function HomeTab() {
  const { user } = useContext(AuthContext);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Entrance animations
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

    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const fetchData = async () => {
    try {
      console.log('Fetching barbers and services...');
      const [barbersResponse, servicesResponse] = await Promise.all([
        barberAPI.getBarbers(),
        serviceAPI.getServices()
      ]);

      console.log('Barbers response:', barbersResponse);
      console.log('Services response:', servicesResponse);

      if (barbersResponse.success) {
        setBarbers(barbersResponse.data);
        console.log('Barbers set:', barbersResponse.data);
      } else {
        console.error('Barbers API failed:', barbersResponse);
      }
      
      if (servicesResponse.success) {
        setServices(servicesResponse.data);
        console.log('Services set:', servicesResponse.data);
      } else {
        console.error('Services API failed:', servicesResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    setShowBookingModal(true);
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CustomerTheme.colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Animated Header Section */}
      <Animated.View 
        style={[
          styles.topImageContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=250&fit=crop' }}
          style={styles.topImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.imageOverlay}
        />
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandText}>Mick's Barber</Text>
          <Text style={styles.taglineText}>Professional cuts, exceptional service</Text>
        </View>
      </Animated.View>

      {/* Main Content Area */}
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
        {/* Quick Book Button */}
        <View style={styles.quickBookSection}>
          <TouchableOpacity 
            style={styles.quickBookButton}
            onPress={() => handleBookAppointment()}
          >
            <LinearGradient
              colors={['#FF6B6B', '#8B0000']}
              style={styles.quickBookGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.quickBookText}>Book Your Appointment</Text>
              <Text style={styles.quickBookIcon}>✂️</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Haircut Prices Section */}
        <View style={styles.pricesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <Text style={styles.sectionSubtitle}>Professional cuts at great prices</Text>
          </View>
          <View style={styles.pricesGrid}>
            {services.slice(0, 4).map((service, index) => (
              <Animated.View 
                key={service.id} 
                style={[
                  styles.priceCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { 
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 30],
                          outputRange: [0, 30 + (index * 10)]
                        })
                      }
                    ]
                  }
                ]}
              >
                <View style={styles.serviceIcon}>
                  <Text style={styles.serviceEmoji}>✂️</Text>
                </View>
                <Text style={styles.priceCardName}>{service.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceCardPrice}>₱{service.price}</Text>
                  <View style={styles.durationContainer}>
                    <Text style={styles.durationIcon}>🕐</Text>
                    <Text style={styles.durationText}>{service.duration} mins</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Our Barbers Section */}
        <View style={styles.barbersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meet Our Barbers</Text>
            <Text style={styles.sectionSubtitle}>Experienced professionals ready to serve you</Text>
          </View>
          {barbers.map((barber, index) => (
            <Animated.View 
              key={barber.id} 
              style={[
                styles.barberCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, index % 2 === 0 ? 20 : -20]
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>{barber.name}</Text>
                <Text style={styles.barberSpecialty}>{barber.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.ratingText}>{barber.rating}/5</Text>
                </View>
              </View>
              <View style={styles.barberAvatar}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Footer */}
      <Footer />

      {/* Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingComplete={() => setShowBookingModal(false)}
        user={user}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Top Image Section
  topImageContainer: {
    position: 'relative',
    height: Dimensions.get('window').height * 0.35, // 35% of screen height
    maxHeight: 400,
    minHeight: 250,
    overflow: 'hidden',
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: 'absolute',
    top: width > 768 ? 70 : 50,
    left: width > 768 ? 40 : 20,
    right: width > 768 ? 40 : 20,
    zIndex: 2,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    letterSpacing: 1,
  },
  brandText: {
    fontSize: width > 768 ? 36 : width < 375 ? 26 : 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  taglineText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    fontWeight: '300',
  },
  // Main Content Area
  mainContent: {
    backgroundColor: '#FFFFFF',
    marginTop: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 30,
    minHeight: 500,
  },
  // Quick Book Section
  quickBookSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickBookButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  quickBookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  quickBookText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginRight: 10,
  },
  quickBookIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  // Section Headers
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
    fontWeight: '300',
  },
  // Haircut Prices Section
  pricesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  pricesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceEmoji: {
    fontSize: 20,
  },
  priceCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomerTheme.colors.text,
    marginBottom: 10,
  },
  priceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  priceCardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  durationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: '500',
  },
  // Our Barbers Section
  barbersSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  barberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
    marginBottom: 5,
  },
  barberSpecialty: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
    marginBottom: 8,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '600',
  },
  barberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 24,
    color: '#8B0000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: CustomerTheme.colors.mutedText,
    fontWeight: '500',
  },
});
