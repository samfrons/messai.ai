import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/MESSAI/);

    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('MESSAI');
  });

  test('should have navigation links', async ({ page }) => {
    // Check for navigation menu
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for essential navigation links
    const links = [
      { text: 'Papers', href: '/papers' },
      { text: 'Lab', href: '/lab' },
      { text: 'About', href: '/about' },
    ];

    for (const link of links) {
      const navLink = nav.locator(`a:has-text("${link.text}")`);
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveAttribute('href', link.href);
    }
  });

  test('should navigate to Papers page', async ({ page }) => {
    // Click on Papers link
    await page.click('nav a:has-text("Papers")');

    // Wait for navigation
    await page.waitForURL('/papers');

    // Check we're on the Papers page
    await expect(page.locator('h1')).toContainText(/Papers|Research/);
  });

  test('should be responsive', async ({ page, viewport }) => {
    // Test on different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Check main content is visible
      await expect(page.locator('main')).toBeVisible();

      // Mobile menu behavior
      if (vp.width < 768) {
        // Mobile menu should be present
        const menuButton = page.locator('button[aria-label*="menu"]');
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await expect(page.locator('nav')).toBeVisible();
        }
      }
    }
  });

  test('should handle dark mode toggle', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator(
      'button[aria-label*="theme"], button:has-text("Dark"), button:has-text("Light")'
    );

    if (await themeToggle.isVisible()) {
      // Get initial theme
      const htmlElement = page.locator('html');
      const initialTheme = await htmlElement.getAttribute('class');

      // Toggle theme
      await themeToggle.click();

      // Check theme changed
      const newTheme = await htmlElement.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out expected errors (like development mode warnings)
    const unexpectedErrors = consoleErrors.filter(
      (error) => !error.includes('Warning:') && !error.includes('DevTools')
    );

    expect(unexpectedErrors).toHaveLength(0);
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check essential meta tags
    const metaTags = {
      description: await page.getAttribute('meta[name="description"]', 'content'),
      viewport: await page.getAttribute('meta[name="viewport"]', 'content'),
    };

    expect(metaTags.description).toBeTruthy();
    expect(metaTags.viewport).toContain('width=device-width');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on the first interactive element
    await page.keyboard.press('Tab');

    // Get focused element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Tab through navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const element = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        text: document.activeElement?.textContent,
      }));

      // Ensure we're focusing on interactive elements
      expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(element.tag);
    }
  });
});
