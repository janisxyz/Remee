import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const siteUrl = process.env.SITE_URL || 'https://janisxyz.github.io/Remee/';
const statusPath = path.join(process.cwd(), 'status', 'pages-browser-live.json');
const target = new URL(siteUrl);
target.searchParams.set('smoke', process.env.GITHUB_RUN_ID || String(Date.now()));

await mkdir(path.dirname(statusPath), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const siteOrigin = new URL(siteUrl).origin;
const externalRequests = [];
const pageErrors = [];
const failedRequests = [];
let result;

await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== siteOrigin) {
    externalRequests.push(url.href);
    await route.abort();
    return;
  }
  await route.continue();
});

page.on('pageerror', (error) => pageErrors.push(error.stack || error.message));
page.on('requestfailed', (request) => {
  if (new URL(request.url()).origin === siteOrigin) {
    failedRequests.push(`${request.url()}: ${request.failure()?.errorText || 'failed'}`);
  }
});

try {
  let loaded = false;
  let lastError = null;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const attemptUrl = new URL(target);
      attemptUrl.searchParams.set('attempt', String(attempt));
      await page.goto(attemptUrl.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForSelector('#update_button', { state: 'visible', timeout: 15_000 });
      loaded = true;
      break;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(10_000);
    }
  }
  if (!loaded) throw lastError || new Error('Live Remee interface did not load');

  await page.waitForTimeout(500);
  const initial = await page.evaluate(() => ({
    title: document.title,
    hasBlinker: typeof window.Blinker === 'object',
    hasSequence: typeof window.Blinker?.sequence === 'function',
    updateLabel: document.querySelector('#update_button')?.textContent?.trim(),
    brokenImages: [...document.images]
      .filter((image) => image.src && (!image.complete || image.naturalWidth === 0))
      .map((image) => image.getAttribute('src')),
  }));

  if (initial.title !== 'Remee Customization App') throw new Error(`Unexpected title: ${initial.title}`);
  if (!initial.hasBlinker || !initial.hasSequence) throw new Error('Live Blinker encoder did not initialize');
  if (!initial.updateLabel?.includes('Update')) throw new Error('Live Update control did not initialize');
  if (initial.brokenImages.length) throw new Error(`Broken live images: ${initial.brokenImages.join(', ')}`);

  const sequence = await page.evaluate(() => window.Blinker.sequence());
  if (!/^[01]{72}$/.test(sequence)) throw new Error(`Unexpected live encoded sequence: ${sequence}`);
  if (!sequence.startsWith('11010010')) throw new Error('Live handshake bits are incorrect');

  await page.click('#update_button');
  await page.waitForFunction(() => (
    typeof window.sequence === 'string' &&
    /^[01]{72}$/.test(window.sequence) &&
    window.sequence_timer !== null
  ), { timeout: 5_000 });
  await page.waitForFunction(() => Number(window.sequence_index) > 0, { timeout: 9_000 });

  const firstObservedSequenceIndex = await page.evaluate(() => Number(window.sequence_index));
  await page.waitForFunction(() => (
    window.sequence_timer === null &&
    Number(window.sequence_index) === window.sequence?.length
  ), { timeout: 20_000 });

  if (pageErrors.length) throw new Error(`Live browser errors: ${pageErrors.join('\n')}`);
  if (externalRequests.length) throw new Error(`Live external requests attempted: ${externalRequests.join(', ')}`);
  if (failedRequests.length) throw new Error(`Live local requests failed: ${failedRequests.join(', ')}`);

  result = {
    checkedAt: new Date().toISOString(),
    siteUrl,
    finalUrl: page.url(),
    title: initial.title,
    httpAndInterfaceLoaded: true,
    sequenceBits: sequence.length,
    handshake: sequence.slice(0, 8),
    updateButtonTriggered: true,
    firstObservedSequenceIndex,
    transmissionCompleted: true,
    brokenImages: 0,
    externalRequests: 0,
    pageErrors: 0,
    failedRequests: 0,
  };
} catch (error) {
  result = {
    checkedAt: new Date().toISOString(),
    siteUrl,
    finalUrl: page.url(),
    success: false,
    error: error.stack || error.message,
    externalRequests,
    pageErrors,
    failedRequests,
  };
  throw error;
} finally {
  await writeFile(statusPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  await page.screenshot({ path: path.join(process.cwd(), 'status', 'pages-browser-live.png'), fullPage: true }).catch(() => {});
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
}
