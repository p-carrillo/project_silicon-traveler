import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('Spec: Mobile Hamburger Menu', () => {
  const mobileMenuPath = path.join(
    repoRoot, 'apps', 'web', 'src', 'components', 'layout', 'MobileMenu.tsx'
  );
  const topBar = readRepoFile(
    'apps', 'web', 'src', 'components', 'layout', 'SectionTopBar.tsx'
  );

  it('MobileMenu component file exists', () => {
    expect(existsSync(mobileMenuPath)).toBe(true);
  });

  it('MobileMenu is a client component', () => {
    const mobileMenu = readFileSync(mobileMenuPath, 'utf8');
    expect(mobileMenu).toContain("'use client'");
  });

  it('MobileMenu uses Bars3Icon for hamburger', () => {
    const mobileMenu = readFileSync(mobileMenuPath, 'utf8');
    expect(mobileMenu).toContain('Bars3Icon');
  });

  it('MobileMenu uses XMarkIcon for close', () => {
    const mobileMenu = readFileSync(mobileMenuPath, 'utf8');
    expect(mobileMenu).toContain('XMarkIcon');
  });

  it('MobileMenu is hidden on md+ screens', () => {
    const mobileMenu = readFileSync(mobileMenuPath, 'utf8');
    expect(mobileMenu).toContain('md:hidden');
  });

  it('SectionTopBar imports and renders MobileMenu', () => {
    expect(topBar).toContain('MobileMenu');
    expect(topBar).toContain("from '@/components/layout/MobileMenu'");
  });

  it('SectionTopBar remains a server component (no use client)', () => {
    expect(topBar).not.toContain("'use client'");
    expect(topBar).not.toContain('"use client"');
  });
});
