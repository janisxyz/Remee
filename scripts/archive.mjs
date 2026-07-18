import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'snapshot');
const ASSETS = path.join(OUT, 'assets');
const SOURCES = [
  'https://www.remee.me/',
  'https://sleepwithremee.com/config.php',
];

const textTypes = [
  'text/',
  'application/javascript',
  'application/x-javascript',
  'application/json',
  'application/xml',
  'image/svg+xml',
];

function safeSegment(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '') || 'index';
}

function extensionFromType(type) {
  if (type.includes('javascript')) return '.js';
  if (type.includes('text/css')) return '.css';
  if (type.includes('text/html')) return '.html';
  if (type.includes('application/json')) return '.json';
  if (type.includes('image/svg')) return '.svg';
  if (type.includes('image/png')) return '.png';
  if (type.includes('image/jpeg')) return '.jpg';
  if (type.includes('image/webp')) return '.webp';
  if (type.includes('font/woff2')) return '.woff2';
  if (type.includes('font/woff')) return '.woff';
  return '';
}

function localPathFor(urlString, contentType = '') {
  const url = new URL(urlString);
  const host = safeSegment(url.host);
  const parts = url.pathname.split('/').filter(Boolean).map(safeSegment);
  let file = parts.pop() || 'index';
  if (!path.extname(file)) file += extensionFromType(contentType);
  if (url.search) {
    const suffix = createHash('sha1').update(url.search).digest('hex').slice(0, 10);
    const ext = path.extname(file);
    file = `${path.basename(file, ext)}.${suffix}${ext}`;
  }
  return path.join(ASSETS, host, ...parts, file);
}

function relativeWebPath(fromFile, toFile) {
  return path.relative(path.dirname(fromFile), toFile).split(path.sep).join('/');
}

function isText(contentType, filePath) {
  return textTypes.some((prefix) => contentType.includes(prefix)) || /\.(?:html?|css|js|mjs|json|xml|svg|txt)$/i.test(filePath);
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(ASSETS, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'en-US',
    timezoneId: 'Europe/Zurich',
    serviceWorkers: 'block',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const page = await context.newPage();
  const captured = new Map();
  const pending = [];

  page.on('response', (response) => {
    const task = (async () => {
      const url = response.url();
      if (!/^https?:/i.test(url)) return;
      if (response.status() < 200 || response.status() >= 400) return;

      const contentType = (response.headers()['content-type'] || '').split(';')[0].trim().toLowerCase();
      let body;
      try {
        body = await response.body();
      } catch {
        return;
      }

      const filePath = localPathFor(url, contentType);
      captured.set(url, { url, contentType, filePath, body });
    })();
    pending.push(task);
  });

  let loadedSource = null;
  let lastError = null;

  for (const source of SOURCES) {
    try {
      await page.goto(source, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(5_000);

      const deadline = Date.now() + 75_000;
      while (Date.now() < deadline) {
        const text = await page.locator('body').innerText().catch(() => '');
        if (/Customize your dream signal/i.test(text) && /Update!/i.test(text)) {
          loadedSource = page.url();
          break;
        }
        await page.waitForTimeout(2_000);
      }

      if (loadedSource) break;
      lastError = new Error(`The customization interface did not load from ${source}`);
    } catch (error) {
      lastError = error;
    }
  }

  await page.waitForTimeout(2_000);
  await Promise.allSettled(pending);

  const finalUrl = page.url();
  const htmlPath = path.join(OUT, 'index.html');
  let html = await page.content();

  if (!loadedSource) {
    await writeFile(htmlPath, html, 'utf8');
    await page.screenshot({ path: path.join(OUT, 'capture-failed.png'), fullPage: true }).catch(() => {});
    await writeFile(
      path.join(OUT, 'FAILED.txt'),
      `Remee customization interface was not captured.\nFinal URL: ${finalUrl}\nError: ${lastError?.stack || lastError || 'Unknown error'}\n`,
      'utf8',
    );
    await browser.close();
    throw lastError || new Error('Remee customization interface was not captured');
  }

  const mappings = new Map();
  for (const item of captured.values()) {
    mappings.set(item.url, relativeWebPath(htmlPath, item.filePath));
  }

  const finalOrigin = new URL(loadedSource).origin;

  function rewriteText(text, currentFile, baseUrl) {
    let output = text;
    const entries = [...captured.values()].sort((a, b) => b.url.length - a.url.length);

    for (const item of entries) {
      const replacement = relativeWebPath(currentFile, item.filePath);
      output = output.split(item.url).join(replacement);
    }

    output = output.replace(/(["'(=\s])\/(?!\/)([^"'()\s<>]+)/g, (match, prefix, rest) => {
      try {
        const absolute = new URL(`/${rest}`, baseUrl).href;
        const item = captured.get(absolute);
        if (!item) return match;
        return `${prefix}${relativeWebPath(currentFile, item.filePath)}`;
      } catch {
        return match;
      }
    });

    output = output.split(finalOrigin).join('.');
    return output;
  }

  for (const item of captured.values()) {
    await mkdir(path.dirname(item.filePath), { recursive: true });
    if (isText(item.contentType, item.filePath)) {
      const text = item.body.toString('utf8');
      await writeFile(item.filePath, rewriteText(text, item.filePath, item.url), 'utf8');
    } else {
      await writeFile(item.filePath, item.body);
    }
  }

  html = rewriteText(html, htmlPath, loadedSource);
  html = html.replace(/<base\b[^>]*>/gi, '');
  html = html.replace(
    /<head([^>]*)>/i,
    `<head$1>\n<meta name="remee-archive-source" content="${loadedSource}">\n<meta name="remee-archive-date" content="${new Date().toISOString()}">`,
  );
  await writeFile(htmlPath, html, 'utf8');

  const manifest = {
    archivedAt: new Date().toISOString(),
    source: loadedSource,
    finalUrl,
    files: [...captured.values()].map((item) => ({
      url: item.url,
      path: path.relative(OUT, item.filePath).split(path.sep).join('/'),
      contentType: item.contentType,
      bytes: item.body.length,
    })),
  };

  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  await writeFile(
    path.join(OUT, 'README.txt'),
    `Archived Remee programmer\nSource: ${loadedSource}\nCaptured: ${manifest.archivedAt}\n\nServe this directory over HTTP. Example:\npython3 -m http.server 8080\n`,
    'utf8',
  );

  await page.screenshot({ path: path.join(OUT, 'preview.png'), fullPage: true }).catch(() => {});
  await browser.close();

  const savedIndex = await readFile(htmlPath, 'utf8');
  if (!/Customize your dream signal/i.test(savedIndex)) {
    throw new Error('Archive validation failed: expected interface text is missing');
  }

  console.log(`Archived ${captured.size} browser resources from ${loadedSource}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
