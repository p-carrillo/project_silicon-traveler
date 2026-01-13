'use server';

import { revalidatePath } from 'next/cache';
import { adminRequest } from '@/lib/admin-api';

export type CommandState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  lastRunAt?: string;
};

export async function runManualGeneration(
  _prevState: CommandState,
  formData: FormData,
): Promise<CommandState> {
  const journeyId = String(formData.get('journeyId') ?? '').trim();
  const travelDate = String(formData.get('travelDate') ?? '').trim();
  const imageModel = String(formData.get('imageModel') ?? '').trim();
  const textModel = String(formData.get('textModel') ?? '').trim();

  if (!journeyId || !travelDate) {
    return {
      status: 'error',
      message: 'Select a journey and travel date.',
    };
  }

  const result = await adminRequest(`/journeys/${journeyId}/entries/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      travelDate,
      imageModel: imageModel || undefined,
      textModel: textModel || undefined,
    }),
  });

  if (!result.data) {
    return { status: 'error', message: 'Command failed to run.' };
  }

  revalidatePath('/admin/commands');
  return {
    status: 'success',
    message: 'Entry generated successfully.',
    lastRunAt: new Date().toISOString(),
  };
}
