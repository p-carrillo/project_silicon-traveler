'use client';

import { useState } from 'react';

interface AdminLocationFieldsProps {
  fields: {
    city: string;
    country: string;
    region: string;
    lat: string;
    lng: string;
  };
  placeholders: {
    city: string;
    country: string;
    region: string;
  };
  geocode: {
    calculate: string;
    calculating: string;
    success: string;
    errors: {
      cityRequired: string;
      notFound: string;
      failed: string;
    };
  };
  initial: {
    placeName: string;
    country: string;
    region: string;
    lat: string;
    lng: string;
  };
  publishControl?: {
    label: string;
    checked: boolean;
    checkedLabel: string;
    uncheckedLabel: string;
  };
}

interface GeocodeResponse {
  coordinates: {
    lat: number;
    lng: number;
  };
  place_name?: string;
  country?: string;
  region?: string;
}

export default function AdminLocationFields({
  fields,
  placeholders,
  geocode,
  initial,
  publishControl,
}: AdminLocationFieldsProps) {
  const [placeName, setPlaceName] = useState(initial.placeName);
  const [country, setCountry] = useState(initial.country);
  const [region, setRegion] = useState(initial.region);
  const [lat, setLat] = useState(initial.lat);
  const [lng, setLng] = useState(initial.lng);
  const [feedback, setFeedback] = useState<{ kind: 'idle' | 'error' | 'success'; message: string }>({
    kind: 'idle',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(publishControl?.checked ?? false);

  async function calculateCoordinates() {
    const normalizedPlaceName = placeName.trim();
    if (!normalizedPlaceName) {
      setFeedback({ kind: 'error', message: geocode.errors.cityRequired });
      return;
    }

    const params = new URLSearchParams();
    params.set('place_name', normalizedPlaceName);
    if (country.trim()) {
      params.set('country', country.trim());
    }
    if (region.trim()) {
      params.set('region', region.trim());
    }

    setIsLoading(true);
    setFeedback({ kind: 'idle', message: '' });

    try {
      const response = await fetch(`/admin/api/geocode?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setFeedback({ kind: 'error', message: geocode.errors.notFound });
        } else {
          setFeedback({ kind: 'error', message: geocode.errors.failed });
        }
        return;
      }

      const data = (await response.json()) as GeocodeResponse;
      setLat(String(data.coordinates.lat));
      setLng(String(data.coordinates.lng));
      if (typeof data.place_name === 'string' && data.place_name.trim()) {
        setPlaceName(data.place_name.trim());
      }
      if (typeof data.country === 'string' && data.country.trim()) {
        setCountry(data.country.trim());
      }
      if (typeof data.region === 'string' && data.region.trim()) {
        setRegion(data.region.trim());
      }

      setFeedback({ kind: 'success', message: geocode.success });
    } catch {
      setFeedback({ kind: 'error', message: geocode.errors.failed });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
        {fields.city}
        <input
          name="place_name"
          value={placeName}
          onChange={(event) => setPlaceName(event.target.value)}
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
          placeholder={placeholders.city}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
        {fields.country}
        <input
          name="country"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
          placeholder={placeholders.country}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
        {fields.region}
        <input
          name="region"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
          placeholder={placeholders.region}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
          {fields.lat}
          <input
            name="lat"
            inputMode="decimal"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
          {fields.lng}
          <input
            name="lng"
            inputMode="decimal"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
            required
          />
        </label>
      </div>

      <div className="md:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={calculateCoordinates}
          disabled={isLoading}
          className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? geocode.calculating : geocode.calculate}
        </button>

        {publishControl ? (
          <label className="flex items-center gap-3 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2">
            <span className="inline-flex rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
              {isPublished ? publishControl.checkedLabel : publishControl.uncheckedLabel}
            </span>
            <span className="text-sm text-zinc-700">{publishControl.label}</span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-zinc-300 transition peer-checked:bg-emerald-600" />
              <span className="pointer-events-none absolute left-0.5 size-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </span>
          </label>
        ) : null}

        {feedback.message ? (
          <p
            className={`text-xs ${
              feedback.kind === 'error' ? 'text-red-700' : 'text-zinc-600'
            }`}
          >
            {feedback.message}
          </p>
        ) : null}
      </div>
    </>
  );
}
