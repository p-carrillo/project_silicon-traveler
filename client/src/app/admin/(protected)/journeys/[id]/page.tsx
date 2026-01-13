import { StatusMessage } from '@/app/components/status-message';
import { adminRequest, JourneyDetailResponse } from '@/lib/admin-api';
import {
  JourneyUpdateForm,
  StopCreateForm,
  StopOrderForm,
  StopUpdateForm,
} from '../journey-detail-forms';

export default async function AdminJourneyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await adminRequest<JourneyDetailResponse>(
    `/journeys/${params.id}`,
  );

  if (result.status === 404) {
    return (
      <StatusMessage
        tone="empty"
        title="Journey not found"
        description="Choose another journey or create a new one."
      />
    );
  }

  if (!result.data) {
    return (
      <StatusMessage
        tone="error"
        title="Unable to load journey"
        description="Please try again later."
      />
    );
  }

  const journey = result.data.journey;
  const stops = journey.stops ?? [];

  return (
    <div className="admin-stack">
      <section>
        <h2 className="admin-section-title">Journey details</h2>
        <JourneyUpdateForm journey={journey} />
      </section>
      <section>
        <h2 className="admin-section-title">Add a stop</h2>
        <StopCreateForm journeyId={journey.id} />
      </section>
      <section>
        <h2 className="admin-section-title">Stops</h2>
        {stops.length === 0 ? (
          <StatusMessage
            tone="empty"
            title="No stops yet"
            description="Add your first stop to start the itinerary."
          />
        ) : (
          <div className="admin-list">
            {stops.map((stop) => (
              <StopUpdateForm
                key={stop.id}
                journeyId={journey.id}
                stop={stop}
              />
            ))}
          </div>
        )}
      </section>
      {stops.length > 1 ? (
        <section>
          <h2 className="admin-section-title">Reorder stops</h2>
          <StopOrderForm journeyId={journey.id} stops={stops} />
        </section>
      ) : null}
    </div>
  );
}
