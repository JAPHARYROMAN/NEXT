import { PrivacyTrustShell } from '@next/privacy-ui';

export const metadata = {
  title: 'Privacy — NEXT',
  description: 'Data control, consent, and account safety.',
};

export default function PrivacyPage() {
  return (
    <div className="px-4 py-8 sm:px-6">
      <PrivacyTrustShell />
    </div>
  );
}
