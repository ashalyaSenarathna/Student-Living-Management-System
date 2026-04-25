const { test, expect } = require('@playwright/test');

test.describe('Hostel Management', () => {
  test('should display hostels and boardings list', async ({ page }) => {
    await page.goto('/hostel');
    
    // Check header
    const header = page.locator('h1');
    await expect(header).toContainText('Hostels & Boardings');
    
    // Check for filter buttons
    const filterGroup = page.locator('.filter-group');
    await expect(filterGroup).toBeVisible();
    await expect(filterGroup.locator('button')).toHaveCount(3);
  });

  test('should search for hostels', async ({ page }) => {
    await page.goto('/hostel');
    
    const searchInput = page.locator('input[placeholder="Search by name or location..."]');
    await searchInput.fill('Colombo');
    
    // Check if the grid is present
    await expect(page.locator('.hostel-grid')).toBeVisible();
  });
});
