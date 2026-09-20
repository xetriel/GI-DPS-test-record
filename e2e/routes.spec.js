import { test, expect } from '@playwright/test';

// Curated set of top-level application routes for GenshinDPS.
// The app uses HashRouter, so every URL is `/#/path`.
// Each case defines the route hash, the resolved target URL, and an optional heading.
const routes = [
  { hash: '#/runs', expectedUrl: '#/runs', heading: /DPS Runs Archive/i },
  { hash: '#/dashboard', expectedUrl: '#/dashboard', heading: /GenshinDPS Combat Analytics/i },
  { hash: '#/upload', expectedUrl: '#/upload', heading: /Screenshot Ingestion/i },
  { hash: '#/analytics', expectedUrl: '#/analytics', heading: /Cross-Run Combat Analytics/i },
  { hash: '#/characters', expectedUrl: '#/characters', heading: /Character Substats/i },
  { hash: '#/settings', expectedUrl: '#/settings', heading: /Database & Relational Storage/i },
  // Root route redirects to /runs
  { hash: '#/', expectedUrl: '#/runs', heading: /DPS Runs Archive/i },
];

for (const route of routes) {
  test(`route renders without console errors: ${route.hash}`, async ({ page }) => {
    const errors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto(`/${route.hash}`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(
      new RegExp(`${(route.expectedUrl || route.hash).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    );
    await expect(page.getByTestId('app-shell')).toBeVisible({ timeout: 15_000 });

    if (route.heading) {
      await expect(page.getByRole('heading', { name: route.heading })).toBeVisible({
        timeout: 10_000,
      });
    }

    const hardErrors = errors.filter((e) =>
      /Element type is invalid|Cannot read|is not a (constructor|function)|ChunkLoadError/i.test(e)
    );

    expect(pageErrors, `Page errors: ${pageErrors.join('\n')}`).toHaveLength(0);
    expect(hardErrors, `Hard console errors: ${hardErrors.join('\n')}`).toHaveLength(0);
  });
}
