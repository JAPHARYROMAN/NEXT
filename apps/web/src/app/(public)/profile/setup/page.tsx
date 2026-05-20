import { ProfileSetupFlow } from '@next/profile-ui';

export const metadata = {
  title: 'Profile setup — NEXT',
  description: 'Avatar, handle, bio, and visibility.',
};

export default function ProfileSetupPage() {
  return <ProfileSetupFlow />;
}
