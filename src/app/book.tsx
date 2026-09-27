import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  api,
  useSession,
  money,
  when,
  type Service,
  type Staff,
  type Slot,
  type Settings,
  type User,
} from '../lib/api';
import { Button, Field, styles } from '../components/saloon-ui';
export default function Book() {
  const { serviceId, bookingId } = useLocalSearchParams<{
    serviceId: string;
    bookingId?: string;
  }>();
  const { user, update } = useSession();
  const [service, setService] = useState<Service>();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [staffId, setStaffId] = useState('any');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  useEffect(() => {
    Promise.all([api<Service[]>('/services'), api<Staff[]>('/staff'), api<Settings>('/settings')])
      .then(([services, people, policy]) => {
        setService(services.find((s) => s._id === serviceId));
        setStaff(people.filter((s) => s.services.includes(serviceId)));
        setSettings(policy);
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: policy.timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).formatToParts(new Date());
        setDate(
          ['year', 'month', 'day'].map((k) => parts.find((p) => p.type === k)?.value).join('-'),
        );
      })
      .catch((e) => setError(e.message));
  }, [serviceId]);
  async function search() {
    setBusy(true);
    setSelected(undefined);
    try {
      setSlots(
        await api<Slot[]>(`/availability?serviceId=${serviceId}&staffId=${staffId}&date=${date}`),
      );
      setSearched(true);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!selected) return;
    setBusy(true);
    try {
      await api(
        bookingId ? `/bookings/${bookingId}` : '/bookings',
        bookingId ? 'PATCH' : 'POST',
        bookingId
          ? { action: 'Rescheduled', start: selected.start, staffId: selected.staffId }
          : { serviceId, staffId: selected.staffId, start: selected.start },
      );
      router.replace('/bookings');
    } catch (e) {
      setError((e as Error).message);
      setSelected(undefined);
    } finally {
      setBusy(false);
    }
  }
  async function favorite() {
    if (!user) {
      router.push('/auth');
      return;
    }
    try {
      const favorites = user.favorites.includes(serviceId)
        ? user.favorites.filter((s) => s !== serviceId)
        : [...user.favorites, serviceId];
      update(
        await api<User>('/auth/me', 'PATCH', { name: user.name, phone: user.phone, favorites }),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {error && <Text style={styles.error}>{error}</Text>}
      {service ? (
        <>
          <Image source={{ uri: service.photo }} style={styles.photo} />
          <Text style={styles.heading}>{service.name}</Text>
          <Text style={styles.sub}>{service.description}</Text>
          <Text style={styles.title}>
            {money(service.price, settings?.currency)} · {service.duration} minutes
          </Text>
          <Button
            title={
              user?.favorites.includes(serviceId) ? '♥ Saved to favorites' : '♡ Save this look'
            }
            secondary
            onPress={favorite}
          />
          <Text style={styles.title}>Choose your stylist</Text>
          <Button
            title="Any available staff"
            secondary={staffId !== 'any'}
            onPress={() => {
              setStaffId('any');
              setSlots([]);
              setSelected(undefined);
              setSearched(false);
            }}
          />
          {staff.map((s) => (
            <View key={s._id} style={styles.card}>
              <Text style={styles.title}>{s.name}</Text>
              <Text style={styles.sub}>
                {s.bio}
                {'\n'}
                {s.specialties.join(' · ')}
              </Text>
              <Button
                title={staffId === s._id ? 'Selected' : `Choose ${s.name}`}
                secondary={staffId !== s._id}
                onPress={() => {
                  setStaffId(s._id);
                  setSlots([]);
                  setSelected(undefined);
                  setSearched(false);
                }}
              />
            </View>
          ))}
          <Field
            label={`Date (YYYY-MM-DD) · ${settings?.timezone}`}
            value={date}
            onChangeText={(v) => {
              setDate(v);
              setSlots([]);
              setSelected(undefined);
              setSearched(false);
            }}
          />
          <Button
            title={busy ? 'Checking…' : 'Find available times'}
            onPress={search}
            disabled={busy}
          />
          {searched && !slots.length && (
            <Text style={styles.sub}>No available times. Try another day or stylist.</Text>
          )}
          <View style={styles.row}>
            {slots.map((s) => (
              <Button
                key={`${s.start}${s.staffId}`}
                title={`${when(s.start, settings!.timezone)} · ${s.staffName}`}
                secondary={selected !== s}
                onPress={() => setSelected(s)}
              />
            ))}
          </View>
          {selected && (
            <View style={styles.card}>
              <Text style={styles.title}>Your booking summary</Text>
              <Text style={styles.sub}>
                {service.name}
                {'\n'}
                {selected.staffName}
                {'\n'}
                {when(selected.start, settings!.timezone)} ({settings!.timezone}){'\n'}
                {service.duration} minutes · {money(service.price, settings?.currency)}
              </Text>
              <Text style={styles.sub}>
                The salon must accept your request. Pending requests expire after{' '}
                {settings?.requestExpiryMinutes} minutes. Changes require {settings?.cancelHours}{' '}
                hours’ notice. No online payment is collected.
              </Text>
              <Button
                title={
                  busy ? 'Sending…' : bookingId ? 'Request reschedule' : 'Send booking request'
                }
                disabled={busy}
                onPress={submit}
              />
            </View>
          )}
        </>
      ) : (
        <Text style={styles.sub}>
          {error ? 'Service could not be loaded.' : 'Loading service…'}
        </Text>
      )}
    </ScrollView>
  );
}
