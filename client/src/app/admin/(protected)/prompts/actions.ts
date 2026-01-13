'use server';

import { revalidatePath } from 'next/cache';
import { adminRequest } from '@/lib/admin-api';

export type PromptFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function createPromptTemplate(
  _prevState: PromptFormState,
  formData: FormData,
): Promise<PromptFormState> {
  const keyName = String(formData.get('keyName') ?? '').trim();
  const kind = String(formData.get('kind') ?? '').trim();
  const template = String(formData.get('template') ?? '').trim();
  const isActive = formData.get('isActive') === 'on';

  if (!keyName || !kind || !template) {
    return {
      status: 'error',
      message: 'Key name, kind, and template are required.',
    };
  }

  const result = await adminRequest('/prompt-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyName, kind, template, isActive }),
  });

  if (!result.data) {
    return { status: 'error', message: 'Unable to create template.' };
  }

  revalidatePath('/admin/prompts');
  return { status: 'success', message: 'Template created.' };
}

export async function updatePromptTemplate(
  templateId: string,
  _prevState: PromptFormState,
  formData: FormData,
): Promise<PromptFormState> {
  const keyName = String(formData.get('keyName') ?? '').trim();
  const template = String(formData.get('template') ?? '').trim();
  const isActive = formData.get('isActive') === 'on';

  if (!keyName || !template) {
    return {
      status: 'error',
      message: 'Key name and template are required.',
    };
  }

  const result = await adminRequest(`/prompt-templates/${templateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyName, template, isActive }),
  });

  if (!result.data) {
    return { status: 'error', message: 'Unable to update template.' };
  }

  revalidatePath('/admin/prompts');
  return { status: 'success', message: 'Template updated.' };
}
