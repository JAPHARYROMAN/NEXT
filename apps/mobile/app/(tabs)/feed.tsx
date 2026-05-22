import { View, Text, StyleSheet } from 'react-native';

export default function FeedTab() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.sub}>
        Immersive vertical feed — wire @next/mobile-ui when RN player ships.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a', padding: 24, paddingTop: 64 },
  title: { color: '#fff', fontSize: 22, fontWeight: '600' },
  sub: { color: '#888', marginTop: 8, fontSize: 14 },
});
