import { redirect } from 'next/navigation';
import AdminLocationFields from '@/components/admin/AdminLocationFields';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import { createAdminRoutePoint } from '@/lib/admin-api';
import { normalizeOptionalString, parseCoordinateInput } from '@/lib/admin-form';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';
export const metadata = {
  robots: { index: false, follow: false },
};

export default function NewRoutePointPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const locale = getServerLocale();
  const t = getTranslations(locale);
  const error = typeof searchParams?.error === 'string' ? searchParams.error : '';

  async function createAction(formData: FormData) {
    'use server';

    const placeName = normalizeOptionalString(formData.get('place_name'));
    const country = normalizeOptionalString(formData.get('country'));
    const region = normalizeOptionalString(formData.get('region'));
    const lat = parseCoordinateInput(formData.get('lat'));
    const lng = parseCoordinateInput(formData.get('lng'));

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      redirect('/admin/route-points/new?error=invalid_coordinates');
    }

    try {
      await createAdminRoutePoint({
        place_name: placeName,
        country,
        region,
        coordinates: { lat, lng },
      });
    } catch {
      redirect('/admin/route-points/new?error=save_failed');
    }

    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SectionTopBar
        title={t.admin.new.title}
        theme="light"
        activeHref="/"
        className="border-b border-zinc-200 bg-zinc-100/95"
        navLabels={t.nav}
      />
      <PageContainer className="py-6 md:py-10">
        <div className="mb-4 flex justify-end">
          <AdminLogoutButton label={t.admin.actions.logout} />
        </div>
        <form action={createAction} className="max-w-2xl rounded-lg border border-zinc-200 bg-white p-6">
          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error === 'invalid_coordinates' ? t.admin.errors.invalidCoordinates : t.admin.errors.saveFailed}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AdminLocationFields
              fields={t.admin.fields}
              placeholders={t.admin.placeholders}
              geocode={t.admin.geocode}
              initial={{
                placeName: '',
                country: '',
                region: '',
                lat: '',
                lng: '',
              }}
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white">
              {t.admin.actions.create}
            </button>
            <a
              href="/admin"
              className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 inline-flex items-center"
            >
              {t.admin.actions.cancel}
            </a>
          </div>
        </form>
      </PageContainer>
    </div>
  );
}
