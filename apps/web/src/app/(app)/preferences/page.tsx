import { PersonalizationControls } from '@next/preferences-ui';

export const metadata = {
  title: 'Preferences — NEXT',
  description: 'Feed personalization and discovery controls.',
};

export default function PreferencesPage() {
  return (
    <div className="px-4 py-8 sm:px-6">
      <PersonalizationControls />
    </div>
  );
}
