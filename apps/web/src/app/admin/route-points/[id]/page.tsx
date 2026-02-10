import Image from 'next/image';
import { redirect } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import { getAdminRoutePoint, updateAdminRoutePoint, uploadAdminRoutePointPhoto } from '@/lib/admin-api';
import { toProxyImageSrc } from '@/lib/images';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations, type Translations } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EditRoutePointPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  const locale = getServerLocale();
  const t = getTranslations(locale);
  const id = Number(params.id);
  const error = typeof searchParams?.error === 'string' ? searchParams.error : '';

  if (!Number.isFinite(id)) {
    redirect('/admin?error=invalid_id');
  }

  const routePoint = await getAdminRoutePoint(id);

  async function saveAction(formData: FormData) {
    'use server';

    const placeName = normalizeString(formData.get('place_name'));
    const country = normalizeString(formData.get('country'));
    const region = normalizeString(formData.get('region'));
    const imagePrompt = normalizeString(formData.get('image_prompt'));
    const narrativePrompt = normalizeString(formData.get('narrative_prompt'));
    const lat = Number(formData.get('lat'));
    const lng = Number(formData.get('lng'));

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      redirect(`/admin/route-points/${id}?error=invalid_coordinates`);
    }

    try {
      await updateAdminRoutePoint(id, {
        place_name: placeName,
        country,
        region,
        coordinates: { lat, lng },
        image_prompt: imagePrompt,
        narrative_prompt: narrativePrompt,
      });
    } catch {
      redirect(`/admin/route-points/${id}?error=save_failed`);
    }

    redirect(`/admin/route-points/${id}`);
  }

  async function uploadPhotoAction(formData: FormData) {
    'use server';

    const file = formData.get('photo');
    if (!(file instanceof File)) {
      redirect(`/admin/route-points/${id}?error=photo_required`);
    }
    if (file.type !== 'image/jpeg') {
      redirect(`/admin/route-points/${id}?error=photo_type`);
    }

    const jpeg = await file.arrayBuffer();
    if (jpeg.byteLength === 0) {
      redirect(`/admin/route-points/${id}?error=photo_required`);
    }

    try {
      await uploadAdminRoutePointPhoto(id, jpeg);
    } catch {
      redirect(`/admin/route-points/${id}?error=photo_failed`);
    }

    redirect(`/admin/route-points/${id}`);
  }

  const imageSrc = routePoint.thumbnail_path || routePoint.image_path;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SectionTopBar
        title={t.admin.edit.title}
        theme="light"
        activeHref="/"
        className="border-b border-zinc-200 bg-zinc-100/95"
        navLabels={t.nav}
      />
      <PageContainer className="py-6 md:py-10">
        <div className="flex flex-col gap-6">
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorMessage(t, error)}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-600">{t.admin.fields.photo}</div>
              <div className="mt-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                {imageSrc ? (
                  <Image
                    src={toProxyImageSrc(imageSrc)}
                    alt={t.admin.alt.routePointPhoto}
                    width={800}
                    height={800}
                    className="h-auto w-full"
                  />
                ) : (
                  <div className="p-6 text-sm text-zinc-600">{t.admin.fallback.noPhoto}</div>
                )}
              </div>

              <form action={uploadPhotoAction} className="mt-4 flex flex-col gap-3">
                <input
                  type="file"
                  name="photo"
                  accept="image/jpeg"
                  className="block w-full text-sm"
                />
                <button
                  type="submit"
                  className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900"
                >
                  {t.admin.actions.uploadJpeg}
                </button>
              </form>
            </div>

            <form action={saveAction} className="rounded-lg border border-zinc-200 bg-white p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  {t.admin.fields.city}
                  <input
                    name="place_name"
                    defaultValue={routePoint.place_name || ''}
                    className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
                    placeholder={t.admin.placeholders.city}
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  {t.admin.fields.country}
                  <input
                    name="country"
                    defaultValue={routePoint.country || ''}
                    className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
                    placeholder={t.admin.placeholders.country}
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  {t.admin.fields.region}
                  <input
                    name="region"
                    defaultValue={routePoint.region || ''}
                    className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
                    placeholder={t.admin.placeholders.region}
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                    {t.admin.fields.lat}
                    <input
                      name="lat"
                      inputMode="decimal"
                      defaultValue={String(routePoint.coordinates.lat)}
                      className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                    {t.admin.fields.lng}
                    <input
                      name="lng"
                      inputMode="decimal"
                      defaultValue={String(routePoint.coordinates.lng)}
                      className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
                      required
                    />
                  </label>
                </div>

                <label className="md:col-span-2 flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  {t.admin.fields.prompt}
                  <textarea
                    name="image_prompt"
                    defaultValue={routePoint.image_prompt || ''}
                    className="min-h-[100px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    placeholder={t.admin.placeholders.prompt}
                  />
                </label>

                <label className="md:col-span-2 flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  {t.admin.fields.text}
                  <textarea
                    name="narrative_prompt"
                    defaultValue={routePoint.narrative_prompt || ''}
                    className="min-h-[140px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    placeholder={t.admin.placeholders.text}
                  />
                </label>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button type="submit" className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white">
                  {t.admin.actions.save}
                </button>
                <a
                  href="/admin"
                  className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 inline-flex items-center"
                >
                  {t.admin.actions.back}
                </a>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function normalizeString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function errorMessage(t: Translations, code: string): string {
  if (code === 'invalid_coordinates') return t.admin.errors.invalidCoordinates;
  if (code === 'save_failed') return t.admin.errors.saveFailed;
  if (code === 'photo_required') return t.admin.errors.photoRequired;
  if (code === 'photo_type') return t.admin.errors.photoType;
  if (code === 'photo_failed') return t.admin.errors.photoFailed;
  return t.admin.errors.unknown;
}
