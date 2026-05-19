import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'NEXT',
  slug: 'next-mobile',
  scheme: 'next',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#08080b',
  },
  ios: {
    bundleIdentifier: 'io.next.app',
    supportsTablet: true,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      NSCameraUsageDescription: 'NEXT uses the camera to record video.',
      NSMicrophoneUsageDescription: 'NEXT uses the microphone to record audio.',
      NSPhotoLibraryUsageDescription: 'NEXT accesses your library to upload media.',
    },
  },
  android: {
    package: 'io.next.app',
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#08080b' },
    permissions: ['CAMERA', 'RECORD_AUDIO', 'READ_MEDIA_VIDEO', 'READ_MEDIA_IMAGES'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-updates', { useClassicUpdates: false }],
  ],
  experiments: { typedRoutes: true },
  runtimeVersion: { policy: 'appVersion' },
  updates: { url: process.env['EXPO_UPDATES_URL'] ?? '' },
  extra: {
    apiUrl: process.env['EXPO_PUBLIC_API_URL'] ?? 'https://api.next.io',
    eas: { projectId: process.env['EAS_PROJECT_ID'] ?? '' },
  },
};

export default config;
