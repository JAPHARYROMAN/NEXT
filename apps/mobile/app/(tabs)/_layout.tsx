import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#1f1f1f' },
        tabBarActiveTintColor: '#7c6cff',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed' }} />
    </Tabs>
  );
}
