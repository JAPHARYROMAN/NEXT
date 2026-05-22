export const demoAmbientSessions = [
  {
    id: 'session-calm',
    title: 'Calm intelligence playback',
    mood: 'calm' as const,
    description: 'Low-distraction ambient layer with contextual overlays.',
  },
  {
    id: 'session-live',
    title: 'Live event atmosphere',
    mood: 'energetic' as const,
    description: 'Subtle synchronized motion placeholders for live energy.',
  },
] as const;

export const demoAmbientInsights = [
  'Ambient UI appears when needed',
  'Contrast-safe overlays for reduced distraction',
  'GPU-efficient gradient lighting only',
] as const;
