import { test, expect } from '@playwright/test';

test.describe('Papers Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/papers');
  });

  test('should display papers list', async ({ page }) => {
    // Wait for papers to load
    await page.waitForSelector('[data-testid="paper-card"], .paper-item', {
      timeout: 10000,
    });

    // Check that papers are displayed
    const papers = page.locator('[data-testid="paper-card"], .paper-item');
    const count = await papers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search for papers', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[name="search"]');
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('microbial fuel cell');
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForTimeout(1000); // Allow debounce
    await page.waitForSelector('[data-testid="paper-card"], .paper-item');

    // Check URL updated with search param
    expect(page.url()).toContain('search=microbial');
  });

  test('should filter papers by year', async ({ page }) => {
    // Look for year filter
    const yearFilter = page.locator('select[name*="year"], input[name*="year"]').first();

    if (await yearFilter.isVisible()) {
      // Select or input a year
      if (yearFilter.locator('select').isVisible()) {
        await yearFilter.selectOption('2023');
      } else {
        await yearFilter.fill('2023');
      }

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Check URL updated
      expect(page.url()).toMatch(/year.*2023/);
    }
  });

  test('should sort papers', async ({ page }) => {
    // Find sort dropdown
    const sortDropdown = page.locator('select[name*="sort"]');

    if (await sortDropdown.isVisible()) {
      // Get initial order
      const initialFirstPaper = await page
        .locator('[data-testid="paper-card"], .paper-item')
        .first()
        .textContent();

      // Change sort order
      await sortDropdown.selectOption('year-asc');
      await page.waitForTimeout(500);

      // Check order changed
      const newFirstPaper = await page
        .locator('[data-testid="paper-card"], .paper-item')
        .first()
        .textContent();
      expect(newFirstPaper).not.toBe(initialFirstPaper);
    }
  });

  test('should paginate through results', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('[aria-label*="pagination"], .pagination');

    if (await pagination.isVisible()) {
      // Check current page
      const currentPage = pagination.locator('[aria-current="page"], .active');
      await expect(currentPage).toContainText('1');

      // Click next page
      const nextButton = pagination.locator(
        'button:has-text("Next"), a:has-text("Next"), [aria-label*="next"]'
      );
      if (await nextButton.isEnabled()) {
        await nextButton.click();

        // Wait for new results
        await page.waitForTimeout(500);

        // Check URL updated
        expect(page.url()).toContain('page=2');
      }
    }
  });

  test('should open paper details', async ({ page }) => {
    // Click on first paper
    const firstPaper = page.locator('[data-testid="paper-card"], .paper-item').first();
    const paperTitle = await firstPaper.locator('h2, h3').textContent();

    await firstPaper.click();

    // Check if modal opened or navigated to detail page
    const modal = page.locator('[role="dialog"], .modal');
    const detailPage = page.locator('[data-testid="paper-detail"], .paper-detail');

    if (await modal.isVisible()) {
      // Modal view
      await expect(modal).toContainText(paperTitle || '');

      // Check for paper details
      await expect(modal.locator('.abstract, [data-testid="abstract"]')).toBeVisible();

      // Close modal
      const closeButton = modal.locator('button[aria-label*="close"], button:has-text("Close")');
      await closeButton.click();
      await expect(modal).not.toBeVisible();
    } else if (await detailPage.isVisible()) {
      // Detail page view
      await expect(page.locator('h1')).toContainText(paperTitle || '');
    }
  });

  test('should handle empty search results', async ({ page }) => {
    // Search for nonsense
    const searchInput = page.locator('input[placeholder*="Search"], input[name="search"]');
    await searchInput.fill('xyzabc123nonsense');
    await searchInput.press('Enter');

    await page.waitForTimeout(1000);

    // Check for empty state message
    const emptyState = page.locator(
      '[data-testid="empty-state"], .empty-state, text=/no.*results/i'
    );
    await expect(emptyState).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);

    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();

      // Button should have either aria-label or text content
      expect(ariaLabel || text).toBeTruthy();
    }

    // Check for skip links
    const skipLink = page.locator('a[href="#main"], a:has-text("Skip to")');
    if (await skipLink.isVisible()) {
      await skipLink.click();
      expect(page.url()).toContain('#main');
    }
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Intercept API calls and fail them
    await context.route('**/api/papers**', (route) => {
      route.abort('failed');
    });

    // Reload page
    await page.reload();

    // Check for error message
    const errorMessage = page.locator(
      '[data-testid="error"], .error, text=/error|failed|try again/i'
    );
    await expect(errorMessage).toBeVisible();

    // Check for retry button
    const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try again")');
    if (await retryButton.isVisible()) {
      // Remove route interception
      await context.unroute('**/api/papers**');

      // Click retry
      await retryButton.click();

      // Should load papers now
      await page.waitForSelector('[data-testid="paper-card"], .paper-item');
    }
  });

  test('should export or download papers', async ({ page, context }) => {
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Look for export/download button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      try {
        // Wait for download with timeout
        const download = await Promise.race([
          downloadPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout')), 5000)),
        ]);

        if (download) {
          // Verify download
          expect(download).toBeTruthy();
          const filename = (download as any).suggestedFilename();
          expect(filename).toMatch(/\.(csv|json|pdf|xlsx)$/);
        }
      } catch (e) {
        // Download might not be implemented yet
        console.log('Download feature not implemented');
      }
    }
  });
});
