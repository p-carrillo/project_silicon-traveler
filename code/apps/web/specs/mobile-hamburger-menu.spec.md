# Spec: Mobile Hamburger Menu

## Context
Navigation links are hidden on mobile (`hidden md:flex`). There is no way for mobile users to switch between Journal, Archive, and Map sections. A classic hamburger menu (3-line icon) is needed.

## Acceptance Criteria
- GIVEN the user is on any page on a mobile screen WHEN the header renders THEN a hamburger icon (Bars3Icon) is visible only on mobile (`md:hidden`).
- GIVEN the hamburger icon is visible WHEN the user taps it THEN a dropdown menu appears with links to Journal, Archive, and Map.
- GIVEN the dropdown menu is open WHEN the user taps a navigation link THEN the menu closes and the user navigates to the target page.
- GIVEN the dropdown menu is open WHEN the user taps the close button (XMarkIcon) THEN the menu closes.
- GIVEN the SectionTopBar component WHEN it renders on desktop (md+) THEN the hamburger icon is hidden and the standard nav links are visible.
- GIVEN the mobile menu component WHEN it is created THEN it uses `"use client"` directive since it needs useState for toggle.
- GIVEN the SectionTopBar component WHEN the mobile menu is added THEN SectionTopBar remains a Server Component (no `"use client"` added to it).

## Affected Files
- `apps/web/src/components/layout/MobileMenu.tsx` -- NEW client component with hamburger toggle and dropdown nav.
- `apps/web/src/components/layout/SectionTopBar.tsx` -- import and render MobileMenu, pass navItems, activeHref, and theme.

## Notes
- Use Heroicons `Bars3Icon` for the hamburger and `XMarkIcon` for the close button.
- The dropdown should support both dark and light themes.
- Navigation items come from `getArchiveNavItems()` already used in SectionTopBar.
- The menu must be keyboard-accessible with proper aria attributes.
