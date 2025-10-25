import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router, useRouter } from 'expo-router';
import { CustomerTheme } from '@/constants/CustomerTheme';
import { AuthContext } from '../_layout';
import { appointmentAPI } from '@/services/api';
import Footer from '../components/Footer';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  totalVisits: number;
  totalSpent: number;
  favoriteBarber: string;
  memberSince: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useContext(AuthContext);
  const navigation = useRouter();
  
  console.log('ProfileScreen - Current user:', user);
  console.log('ProfileScreen - User ID:', user?.id);
  console.log('ProfileScreen - User name:', user?.name);
  console.log('ProfileScreen - User email:', user?.email);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || 0,
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    totalVisits: 0,
    totalSpent: 0,
    favoriteBarber: 'Not specified',
    memberSince: new Date().toISOString().split('T')[0],
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedEmail, setEditedEmail] = useState(profile.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 PROFILE - Fetching appointments for user:', user.id);
      const response = await appointmentAPI.getUserAppointments(user.id);
      console.log('📊 PROFILE - Appointments response:', response);
      
      if (response.success && response.data) {
        const appointments = response.data;
        
        // Calculate statistics
        const totalVisits = appointments.length;
        const totalSpent = appointments.reduce((sum: number, appointment: any) => {
          return sum + parseFloat(appointment.price || 0);
        }, 0);
        
        // Find favorite barber (most frequent)
        const barberCounts: { [key: string]: number } = {};
        appointments.forEach((appointment: any) => {
          const barberName = appointment.barber_name;
          barberCounts[barberName] = (barberCounts[barberName] || 0) + 1;
        });
        
        const favoriteBarber = Object.keys(barberCounts).reduce((a, b) => 
          barberCounts[a] > barberCounts[b] ? a : b, 'Not specified'
        );
        
        // Update profile with real data
        setProfile(prev => ({
          ...prev,
          id: user.id,
          name: user.name,
          email: user.email,
          totalVisits,
          totalSpent,
          favoriteBarber,
          memberSince: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        
        console.log('📊 PROFILE - Updated profile:', {
          totalVisits,
          totalSpent,
          favoriteBarber
        });
      } else {
        setError('Failed to fetch appointment data');
      }
    } catch (error) {
      console.error('📊 PROFILE - Error fetching appointments:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        id: user.id,
        name: user.name,
        email: user.email,
      }));
      setEditedName(user.name);
      setEditedEmail(user.email);
      fetchUserAppointments();
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedName.trim() || !editedEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Here you would call the API to update the profile
    setProfile(prev => ({
      ...prev,
      name: editedName.trim(),
      email: editedEmail.trim(),
    }));
    
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleCancel = () => {
    setEditedName(profile.name);
    setEditedEmail(profile.email);
    setIsEditing(false);
  };

  const handleSignOut = () => {
    console.log('Sign out button pressed!');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            console.log('Customer signing out...');
            signOut();
            // Navigation will be handled automatically by the auth guard in _layout.tsx
            console.log('Authentication state cleared, auth guard will handle navigation');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show login message if no user
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>Please log in to view your profile</Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.push('/login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CustomerTheme.colors.accent} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchUserAppointments}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{profile.name}</Text>
        <Text style={styles.userEmail}>{profile.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.totalVisits}</Text>
          <Text style={styles.statLabel}>Total Visits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₱{profile.totalSpent.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.favoriteBarber}</Text>
          <Text style={styles.statLabel}>Favorite Barber</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.infoValue}>{profile.name}</Text>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.infoValue}>{profile.email}</Text>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Favorite Barber</Text>
            <Text style={styles.infoValue}>{profile.favoriteBarber}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{formatDate(profile.memberSince)}</Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notifications</Text>
            <Text style={styles.infoValue}>Enabled</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Preferred Time</Text>
            <Text style={styles.infoValue}>Morning (9AM - 12PM)</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomerTheme.colors.background,
  },
  header: {
    alignItems: 'center',
    padding: CustomerTheme.spacing.lg,
    paddingTop: CustomerTheme.spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CustomerTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: CustomerTheme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CustomerTheme.colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
    marginBottom: CustomerTheme.spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: CustomerTheme.colors.mutedText,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: CustomerTheme.spacing.lg,
    marginBottom: CustomerTheme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: CustomerTheme.colors.white,
    borderRadius: CustomerTheme.radius.lg,
    padding: CustomerTheme.spacing.md,
    alignItems: 'center',
    marginHorizontal: CustomerTheme.spacing.xs,
    shadowColor: CustomerTheme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomerTheme.colors.accent,
    marginBottom: CustomerTheme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: CustomerTheme.colors.mutedText,
    textAlign: 'center',
  },
  section: {
    marginBottom: CustomerTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomerTheme.colors.text,
    marginBottom: CustomerTheme.spacing.md,
    paddingHorizontal: CustomerTheme.spacing.lg,
  },
  infoCard: {
    backgroundColor: CustomerTheme.colors.white,
    marginHorizontal: CustomerTheme.spacing.lg,
    borderRadius: CustomerTheme.radius.lg,
    padding: CustomerTheme.spacing.md,
    shadowColor: CustomerTheme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: CustomerTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: CustomerTheme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: CustomerTheme.colors.mutedText,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: CustomerTheme.colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  textInput: {
    fontSize: 14,
    color: CustomerTheme.colors.text,
    borderWidth: 1,
    borderColor: CustomerTheme.colors.border,
    borderRadius: CustomerTheme.radius.sm,
    paddingHorizontal: CustomerTheme.spacing.sm,
    paddingVertical: CustomerTheme.spacing.xs,
    flex: 2,
    textAlign: 'right',
  },
  editButtons: {
    flexDirection: 'row',
    paddingHorizontal: CustomerTheme.spacing.lg,
    marginTop: CustomerTheme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: CustomerTheme.colors.surface,
    paddingVertical: CustomerTheme.spacing.md,
    borderRadius: CustomerTheme.radius.lg,
    alignItems: 'center',
    marginRight: CustomerTheme.spacing.sm,
  },
  cancelButtonText: {
    color: CustomerTheme.colors.mutedText,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: CustomerTheme.colors.accent,
    paddingVertical: CustomerTheme.spacing.md,
    borderRadius: CustomerTheme.radius.lg,
    alignItems: 'center',
    marginLeft: CustomerTheme.spacing.sm,
  },
  saveButtonText: {
    color: CustomerTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: CustomerTheme.colors.accent,
    marginHorizontal: CustomerTheme.spacing.lg,
    paddingVertical: CustomerTheme.spacing.md,
    borderRadius: CustomerTheme.radius.lg,
    alignItems: 'center',
  },
  editButtonText: {
    color: CustomerTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#F44336',
    marginHorizontal: CustomerTheme.spacing.lg,
    paddingVertical: CustomerTheme.spacing.md,
    borderRadius: CustomerTheme.radius.lg,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: CustomerTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CustomerTheme.spacing.lg,
  },
  loginPromptText: {
    fontSize: 18,
    color: CustomerTheme.colors.mutedText,
    textAlign: 'center',
    marginBottom: CustomerTheme.spacing.lg,
  },
  loginButton: {
    backgroundColor: CustomerTheme.colors.accent,
    paddingVertical: CustomerTheme.spacing.md,
    paddingHorizontal: CustomerTheme.spacing.xl,
    borderRadius: CustomerTheme.radius.lg,
  },
  loginButtonText: {
    color: CustomerTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CustomerTheme.colors.background,
  },
  loadingText: {
    marginTop: CustomerTheme.spacing.md,
    fontSize: 16,
    color: CustomerTheme.colors.mutedText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CustomerTheme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: CustomerTheme.spacing.md,
  },
  retryButton: {
    backgroundColor: CustomerTheme.colors.accent,
    paddingVertical: CustomerTheme.spacing.md,
    paddingHorizontal: CustomerTheme.spacing.xl,
    borderRadius: CustomerTheme.radius.lg,
  },
  retryButtonText: {
    color: CustomerTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

