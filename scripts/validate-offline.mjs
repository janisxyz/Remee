import { chromium } from 'playwright';
import { createReadStream } from 'node:fs';
import { access, readFile, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const snapshotDir = path.join(root, 'snapshot');
const port = 4173;
const origin = `http://127.0.0.1:${port}`;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', origin);
    let pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname === '/') pathname = '/index.html';

    const filePath = path.resolve(snapshotDir, `.${pathname}`);
    if (!filePath.startsWith(`${snapshotDir}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('Not a file');

    response.writeHead(200, {
      'content-type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, '127.0.0.1', resolve);
});

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const externalRequests = [];
const pageErrors = [];

await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== origin) {
    externalRequests.push(url.href);
    await route.abort();
    return;
  }
  await route.continue();
});

page.on('pageerror', (error) => pageErrors.push(error.stack || error.message));

let result;
try {
  await page.goto(origin, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForSelector('#update_button', { state: 'visible', timeout: 10_000 });

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
  if (!initial.hasBlinker || !initial.hasSequence) throw new Error('Blinker encoder did not initialize');
  if (!initial.updateLabel?.includes('Update')) throw new Error('Update control did not initialize');
  if (initial.brokenImages.length) throw new Error(`Broken local images: ${initial.brokenImages.join(', ')}`);

  const sequence = await page.evaluate(() => window.Blinker.sequence());
  if (!/^[01]{72}$/.test(sequence)) throw new Error(`Unexpected encoded sequence: ${sequence}`);
  if (!sequence.startsWith('11010010')) throw new Error('Handshake bits are incorrect');

  await page.click('#update_button');
  await page.waitForFunction(() => {
    const clock = document.querySelector('#blinker_clock');
    const data = document.querySelector('#blinker_data');
    return clock && data && getComputedStyle(clock).display !== 'none' && getComputedStyle(data).display !== 'none';
  }, { timeout: 8_000 });

  await page.waitForFunction(() => {
    const message = document.querySelector('#blinker_info .post_message');
    return message && getComputedStyle(message).display !== 'none';
  }, { timeout: 22_000 });

  if (pageErrors.length) throw new Error(`Browser errors: ${pageErrors.join('\n')}`);
  if (externalRequests.length) throw new Error(`External requests attempted: ${externalRequests.join(', ')}`);

  result = {
    validatedAt: new Date().toISOString(),
    title: initial.title,
    sequenceBits: sequence.length,
    handshake: sequence.slice(0, 8),
    transmissionCompleted: true,
    externalRequests: 0,
    pageErrors: 0,
  };

  await page.screenshot({ path: path.join(snapshotDir, 'offline-validation.png'), fullPage: true });
  await writeFile(path.join(snapshotDir, 'validation.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

await access(path.join(snapshotDir, 'validation.json'));
const saved = JSON.parse(await readFile(path.join(snapshotDir, 'validation.json'), 'utf8'));
if (!saved.transmissionCompleted) process.exitCode = 1;
