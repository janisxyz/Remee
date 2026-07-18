# Remee Programmer Archive

Offline preservation project for the Remee lucid-dream mask web programmer.

The repository uses Playwright in GitHub Actions to open the live Remee programmer in a real Chromium browser, capture the browser-delivered HTML, JavaScript, CSS, fonts and images, rewrite captured URLs to local files, and commit the resulting snapshot into `snapshot/`.

## Use the archived programmer

After `snapshot/` has been generated:

```bash
cd snapshot && python3 -m http.server 8080
```

Open `http://localhost:8080` in a Chromium-based browser, set the display to maximum brightness, disable night-light and adaptive-brightness features, then program Remee normally.

## Refresh the archive

Run the `Archive Remee programmer` GitHub Action manually, or update the archiver files. The action captures from these sources in order:

1. `https://www.remee.me/`
2. `https://sleepwithremee.com/config.php`

The first source that loads the actual customization interface is preserved.

## Local capture

```bash
npm install
npx playwright install chromium
npm run archive
```

## Scope

This preserves everything delivered to a browser. PHP source code executed on Remee's server is not publicly downloadable and is not required for the client-side optical programmer. Account login and cloud-saved settings are outside the offline archive's scope.
