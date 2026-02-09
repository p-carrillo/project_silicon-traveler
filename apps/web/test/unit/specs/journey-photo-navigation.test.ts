import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('Spec: Journey Photo Navigation', () => {
  const photoJournal = readRepoFile(
    'apps', 'web', 'src', 'components', 'photo', 'PhotoJournal.tsx'
  );
  const translations = readRepoFile(
    'apps', 'web', 'src', 'lib', 'i18n', 'translations.ts'
  );
  const homePage = readRepoFile('apps', 'web', 'src', 'app', 'page.tsx');
  const photoDatePage = readRepoFile(
    'apps', 'web', 'src', 'app', 'photo', '[date]', 'page.tsx'
  );

  it('PhotoJournal accepts prevPhotoDate and nextPhotoDate props', () => {
    expect(photoJournal).toContain('prevPhotoDate');
    expect(photoJournal).toContain('nextPhotoDate');
  });

  it('PhotoJournal renders links to /photo/ for navigation', () => {
    expect(photoJournal).toContain('/photo/');
    expect(photoJournal).toContain('prevPhotoDate');
    expect(photoJournal).toContain('nextPhotoDate');
  });

  it('PhotoJournal uses ArrowLeftIcon for previous navigation', () => {
    expect(photoJournal).toContain('ArrowLeftIcon');
  });

  it('PhotoJournal no longer links to /archive for the main navigation action', () => {
    // The "expandArchive" link should be replaced with prev/next navigation
    expect(photoJournal).not.toContain('t.photo.expandArchive');
  });

  it('translations include prevPhoto and nextPhoto keys', () => {
    expect(translations).toContain('prevPhoto');
    expect(translations).toContain('nextPhoto');
  });

  it('home page passes prevPhotoDate to PhotoJournal', () => {
    expect(homePage).toContain('prevPhotoDate');
  });

  it('photo/[date] page passes prevPhotoDate and nextPhotoDate', () => {
    expect(photoDatePage).toContain('prevPhotoDate');
    expect(photoDatePage).toContain('nextPhotoDate');
  });
});
