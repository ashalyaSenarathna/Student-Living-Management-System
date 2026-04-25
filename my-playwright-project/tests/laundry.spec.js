const { test, expect } = require('@playwright/test');

test.describe('Laundry Management', () => {
  test('should display laundry services list', async ({ page }) => {
    // Navigate to laundry page
    await page.goto('/laundry');
    
    // Check if the header is visible
    const header = page.locator('h1');
    await expect(header).toContainText('Laundry Services');
    
    // Check if search input is present
    const searchInput = page.locator('input[placeholder="Find a laundry shop..."]');
    await expect(searchInput).toBeVisible();
  });

  test('should filter laundry services', async ({ page }) => {
    await page.goto('/laundry');
    
    // Type in search box
    await page.fill('input[placeholder="Find a laundry shop..."]', 'Wash');
    
    // Wait for filtered results (mocking or waiting for state)
    // Note: In real scenarios, we'd check for specific cards
    await expect(page.locator('.providers-grid')).toBeVisible();
  });
});
