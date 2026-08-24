const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:4173/discovery-round3/human-test.html';

test.beforeEach(async ({ page }) => {
  await page.route('**/functions/v1/submit-discovery-human-test', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto(URL);
  await expect(page.getByRole('heading', { name: 'Discovery Round 3' })).toBeVisible();
});

test('split assets load and normal concern route advances', async ({ page }) => {
  await expect(page.locator('link[href="./human-test.css"]')).toHaveCount(1);
  await expect(page.locator('script[src="./human-test.js"]')).toHaveCount(1);

  const happy = page.getByRole('button', { name: /happy with where i am/i });
  const choices = page.locator('.options .opt');
  const count = await choices.count();
  let normalChoice = null;
  for (let i = 0; i < count; i++) {
    const button = choices.nth(i);
    if (!(await button.innerText()).toLowerCase().includes('happy with where i am')) {
      normalChoice = button;
      break;
    }
  }
  expect(normalChoice).not.toBeNull();
  await normalChoice.click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('#app')).not.toContainText('Assessment error');
  await expect(page.locator('#app')).not.toContainText('Assessment paused');
  await expect(happy).toHaveCount(0);
});

test('happy route can submit and restart', async ({ page }) => {
  await page.getByRole('button', { name: /happy with where i am/i }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(/delighted|direction|happy/i).first()).toBeVisible();

  const capability = page.locator('.options .opt').first();
  await capability.click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('button', { name: 'Submit test' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit test' }).click();
  await expect(page.getByText('Thank you for testing.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restart test' })).toBeVisible();

  await page.getByRole('button', { name: 'Restart test' }).click();
  await expect(page.getByRole('heading', { name: 'Discovery Round 3' })).toBeVisible();
  await expect(page.getByRole('button', { name: /happy with where i am/i })).toBeVisible();
});
