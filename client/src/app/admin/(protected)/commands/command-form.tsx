'use client';

import { useFormState } from 'react-dom';
import { FormSubmit } from '../../components/form-submit';
import { runManualGeneration, CommandState } from './actions';
import { JourneySummary } from '@/lib/admin-api';

const initialState: CommandState = { status: 'idle' };

type CommandFormProps = {
  journeys: JourneySummary[];
};

export function CommandForm({ journeys }: CommandFormProps) {
  const [state, formAction] = useFormState(runManualGeneration, initialState);

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="command-journey">Journey</label>
          <select id="command-journey" name="journeyId" required>
            <option value="">Select a journey</option>
            {journeys.map((journey) => (
              <option key={journey.id} value={journey.id}>
                {journey.name}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="command-date">Travel date</label>
          <input id="command-date" name="travelDate" type="date" required />
        </div>
      </div>
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="command-image-model">Image model</label>
          <input id="command-image-model" name="imageModel" type="text" />
        </div>
        <div className="admin-field">
          <label htmlFor="command-text-model">Text model</label>
          <input id="command-text-model" name="textModel" type="text" />
        </div>
      </div>
      {state.message ? (
        <p className={`admin-message ${state.status}`}>{state.message}</p>
      ) : null}
      {state.lastRunAt ? (
        <p className="admin-hint">
          Last run: {new Date(state.lastRunAt).toLocaleString()}
        </p>
      ) : null}
      <FormSubmit
        idleLabel="Run generation"
        pendingLabel="Running..."
        className="admin-button"
      />
    </form>
  );
}
