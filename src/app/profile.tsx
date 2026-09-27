import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { api, useSession, type User } from '../lib/api';
import { Button, Field, styles } from '../components/saloon-ui';
export default function Profile() {
  const { user, update, logout } = useSession();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!user) return;
    setBusy(true);
    try {
      update(await api<User>('/auth/me', 'PATCH', { name, phone, favorites: user.favorites }));
      setMessage('Profile saved.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Hello, {user?.name.split(' ')[0] || 'there'}.</Text>
      <Text style={styles.sub}>{user?.email}</Text>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {message && <Text style={styles.sub}>{message}</Text>}
      <Button title="Save profile" onPress={save} disabled={busy} />
      <Button
        title="Log out"
        secondary
        onPress={() => {
          void logout()
            .catch(() => {})
            .finally(() => router.replace('/'));
        }}
      />
    </ScrollView>
  );
}
