'use client';

import { useFormState } from 'react-dom';
import { loginAction, LoginState } from './actions';
import { FormSubmit } from '../components/form-submit';

const initialState: LoginState = { status: 'idle' };

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="admin-form admin-card">
      <div className="admin-field">
        <label htmlFor="admin-username">Username</label>
        <input id="admin-username" name="username" type="text" required />
      </div>
      <div className="admin-field">
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
        />
      </div>
      {state.status === 'error' ? (
        <p className="admin-message error">{state.message}</p>
      ) : null}
      <FormSubmit
        idleLabel="Sign in"
        pendingLabel="Signing in..."
        className="admin-button"
      />
    </form>
  );
}
