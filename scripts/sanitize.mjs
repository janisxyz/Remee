import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const snapshot = path.join(root, 'snapshot');
const capturedPage = path.join(snapshot, 'assets', 'www.sleepwithremee.com', 'config.php');
const indexPath = path.join(snapshot, 'index.html');
const shimPath = path.join(root, 'scripts', 'offline-shim.js');
const analyticsPath = path.join(snapshot, 'assets', 'www.google-analytics.com', 'ga.js');
const sourceRoot = path.join(snapshot, 'assets', 'www.sleepwithremee.com');

await access(capturedPage);
await access(shimPath);

const shim = await readFile(shimPath, 'utf8');
const loader = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Loading Remee Programmer</title>
</head>
<body>
  <p id="status">Loading the archived Remee programmer…</p>
  <script>
    (async () => {
      const source = new URL('./assets/www.sleepwithremee.com/config.php', location.href);
      const assetBase = new URL('./assets/www.sleepwithremee.com/', location.href);
      const shim = new URL('./assets/www.google-analytics.com/ga.js', location.href);
      const response = await fetch(source, { cache: 'no-store' });
      if (!response.ok) throw new Error(\`Could not load archived programmer: HTTP \${response.status}\`);

      let html = await response.text();
      html = html
        .replace(/\\.\\.\\/img\\//g, 'img/')
        .replace(/href=["']favicon\\.png["']/gi, 'href="img/logo.png"');
      html = html.replace(
        /<head([^>]*)>/i,
        \`<head$1><base href="\${assetBase.href}"><script src="\${shim.href}"><\\/script>\`,
      );

      document.open();
      document.write(html);
      document.close();
    })().catch((error) => {
      document.getElementById('status').textContent = error.message;
      console.error(error);
    });
  </script>
</body>
</html>
`;

await mkdir(path.dirname(analyticsPath), { recursive: true });
await mkdir(sourceRoot, { recursive: true });
await writeFile(analyticsPath, shim, 'utf8');
await writeFile(indexPath, loader, 'utf8');
await writeFile(path.join(snapshot, '404.html'), loader, 'utf8');
await writeFile(path.join(snapshot, '.nojekyll'), '', 'utf8');
await writeFile(path.join(sourceRoot, 'json_user_info.php'), '{"logged_in":false}\n', 'utf8');
await writeFile(path.join(sourceRoot, 'get_short_url.php'), '{"success":false}\n', 'utf8');

console.log('Built pristine standalone Remee programmer entry point.');
