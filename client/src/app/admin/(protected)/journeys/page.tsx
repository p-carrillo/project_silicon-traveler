import Link from 'next/link';
import { StatusMessage } from '@/app/components/status-message';
import { adminRequest, JourneyListResponse } from '@/lib/admin-api';
import { JourneyCreateForm } from './journey-forms';

export default async function AdminJourneysPage() {
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

  return (
    <div className="admin-stack">
      <section>
        <h2 className="admin-section-title">Create a journey</h2>
        <JourneyCreateForm />
      </section>
      <section>
        <h2 className="admin-section-title">Journeys</h2>
        {journeys.length === 0 ? (
          <StatusMessage
            tone="empty"
            title="No journeys yet"
            description="Create a journey to begin adding stops."
          />
        ) : (
          <div className="admin-list">
            {journeys.map((journey) => (
              <div key={journey.id} className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">{journey.name}</h3>
                    <p className="admin-card-text">
                      Status: {journey.status} ·{' '}
                      {journey.start_date ?? 'No start date'}
                    </p>
                  </div>
                  <Link className="admin-link" href={`/admin/journeys/${journey.id}`}>
                    Manage
                  </Link>
                </div>
                {journey.description ? (
                  <p className="admin-card-text">{journey.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
