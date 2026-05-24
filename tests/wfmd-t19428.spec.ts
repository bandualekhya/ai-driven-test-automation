import { test, expect } from '@playwright/test';

/**
 * WFMD-T19428 - Testing
 * Steps: Add 5 random products to cart → remove out-of-stock item →
 *        verify final price calculation → take screenshot if mismatch found
 * URL: https://automationexercise.com
 */

const BASE_URL = 'https://automationexercise.com';

test.describe('WFMD-T19428 - Cart workflow with price validation', () => {
  test('Add 5 products → remove item → verify price calculation', async ({ page }) => {
    // Navigate to products page
    await page.goto(`${BASE_URL}/products`);
    await expect(page.locator('.features_items')).toBeVisible();

    // Remove ad overlays that block interactions
    await page.evaluate(() => {
      document.querySelectorAll('.adsbygoogle, ins.adsbygoogle, iframe[id^="aswift"]').forEach(el => el.remove());
    });

    // Add 5 products to cart
    const addToCartButtons = page.locator('.productinfo .add-to-cart');
    const productIndices = [0, 1, 2, 3, 4];

    for (const index of productIndices) {
      await addToCartButtons.nth(index).click();
      await page.locator('#cartModal').waitFor({ state: 'visible' });
      await page.locator('#cartModal .btn-success').click();
      await page.locator('#cartModal').waitFor({ state: 'hidden' });
    }

    // Navigate to cart
    await page.goto(`${BASE_URL}/view_cart`);
    await expect(page.locator('#cart_info_table')).toBeVisible();

    // Verify 5 items in cart
    const cartRows = page.locator('#cart_info_table tbody tr');
    await expect(cartRows).toHaveCount(5);

    // Remove first item (simulating out-of-stock removal)
    await cartRows.first().locator('.cart_quantity_delete a').click();
    await expect(cartRows).toHaveCount(4);

    // Verify final price calculation
    const remainingRows = page.locator('#cart_info_table tbody tr');
    const rowCount = await remainingRows.count();

    let allPricesMatch = true;
    for (let i = 0; i < rowCount; i++) {
      const row = remainingRows.nth(i);
      const priceText = await row.locator('.cart_price p').textContent();
      const qtyText = await row.locator('.cart_quantity button').textContent();
      const totalText = await row.locator('.cart_total p').textContent();

      const price = parseInt(priceText?.replace(/[^0-9]/g, '') || '0');
      const qty = parseInt(qtyText?.trim() || '1');
      const total = parseInt(totalText?.replace(/[^0-9]/g, '') || '0');

      if (price * qty !== total) {
        allPricesMatch = false;
      }
    }

    // Take screenshot if mismatch found
    if (!allPricesMatch) {
      await page.screenshot({
        path: 'test-results/wfmd-t19428-price-mismatch.png',
        fullPage: true,
      });
    }

    expect(allPricesMatch, 'Price calculation mismatch detected').toBe(true);
  });
});
