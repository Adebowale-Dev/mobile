import { Pressable, Text, TextInput, View, StyleSheet, type TextInputProps } from 'react-native';
export const colors = {
  ink: '#202e28',
  muted: '#718077',
  cream: '#f6f5ee',
  green: '#284c3b',
  gold: '#c89c62',
};
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, secondary && styles.secondary, disabled && { opacity: 0.5 }]}
    >
      <Text
        style={{
          color: secondary ? colors.green : 'white',
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#87948d" style={styles.input} {...props} />
    </View>
  );
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 22, gap: 18, paddingBottom: 40 },
  heading: { fontSize: 32, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 15, lineHeight: 23, color: colors.muted },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink },
  input: {
    backgroundColor: 'white',
    borderColor: '#d9dfd8',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    color: colors.ink,
    minHeight: 48,
  },
  button: {
    backgroundColor: colors.green,
    padding: 15,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  secondary: { backgroundColor: '#e4ebe1' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 18, gap: 12 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  error: { color: '#a0392e', backgroundColor: '#fbe9e4', padding: 14, borderRadius: 12 },
  badge: {
    color: colors.green,
    backgroundColor: '#e6edde',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    fontWeight: '600',
  },
  photo: { width: '100%', height: 190, borderRadius: 14 },
});
