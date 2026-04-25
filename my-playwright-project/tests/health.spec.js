const { test, expect } = require('@playwright/test');

test.describe('Health Management', () => {
  test('should display medical pharmacy panel', async ({ page }) => {
    // Note: This page might require login. 
    // In a full test suite, you would perform login in a global setup or before each test.
    await page.goto('/health/medical-panel');
    
    // If redirected to login, this test will fail as expected if not authenticated.
    // Assuming we are authenticated or testing the public view if any:
    const header = page.locator('h1');
    await expect(header).toContainText('Medical Pharmacy Panel');
    
    // Check for inventory section
    const inventoryHeader = page.locator('h2');
    await expect(inventoryHeader).toContainText('Available medicines and supplies');
  });

  test('should show cart count', async ({ page }) => {
    await page.goto('/health/medical-panel');
    
    const cartTrigger = page.locator('.medical-cart-trigger');
    await expect(cartTrigger).toBeVisible();
    await expect(cartTrigger.locator('strong')).toContainText('0');
  });
});
