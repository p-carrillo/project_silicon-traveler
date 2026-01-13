'use client';

import { useFormState } from 'react-dom';
import { FormSubmit } from '../../components/form-submit';
import { PromptFormState, createPromptTemplate, updatePromptTemplate } from './actions';
import { PromptTemplate } from '@/lib/admin-api';

const initialState: PromptFormState = { status: 'idle' };

type PromptCreateFormProps = {
  onSuccessMessage?: string;
};

export function PromptCreateForm({ onSuccessMessage }: PromptCreateFormProps) {
  const [state, formAction] = useFormState(createPromptTemplate, initialState);
  const message =
    state.status === 'success' ? onSuccessMessage ?? state.message : state.message;

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="prompt-key">Key name</label>
          <input id="prompt-key" name="keyName" type="text" required />
        </div>
        <div className="admin-field">
          <label htmlFor="prompt-kind">Kind</label>
          <select id="prompt-kind" name="kind" required>
            <option value="">Select</option>
            <option value="image">Image</option>
            <option value="text">Text</option>
          </select>
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="prompt-template">Template</label>
        <textarea
          id="prompt-template"
          name="template"
          rows={4}
          required
        />
      </div>
      <label className="admin-check">
        <input name="isActive" type="checkbox" defaultChecked />
        Active
      </label>
      {message ? (
        <p className={`admin-message ${state.status}`}>{message}</p>
      ) : null}
      <FormSubmit
        idleLabel="Create template"
        pendingLabel="Creating..."
        className="admin-button"
      />
    </form>
  );
}

type PromptUpdateFormProps = {
  template: PromptTemplate;
};

export function PromptUpdateForm({ template }: PromptUpdateFormProps) {
  const [state, formAction] = useFormState(
    updatePromptTemplate.bind(null, template.id),
    initialState,
  );

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor={`prompt-key-${template.id}`}>Key name</label>
          <input
            id={`prompt-key-${template.id}`}
            name="keyName"
            type="text"
            defaultValue={template.keyName}
            required
          />
        </div>
        <div className="admin-field">
          <label>Kind</label>
          <input type="text" value={template.kind} disabled />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor={`prompt-template-${template.id}`}>Template</label>
        <textarea
          id={`prompt-template-${template.id}`}
          name="template"
          rows={4}
          defaultValue={template.template}
          required
        />
      </div>
      <label className="admin-check">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={template.isActive}
        />
        Active
      </label>
      {state.message ? (
        <p className={`admin-message ${state.status}`}>{state.message}</p>
      ) : null}
      <FormSubmit
        idleLabel="Save changes"
        pendingLabel="Saving..."
        className="admin-button"
      />
    </form>
  );
}
