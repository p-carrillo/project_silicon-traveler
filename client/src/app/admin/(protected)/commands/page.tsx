import { StatusMessage } from '@/app/components/status-message';
import { adminRequest, JourneyListResponse } from '@/lib/admin-api';
import { CommandForm } from './command-form';

export default async function AdminCommandsPage() {
  const result = await adminRequest<JourneyListResponse>('/journeys');

  if (result.error) {
    return (
      <StatusMessage
        tone="error"
        title="Unable to load journeys"
        description="Please try again later."
      />
    );
  }

  const journeys = result.data?.journeys ?? [];

  if (journeys.length === 0) {
    return (
      <StatusMessage
        tone="empty"
        title="No journeys available"
        description="Create a journey before running manual commands."
      />
    );
  }

  return (
    <section>
      <h2 className="admin-section-title">Manual entry generation</h2>
      <CommandForm journeys={journeys} />
    </section>
  );
}
