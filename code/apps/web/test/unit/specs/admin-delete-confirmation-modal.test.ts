import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('Spec: Admin Delete Confirmation Modal', () => {
  const modalPath = path.join(
    repoRoot,
    'apps',
    'web',
    'src',
    'components',
    'admin',
    'AdminDeleteRoutePointButton.tsx'
  );

  it('AdminDeleteRoutePointButton component file exists', () => {
    expect(existsSync(modalPath)).toBe(true);
  });

  it('AdminDeleteRoutePointButton is a client component with dialog semantics', () => {
    const modalComponent = readFileSync(modalPath, 'utf8');

    expect(modalComponent).toContain("'use client'");
    expect(modalComponent).toContain('role="dialog"');
    expect(modalComponent).toContain('aria-modal="true"');
    expect(modalComponent).toContain('formAction={action}');
  });

  it('edit page uses the delete confirmation modal component', () => {
    const page = readRepoFile(
      'apps',
      'web',
      'src',
      'app',
      'admin',
      'route-points',
      '[id]',
      'page.tsx'
    );

    expect(page).toContain('AdminDeleteRoutePointButton');
    expect(page).toContain('deleteModal.title');
    expect(page).toContain('deleteModal.description');
    expect(page).toContain('deleteModal.confirm');
  });
});
