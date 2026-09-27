import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { api, useSession, when, type Booking, type Settings } from '../lib/api';
import { Button, styles } from '../components/saloon-ui';
export default function Bookings() {
  const { user } = useSession();
  const [rows, setRows] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('Upcoming');
  const [busy, setBusy] = useState('');
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [b, s] = await Promise.all([api<Booking[]>('/bookings'), api<Settings>('/settings')]);
      setRows(b);
      setSettings(s);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);
  useFocusEffect(
    useCallback(() => {
      void load();
      const t = setInterval(() => void load(), 20000);
      return () => clearInterval(t);
    }, [load]),
  );
  async function cancel(id: string) {
    setBusy(id);
    try {
      await api(`/bookings/${id}`, 'PATCH', { action: 'Cancelled' });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  const upcoming = (b: Booking) =>
    ['Pending', 'Accepted'].includes(b.status) && new Date(b.end) > new Date();
  const visible = rows.filter((b) => (tab === 'Upcoming' ? upcoming(b) : !upcoming(b)));
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={styles.heading}>Time for you.</Text>
      {!user ? (
        <Button title="Log in to view appointments" onPress={() => router.push('/auth')} />
      ) : (
        <>
          <View style={styles.row}>
            {['Upcoming', 'Past'].map((t) => (
              <Button key={t} title={t} secondary={tab !== t} onPress={() => setTab(t)} />
            ))}
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          {!visible.length && !loading && (
            <Text style={styles.sub}>No {tab.toLowerCase()} appointments yet.</Text>
          )}
          {visible.map((b) => (
            <View key={b._id} style={styles.card}>
              <Text style={styles.badge}>{b.status}</Text>
              <Text style={styles.title}>{b.serviceName}</Text>
              <Text style={styles.sub}>
                {when(b.start, settings?.timezone || 'Africa/Lagos')} · {b.staff?.name}
                {'\n'}
                {settings?.timezone}
              </Text>
              {b.history.at(-1)?.reason && (
                <Text style={styles.sub}>{b.history.at(-1)?.reason}</Text>
              )}
              {['Pending', 'Accepted'].includes(b.status) && (
                <>
                  <Button
                    title="Reschedule"
                    secondary
                    disabled={busy === b._id}
                    onPress={() =>
                      router.push({
                        pathname: '/book',
                        params: { serviceId: b.service._id, bookingId: b._id },
                      })
                    }
                  />
                  <Button
                    title={busy === b._id ? 'Cancelling…' : 'Cancel appointment'}
                    secondary
                    disabled={busy === b._id}
                    onPress={() =>
                      Alert.alert('Cancel appointment?', 'Your reserved time will be released.', [
                        { text: 'Keep appointment', style: 'cancel' },
                        {
                          text: 'Cancel appointment',
                          style: 'destructive',
                          onPress: () => void cancel(b._id),
                        },
                      ])
                    }
                  />
                </>
              )}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
