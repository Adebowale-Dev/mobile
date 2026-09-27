import { Stack } from 'expo-router';
import { SessionProvider } from '../lib/api';
export default function Layout() {
  return (
    <SessionProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#f6f5ee' },
          headerTintColor: '#284c3b',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'SALOON BOOK' }} />
        <Stack.Screen name="auth" options={{ title: 'Your account' }} />
        <Stack.Screen name="book" options={{ title: 'Make time for yourself' }} />
        <Stack.Screen name="bookings" options={{ title: 'Your appointments' }} />
        <Stack.Screen name="profile" options={{ title: 'Your profile' }} />
        <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      </Stack>
    </SessionProvider>
  );
}
