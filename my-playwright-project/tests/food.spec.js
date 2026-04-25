const { test, expect } = require('@playwright/test');

test.describe('Food Management', () => {
  test('should display food and dining list', async ({ page }) => {
    await page.goto('/food');
    
    // Check header
    const header = page.locator('h1');
    await expect(header).toContainText('Food & Dining');
    
    // Check for "Browse Food" tab
    const browseTab = page.locator('.food-nav-tab.active');
    await expect(browseTab).toContainText('Browse Food');
  });

  test('should be able to search for restaurants', async ({ page }) => {
    await page.goto('/food');
    
    const searchInput = page.locator('input[placeholder="Search restaurants or cuisine..."]');
    await searchInput.fill('Canteen');
    
    // Check if the grid is still visible after filtering
    await expect(page.locator('.food-grid')).toBeVisible();
  });
});
