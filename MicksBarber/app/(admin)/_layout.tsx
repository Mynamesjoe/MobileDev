import { Stack } from 'expo-router';
import { AdminTheme } from '@/constants/AdminTheme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: AdminTheme.colors.background },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

