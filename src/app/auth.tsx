import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { api, useSession } from '../lib/api';
import { Button, Field, styles } from '../components/saloon-ui';
export default function Auth() {
  const { signIn } = useSession();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'forgot') {
        const r = await api<{ message: string }>('/auth/forgot', 'POST', { email });
        setMessage(r.message);
      } else if (mode === 'reset') {
        const r = await api<{ message: string }>('/auth/reset', 'POST', { token, password });
        setMode('login');
        setMessage(r.message);
      } else {
        await signIn(email, password, mode === 'register' ? name : undefined);
        router.replace('/');
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>
        {mode === 'register'
          ? 'A little self-care starts here.'
          : mode === 'login'
            ? 'Welcome back.'
            : 'Let’s get you back in.'}
      </Text>
      <Text style={styles.sub}>Your next great look is a few moments away.</Text>
      {mode === 'register' && (
        <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
      )}
      {mode !== 'reset' && (
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      )}
      {mode === 'reset' && (
        <Field
          label="Reset code from your email"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
        />
      )}
      {mode !== 'forgot' && (
        <Field
          label="Password (at least 12 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      )}
      {message && <Text style={styles.error}>{message}</Text>}
      <Button
        title={
          busy
            ? 'Please wait…'
            : mode === 'register'
              ? 'Create account'
              : mode === 'forgot'
                ? 'Send reset code'
                : mode === 'reset'
                  ? 'Reset password'
                  : 'Log in'
        }
        onPress={submit}
        disabled={busy}
      />
      <View style={styles.row}>
        {['login', 'register', 'forgot', 'reset']
          .filter((x) => x !== mode)
          .map((x) => (
            <Button
              key={x}
              title={
                {
                  login: 'Log in',
                  register: 'Register',
                  forgot: 'Forgot password',
                  reset: 'Reset password',
                }[x]!
              }
              secondary
              onPress={() => {
                setMode(x);
                setMessage('');
              }}
            />
          ))}
      </View>
    </ScrollView>
  );
}
