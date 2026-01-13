'use client';

import { useFormState } from 'react-dom';
import { FormSubmit } from '../../components/form-submit';
import { createJourney, JourneyFormState } from './actions';

const initialState: JourneyFormState = { status: 'idle' };

export function JourneyCreateForm() {
  const [state, formAction] = useFormState(createJourney, initialState);

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="journey-name">Name</label>
          <input id="journey-name" name="name" type="text" required />
        </div>
        <div className="admin-field">
          <label htmlFor="journey-status">Status</label>
          <select id="journey-status" name="status">
            <option value="">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="journey-start">Start date</label>
          <input id="journey-start" name="startDate" type="date" />
        </div>
        <div className="admin-field">
          <label htmlFor="journey-timezone">Timezone</label>
          <input
            id="journey-timezone"
            name="timezone"
            type="text"
            placeholder="UTC"
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="journey-description">Description</label>
        <textarea id="journey-description" name="description" rows={3} />
      </div>
      {state.message ? (
        <p className={`admin-message ${state.status}`}>{state.message}</p>
      ) : null}
      <FormSubmit
        idleLabel="Create journey"
        pendingLabel="Creating..."
        className="admin-button"
      />
    </form>
  );
}
