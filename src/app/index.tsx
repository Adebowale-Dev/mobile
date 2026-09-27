import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, Text, View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { api, useSession, money, type Service, type Settings } from '../lib/api';
import { Button, styles } from '../components/saloon-ui';
export default function Home() {
  const { user } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([api<Service[]>('/services'), api<Settings>('/settings')]);
      setServices(s);
      setSettings(p);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const initial = setTimeout(() => void load(), 0);
    return () => clearTimeout(initial);
  }, [load]);
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={styles.sub}>GOOD HAIR. GOOD ENERGY.</Text>
      <Text style={styles.heading}>Your next look,{'\n'}beautifully booked.</Text>
      <Text style={styles.sub}>
        {user
          ? `Welcome back, ${user.name.split(' ')[0]}.`
          : 'Find your style and let us take care of the rest.'}
      </Text>
      <View style={styles.row}>
        <Button
          title={user ? 'My appointments' : 'Log in / Register'}
          onPress={() => router.push(user ? '/bookings' : '/auth')}
        />
        {user && <Button title="Profile" secondary onPress={() => router.push('/profile')} />}
      </View>
      {error && (
        <>
          <Text style={styles.error}>{error}</Text>
          <Button title="Retry" onPress={load} />
        </>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {['All', ...new Set(services.map((s) => s.category)), 'Favorites'].map((c) => (
          <Button key={c} title={c} secondary={c !== category} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>
      <Text style={styles.title}>The service menu</Text>
      {services
        .filter(
          (s) =>
            category === 'All' ||
            (category === 'Favorites' ? user?.favorites.includes(s._id) : s.category === category),
        )
        .map((s) => (
          <View key={s._id} style={styles.card}>
            <Image source={{ uri: s.photo }} style={styles.photo} accessibilityLabel={s.name} />
            <Text style={styles.sub}>
              {s.category.toUpperCase()} · {s.duration} MIN
            </Text>
            <Text style={styles.title}>{s.name}</Text>
            <Text style={styles.sub}>{s.description}</Text>
            <Text style={styles.title}>{money(s.price, settings?.currency)}</Text>
            <Button
              title="View & book"
              onPress={() => router.push({ pathname: '/book', params: { serviceId: s._id } })}
            />
          </View>
        ))}
      {!loading && !services.length && (
        <Text style={styles.sub}>No services available yet. Please check back soon.</Text>
      )}
      {category === 'Favorites' && !services.some((s) => user?.favorites.includes(s._id)) && (
        <Text style={styles.sub}>
          Your favorite looks will appear here. Save one from its booking page.
        </Text>
      )}
    </ScrollView>
  );
}
