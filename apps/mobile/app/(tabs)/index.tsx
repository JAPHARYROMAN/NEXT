import { View, Text, StyleSheet, Linking, Pressable } from 'react-native';

/** RN shell — composes shared packages when native video modules land. */
export default function MobileHome() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>NEXT Mobile</Text>
      <Text style={styles.sub}>
        Native shell (Expo). Phase 19 web-mobile layer: open /mobile in the web app for full
        adaptive UX.
      </Text>
      <Pressable
        style={styles.btn}
        onPress={() => Linking.openURL('http://localhost:3000/mobile')}
        accessibilityRole="link"
      >
        <Text style={styles.btnText}>Open web mobile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a', padding: 24, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '600', marginBottom: 12 },
  sub: { color: '#aaa', fontSize: 14, lineHeight: 20, marginBottom: 24 },
  btn: { backgroundColor: '#7c6cff', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});
