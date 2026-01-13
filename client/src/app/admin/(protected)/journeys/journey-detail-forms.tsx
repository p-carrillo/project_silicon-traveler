'use client';

import { useFormState } from 'react-dom';
import { FormSubmit } from '../../components/form-submit';
import {
  addStop,
  JourneyFormState,
  reorderStops,
  updateJourney,
  updateStop,
} from './actions';
import { JourneyDetail, JourneyStop } from '@/lib/admin-api';

const initialState: JourneyFormState = { status: 'idle' };

export function JourneyUpdateForm({ journey }: { journey: JourneyDetail }) {
  const [state, formAction] = useFormState(
    updateJourney.bind(null, journey.id),
    initialState,
  );

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="journey-name">Name</label>
          <input
            id="journey-name"
            name="name"
            type="text"
            defaultValue={journey.name}
            required
          />
        </div>
        <div className="admin-field">
          <label htmlFor="journey-status">Status</label>
          <select
            id="journey-status"
            name="status"
            defaultValue={journey.status}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="journey-start">Start date</label>
          <input
            id="journey-start"
            name="startDate"
            type="date"
            defaultValue={journey.start_date ?? ''}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="journey-timezone">Timezone</label>
          <input
            id="journey-timezone"
            name="timezone"
            type="text"
            defaultValue={journey.timezone}
            required
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="journey-description">Description</label>
        <textarea
          id="journey-description"
          name="description"
          rows={3}
          defaultValue={journey.description ?? ''}
        />
      </div>
      {state.message ? (
        <p className={`admin-message ${state.status}`}>{state.message}</p>
      ) : null}
      <FormSubmit
        idleLabel="Save journey"
        pendingLabel="Saving..."
        className="admin-button"
      />
    </form>
  );
}

export function StopCreateForm({ journeyId }: { journeyId: string }) {
  const [state, formAction] = useFormState(
    addStop.bind(null, journeyId),
    initialState,
  );

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="stop-title">Title</label>
          <input id="stop-title" name="title" type="text" required />
        </div>
        <div className="admin-field">
          <label htmlFor="stop-city">City</label>
          <input id="stop-city" name="city" type="text" />
        </div>
      </div>
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="stop-country">Country</label>
          <input id="stop-country" name="country" type="text" />
        </div>
        <div className="admin-field">
          <label htmlFor="stop-description">Description</label>
          <input id="stop-description" name="description" type="text" />
        </div>
      </div>
      {state.message ? (
        <p className={`admin-message ${state.status}`}>{state.message}</p>
      ) : null}
      <FormSubmit
        idleLabel="Add stop"
        pendingLabel="Adding..."
        className="admin-button"
      />
    </form>
  );
}

export function StopUpdateForm({
  journeyId,
  stop,
}: {
  journeyId: string;
  stop: JourneyStop;
}) {
  const [state, formAction] = useFormState(
    updateStop.bind(null, journeyId, stop.id),
    initialState,
  );

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor={`stop-title-${stop.id}`}>Title</label>
          <input
            id={`stop-title-${stop.id}`}
            name="title"
            type="text"
            defaultValue={stop.title}
            required
          />
        </div>
        <div className="admin-field">
          <label htmlFor={`stop-city-${stop.id}`}>City</label>
          <input
            id={`stop-city-${stop.id}`}
            name="city"
            type="text"
            defaultValue={stop.city ?? ''}
          />
        </div>
      </div>
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor={`stop-country-${stop.id}`}>Country</label>
          <input
            id={`stop-country-${stop.id}`}
            name="country"
            type="text"
            defaultValue={stop.country ?? ''}
          />
        </div>
        <div className="admin-field">
          <label htmlFor={`stop-description-${stop.id}`}>Description</label>
          <input
            id={`stop-description-${stop.id}`}
            name="description"
            type="text"
            defaultValue={stop.description ?? ''}
          />
        </div>
      </div>
      <div className="admin-inline-meta">
        <span>Sequence {stop.sequence}</span>
        <span className="admin-muted">Stop ID: {stop.id}</span>
      </div>
      {state.message ? (
        <p className={`admin-message ${state.status}`}>{state.message}</p>
      ) : null}
      <FormSubmit
        idleLabel="Save stop"
        pendingLabel="Saving..."
        className="admin-button"
      />
    </form>
  );
}

function buildStopOrderValue(stops: JourneyStop[]): string {
  return stops.map((stop) => stop.id).join('\n');
}

export function StopOrderForm({
  journeyId,
  stops,
}: {
  journeyId: string;
  stops: JourneyStop[];
}) {
  const [state, formAction] = useFormState(
    reorderStops.bind(null, journeyId),
    initialState,
  );

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-field">
        <label htmlFor="stop-order">Stop order (top to bottom)</label>
        <textarea
          id="stop-order"
          name="orderedStopIds"
          rows={Math.max(3, stops.length)}
          defaultValue={buildStopOrderValue(stops)}
        />
      </div>
      <p className="admin-hint">
        List stop IDs in the desired order. One ID per line or comma separated.
      </p>
      {state.message ? (
        <p className={`admin-message ${state.status}`}>{state.message}</p>
      ) : null}
      <FormSubmit
        idleLabel="Reorder stops"
        pendingLabel="Reordering..."
        className="admin-button"
      />
    </form>
  );
}
