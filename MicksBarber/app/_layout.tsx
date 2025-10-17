import { Stack, SplashScreen, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/app-example/hooks/useColorScheme';

// User interface based on database schema
interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

// Create an authentication context
export const AuthContext = React.createContext<{ 
  signIn: (user: User) => void; 
  signOut: () => void; 
  isAuthenticated: boolean;
  user: User | null;
}>({
  signIn: () => {},
  signOut: () => {},
  isAuthenticated: false,
  user: null,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    // Hide the splash screen after a short delay
    setTimeout(() => {
      SplashScreen.hideAsync();
      setIsLayoutReady(true); // Mark layout as ready
    }, 300);
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: (userData: User) => {
        console.log('🔐 SIGNIN:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      },
      signOut: () => {
        console.log('🔐 SIGNOUT - Starting sign out process...');
        console.log('🔐 SIGNOUT - Current state before sign out:', { isAuthenticated, user: user?.id });
        setUser(null);
        setIsAuthenticated(false);
        console.log('🔐 SIGNOUT - State cleared, navigating to landing page');
        
        // Direct navigation to ensure it happens
        setTimeout(() => {
          console.log('🔐 SIGNOUT - Direct navigation to landing page');
          router.replace('/landing');
        }, 100);
      },
      isAuthenticated,
      user,
    }),
    [isAuthenticated, user]
  );

  // Authentication guard - redirect based on auth state and role
  React.useEffect(() => {
    console.log('🔐 AUTH GUARD - Effect triggered:', { isLayoutReady, isAuthenticated, user: user?.id });
    
    // Only navigate if layout is ready
    if (!isLayoutReady) {
      console.log('🔐 AUTH GUARD - Layout not ready yet, waiting...');
      return;
    }

    if (isAuthenticated && user) {
      console.log('🔐 AUTH GUARD - User authenticated, checking role:', user.role);
      if (user.role === 'admin') {
        console.log('🔐 AUTH GUARD - Redirecting admin to admin dashboard');
        router.replace('/(admin)');
      } else {
        console.log('🔐 AUTH GUARD - Redirecting customer to tabs');
        router.replace('/(tabs)');
      }
    } else if (!isAuthenticated && !user) {
      // Handle sign out case - redirect to landing page
      console.log('🔐 AUTH GUARD - User signed out, redirecting to landing page');
      router.replace('/landing');
    } else {
      console.log('🔐 AUTH GUARD - No action needed:', { isAuthenticated, hasUser: !!user });
    }
  }, [isAuthenticated, user, isLayoutReady]);

  return (
    <AuthContext.Provider value={authContext}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="landing" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="admin-login" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}