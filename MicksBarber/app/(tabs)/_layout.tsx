import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { CustomerTheme } from '@/constants/CustomerTheme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CustomerTheme.colors.accent,
        tabBarInactiveTintColor: CustomerTheme.colors.mutedText,
        tabBarStyle: {
          backgroundColor: CustomerTheme.colors.white,
          borderTopColor: CustomerTheme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Booking',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

// Simple vector-style icon component
function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const iconMap: { [key: string]: string } = {
    home: '⌂',      // Simple home icon
    calendar: '◷',  // Simple calendar/clock icon
    user: '○',      // Simple user icon
  };
  
  return (
    <Text style={{ fontSize: size, color, fontWeight: 'bold' }}>
      {iconMap[name] || '●'}
    </Text>
  );
}