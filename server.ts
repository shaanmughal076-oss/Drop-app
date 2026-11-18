import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.resolve(__dirname, 'dist');

app.disable('x-powered-by');

// Health & deployment verification endpoint for Google Cloud Run
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'venom-stone-drop-joya',
    appUrl:
      process.env.APP_URL ||
      'https://ais-pre-zzcpnloggrxeomltrq4uho-816539758515.asia-southeast1.run.app',
    timestamp: new Date().toISOString(),
  });
});

// Serve static production assets from dist/ with proper caching and PWA headers
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('sw.js') || filePath.endsWith('manifest.json') || filePath.endsWith('manifest.webmanifest')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }),
  );

  // SPA fallback so deep links never return 404 Page Not Found
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VENOM STONE COMPANY — DROP Server listening on http://0.0.0.0:${PORT}`);
});
