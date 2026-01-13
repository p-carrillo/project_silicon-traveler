'use server';

import { revalidatePath } from 'next/cache';
import { adminRequest } from '@/lib/admin-api';

export type JourneyFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function createJourney(
  _prevState: JourneyFormState,
  formData: FormData,
): Promise<JourneyFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const startDate = String(formData.get('startDate') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? '').trim();

  if (!name) {
    return { status: 'error', message: 'Journey name is required.' };
  }

  const result = await adminRequest('/journeys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      description: description || undefined,
      status: status || undefined,
      startDate: startDate || undefined,
      timezone: timezone || undefined,
    }),
  });

  if (!result.data) {
    return { status: 'error', message: 'Unable to create journey.' };
  }

  revalidatePath('/admin/journeys');
  return { status: 'success', message: 'Journey created.' };
}

export async function updateJourney(
  journeyId: string,
  _prevState: JourneyFormState,
  formData: FormData,
): Promise<JourneyFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const descriptionRaw = String(formData.get('description') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const startDateRaw = String(formData.get('startDate') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? '').trim();

  if (!name || !timezone) {
    return {
      status: 'error',
      message: 'Name and timezone are required.',
    };
  }

  const description = descriptionRaw === '' ? null : descriptionRaw;
  const startDate = startDateRaw === '' ? null : startDateRaw;

  const result = await adminRequest(`/journeys/${journeyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      description,
      status: status || undefined,
      startDate,
      timezone,
    }),
  });

  if (!result.data) {
    return { status: 'error', message: 'Unable to update journey.' };
  }

  revalidatePath(`/admin/journeys/${journeyId}`);
  revalidatePath('/admin/journeys');
  return { status: 'success', message: 'Journey updated.' };
}

export async function addStop(
  journeyId: string,
  _prevState: JourneyFormState,
  formData: FormData,
): Promise<JourneyFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const country = String(formData.get('country') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!title) {
    return { status: 'error', message: 'Stop title is required.' };
  }

  const result = await adminRequest(`/journeys/${journeyId}/stops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      city: city || undefined,
      country: country || undefined,
      description: description || undefined,
    }),
  });

  if (!result.data) {
    return { status: 'error', message: 'Unable to add stop.' };
  }

  revalidatePath(`/admin/journeys/${journeyId}`);
  return { status: 'success', message: 'Stop added.' };
}

export async function updateStop(
  journeyId: string,
  stopId: string,
  _prevState: JourneyFormState,
  formData: FormData,
): Promise<JourneyFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const cityRaw = String(formData.get('city') ?? '').trim();
  const countryRaw = String(formData.get('country') ?? '').trim();
  const descriptionRaw = String(formData.get('description') ?? '').trim();

  if (!title) {
    return { status: 'error', message: 'Stop title is required.' };
  }

  const result = await adminRequest(
    `/journeys/${journeyId}/stops/${stopId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        city: cityRaw === '' ? null : cityRaw,
        country: countryRaw === '' ? null : countryRaw,
        description: descriptionRaw === '' ? null : descriptionRaw,
      }),
    },
  );

  if (!result.data) {
    return { status: 'error', message: 'Unable to update stop.' };
  }

  revalidatePath(`/admin/journeys/${journeyId}`);
  return { status: 'success', message: 'Stop updated.' };
}

export async function reorderStops(
  journeyId: string,
  _prevState: JourneyFormState,
  formData: FormData,
): Promise<JourneyFormState> {
  const rawOrder = String(formData.get('orderedStopIds') ?? '').trim();

  const orderedStopIds = rawOrder
    .split(/\s|,/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (orderedStopIds.length === 0) {
    return {
      status: 'error',
      message: 'Provide stop IDs in the desired order.',
    };
  }

  const result = await adminRequest(`/journeys/${journeyId}/stops/order`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedStopIds }),
  });

  if (!result.data) {
    return { status: 'error', message: 'Unable to reorder stops.' };
  }

  revalidatePath(`/admin/journeys/${journeyId}`);
  return { status: 'success', message: 'Stops reordered.' };
}
