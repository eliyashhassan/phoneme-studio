import { test, expect } from '@playwright/test';

test('Dashboard loads successfully', async ({ page }) => {
  await page.goto('http://localhost:3001/dashboard');
  await expect(page.getByText('Total Activities')).toBeVisible();
  await expect(page.getByText('Data Quality Alerts')).toBeVisible();
});

test('Wordle builder loads', async ({ page }) => {
  await page.goto('http://localhost:3001/wordle');
  await expect(page.locator('body')).toContainText(/wordle/i);
});

test('Word Search builder loads', async ({ page }) => {
  await page.goto('http://localhost:3001/word-search');
  await expect(page.locator('body')).toContainText(/word search/i);
});

test('Metrics API returns records', async ({ request }) => {
  const response = await request.get('http://localhost:3001/api/metrics');
  expect(response.ok()).toBeTruthy();
  expect(Array.isArray(await response.json())).toBeTruthy();
});
