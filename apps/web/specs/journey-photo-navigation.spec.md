# Spec: Journey Photo Navigation

## Context
The PhotoJournal component shows a single photo with an "Explorar archivo" link. Users want to browse photos sequentially (previous/next) instead of going to the archive.

## Acceptance Criteria
- GIVEN the PhotoJournal component WHEN it receives a `prevPhotoDate` prop THEN it renders a "Previous photo" link pointing to `/photo/{prevPhotoDate}` with a left arrow.
- GIVEN the PhotoJournal component WHEN it receives a `nextPhotoDate` prop THEN it renders a "Next photo" link pointing to `/photo/{nextPhotoDate}` with a right arrow.
- GIVEN the PhotoJournal component WHEN `prevPhotoDate` is undefined THEN the "Previous photo" link is not rendered.
- GIVEN the PhotoJournal component WHEN `nextPhotoDate` is undefined THEN the "Next photo" link is not rendered.
- GIVEN the PhotoJournal component WHEN it renders THEN the old "Explorar archivo" link is removed and replaced with the navigation links.
- GIVEN the home page (page.tsx) WHEN it fetches the latest photo THEN it also fetches the previous photo's date and passes it as `prevPhotoDate`.
- GIVEN the photo/[date] page WHEN it fetches a photo by date THEN it also fetches adjacent photos and passes `prevPhotoDate` and `nextPhotoDate`.
- GIVEN the translations WHEN photo navigation is rendered THEN it uses `photo.prevPhoto` and `photo.nextPhoto` keys.

## Affected Files
- `apps/web/src/components/photo/PhotoJournal.tsx` -- add `prevPhotoDate` and `nextPhotoDate` optional props, replace "Explorar archivo" link.
- `apps/web/src/app/page.tsx` -- fetch previous photo date and pass to PhotoJournal.
- `apps/web/src/app/photo/[date]/page.tsx` -- fetch adjacent photo dates and pass to PhotoJournal.
- `apps/web/src/lib/i18n/translations.ts` -- add `photo.prevPhoto` and `photo.nextPhoto` translation keys.

## Notes
- Use `ArrowLeftIcon` for previous and `ArrowRightIcon` for next (already imported partially).
- The API returns photos ordered by published_at DESC. Use date range filters to find adjacent photos.
- On the home page, there's no "next" photo since it shows the latest.
