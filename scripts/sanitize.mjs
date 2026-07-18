import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const snapshot = path.join(root, 'snapshot');
const indexPath = path.join(snapshot, 'index.html');
const shimPath = path.join(root, 'scripts', 'offline-shim.js');
const analyticsPath = path.join(snapshot, 'assets', 'www.google-analytics.com', 'ga.js');

await access(indexPath);
await access(shimPath);

let html = await readFile(indexPath, 'utf8');
const shim = await readFile(shimPath, 'utf8');

html = html
  .replace(/(["'(=\s])(?:\.\.\/|\.\/|\/)img\//g, '$1assets/www.sleepwithremee.com/img/')
  .replace(/href=["']favicon\.png["']/gi, 'href="assets/www.sleepwithremee.com/img/logo.png"');

await mkdir(path.dirname(analyticsPath), { recursive: true });
await writeFile(analyticsPath, shim, 'utf8');
await writeFile(indexPath, html, 'utf8');
await writeFile(path.join(snapshot, '404.html'), html, 'utf8');
await writeFile(path.join(snapshot, '.nojekyll'), '', 'utf8');
await writeFile(path.join(snapshot, 'json_user_info.php'), '{"logged_in":false}\n', 'utf8');

console.log('Sanitized Remee snapshot for offline and GitHub Pages use.');
