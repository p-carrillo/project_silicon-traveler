import Image from 'next/image';
import { redirect } from 'next/navigation';
import AdminDeleteRoutePointButton from '@/components/admin/AdminDeleteRoutePointButton';
import AdminLocationFields from '@/components/admin/AdminLocationFields';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import {
  deleteAdminRoutePoint,
  getAdminRoutePoint,
  updateAdminRoutePoint,
  uploadAdminRoutePointPhoto,
} from '@/lib/admin-api';
import { normalizeOptionalString, parseCoordinateInput, resolvePublishStatus } from '@/lib/admin-form';
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
  searchParams?: { error?: string; saved?: string };
}) {
  const locale = getServerLocale();
  const t = getTranslations(locale);
  const id = Number(params.id);
  const error = typeof searchParams?.error === 'string' ? searchParams.error : '';
  const saved = searchParams?.saved === '1';

  if (!Number.isFinite(id)) {
    redirect('/admin?error=invalid_id');
  }

  const routePoint = await getAdminRoutePoint(id);

  async function saveAction(formData: FormData) {
    'use server';

    const placeName = normalizeOptionalString(formData.get('place_name'));
    const country = normalizeOptionalString(formData.get('country'));
    const region = normalizeOptionalString(formData.get('region'));
    const imagePrompt = normalizeOptionalString(formData.get('image_prompt'));
    const narrativePrompt = normalizeOptionalString(formData.get('narrative_prompt'));
    const lat = parseCoordinateInput(formData.get('lat'));
    const lng = parseCoordinateInput(formData.get('lng'));
    const isPublished = formData.get('is_published') === 'on';
    const status = resolvePublishStatus(routePoint.status, isPublished);

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
        status,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('image_ready')) {
        redirect(`/admin/route-points/${id}?error=publish_not_ready`);
      }
      if (message.includes('image assets')) {
        redirect(`/admin/route-points/${id}?error=publish_missing_image`);
      }
      redirect(`/admin/route-points/${id}?error=save_failed`);
    }

    redirect(`/admin/route-points/${id}?saved=1`);
  }

  async function uploadPhotoAction(formData: FormData) {
    'use server';

    const file = formData.get('photo');
    if (!(file instanceof File)) {
      redirect(`/admin/route-points/${id}?error=photo_required`);
    }
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png']);
    if (!allowedMimeTypes.has(file.type)) {
      redirect(`/admin/route-points/${id}?error=photo_type`);
    }
    const contentType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

    const imageBuffer = await file.arrayBuffer();
    if (imageBuffer.byteLength === 0) {
      redirect(`/admin/route-points/${id}?error=photo_required`);
    }

    try {
      await uploadAdminRoutePointPhoto(id, imageBuffer, contentType);
    } catch {
      redirect(`/admin/route-points/${id}?error=photo_failed`);
    }

    redirect(`/admin/route-points/${id}`);
  }

  async function deleteAction() {
    'use server';

    try {
      await deleteAdminRoutePoint(id);
    } catch {
      redirect(`/admin/route-points/${id}?error=delete_failed`);
    }

    redirect('/admin?deleted=1');
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
          <div className="flex justify-end">
            <AdminLogoutButton label={t.admin.actions.logout} />
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorMessage(t, error)}
            </div>
          ) : null}
          {saved ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {t.admin.success.saved}
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
                  accept="image/jpeg,image/png"
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

            <form
              id="admin-route-point-edit-form"
              action={saveAction}
              className="rounded-lg border border-zinc-200 bg-white p-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminLocationFields
                  key={`${routePoint.id}-${routePoint.updated_at}`}
                  fields={t.admin.fields}
                  placeholders={t.admin.placeholders}
                  geocode={t.admin.geocode}
                  initial={{
                    placeName: routePoint.place_name || '',
                    country: routePoint.country || '',
                    region: routePoint.region || '',
                    lat: String(routePoint.coordinates.lat),
                    lng: String(routePoint.coordinates.lng),
                  }}
                  publishControl={{
                    label: t.admin.publishSwitch.label,
                    checked: routePoint.status === 'published',
                    checkedLabel: t.admin.publishSwitch.checkedLabel,
                    uncheckedLabel: t.admin.publishSwitch.uncheckedLabel,
                  }}
                />

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
                <AdminDeleteRoutePointButton
                  formId="admin-route-point-edit-form"
                  triggerLabel={t.admin.actions.delete}
                  title={t.admin.deleteModal.title}
                  description={t.admin.deleteModal.description}
                  confirmLabel={t.admin.deleteModal.confirm}
                  cancelLabel={t.admin.deleteModal.cancel}
                  action={deleteAction}
                />
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

function errorMessage(t: Translations, code: string): string {
  if (code === 'invalid_coordinates') return t.admin.errors.invalidCoordinates;
  if (code === 'save_failed') return t.admin.errors.saveFailed;
  if (code === 'publish_not_ready') return t.admin.errors.publishNotReady;
  if (code === 'publish_missing_image') return t.admin.errors.publishMissingImage;
  if (code === 'delete_failed') return t.admin.errors.deleteFailed;
  if (code === 'photo_required') return t.admin.errors.photoRequired;
  if (code === 'photo_type') return t.admin.errors.photoType;
  if (code === 'photo_failed') return t.admin.errors.photoFailed;
  return t.admin.errors.unknown;
}
