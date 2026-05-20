import { CommunityShell } from '@/features/community/community-shell';
import { StudioPageHeader } from '@next/studio-components';

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Community"
        subtitle="Spaces, discussions, watch parties — cultural emergence."
      />
      <CommunityShell />
    </div>
  );
}
