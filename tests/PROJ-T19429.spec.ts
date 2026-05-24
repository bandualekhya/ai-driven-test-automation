import { test, expect } from '@playwright/test';

/**
 * Test Case: PROJ-T19429
 * Title: SauceDemo - Login and Add to Cart E2E
 * Objective: Verify user can login, add products to cart, and complete checkout on SauceDemo
 * Precondition: Browser is open. User has valid credentials: standard_user / secret_sauce
 */
test.describe('WFMD-T19429: SauceDemo - Login and Add to Cart E2E', () => {

  test('Complete E2E flow: login, add to cart, checkout', async ({ page }) => {
    // Step 1: Navigate to SauceDemo
    await page.goto('https://www.saucedemo.com');
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();

    // Step 2: Enter username and password, click Login
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');

    // Step 3: Add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // Step 4: Click the cart icon to view cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);
    await expect(page.locator('[data-test="inventory-item-name"]').nth(0)).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('[data-test="inventory-item-name"]').nth(1)).toHaveText('Sauce Labs Bike Light');

    // Step 5: Click 'Checkout' button
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Step 6: Fill in checkout information and click Continue
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.locator('[data-test="lastName"]').fill('User');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    // Step 7: Verify total price calculation
    const itemTotal = await page.locator('[data-test="subtotal-label"]').textContent();
    expect(itemTotal).toContain('$39.98');
    const tax = await page.locator('[data-test="tax-label"]').textContent();
    expect(tax).toContain('$3.20');
    const total = await page.locator('[data-test="total-label"]').textContent();
    expect(total).toContain('$43.18');

    // Step 8: Click 'Finish' to complete order
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});
