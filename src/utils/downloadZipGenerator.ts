import JSZip from 'jszip';
import {
  CAMPUS_ZONES,
  CampusMetrics,
  DropOrder,
  PUBLIC_SHARED_APP_URL,
} from '../domain/campusData';

export async function downloadDropWebsiteAsZip(
  orders: DropOrder[],
  metrics: CampusMetrics,
): Promise<{ filename: string; fileCount: number }> {
  const zip = new JSZip();
  const filename = 'DROP-VenomStone-WebApp.zip';

  const standaloneHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VENOM STONE COMPANY | DROP — Joya, Amroha</title>
  <link rel="manifest" href="manifest.json" />
  <style>
    :root { --gold: #d49b27; --emerald: #10b981; --ink: #0f172a; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; line-height: 1.6; padding: 2rem; }
    .container { max-width: 960px; margin: 0 auto; }
    header { border-bottom: 1px solid #334155; padding-bottom: 1.25rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    h1 { color: var(--gold); font-size: 1.5rem; letter-spacing: 0.04em; }
    .cta { background: var(--emerald); color: #022c22; padding: 0.65rem 1.25rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; }
    .card h3 { color: var(--gold); font-size: 1rem; margin-bottom: 0.35rem; }
    .stat { font-size: 1.5rem; font-weight: 700; color: var(--emerald); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>VENOM STONE COMPANY</h1>
        <p>3D Corporate Campus &amp; Open-Roof HQ · DROP — One App for Everything Local (Joya, Amroha)</p>
      </div>
      <a class="cta" href="${PUBLIC_SHARED_APP_URL}">Launch Live 3D Web App</a>
    </header>
    <div class="grid">
      <div class="card"><h3>Live Joya Orders</h3><div class="stat">${metrics.liveOrders}</div></div>
      <div class="card"><h3>Active EV Riders</h3><div class="stat">${metrics.activeRiders}</div></div>
      <div class="card"><h3>Joya Partner Stores</h3><div class="stat">${metrics.joyaMerchants}</div></div>
      <div class="card"><h3>Avg Delivery SLA</h3><div class="stat">${metrics.avgDeliveryMins} mins</div></div>
    </div>
    <h2 style="margin-bottom: 1rem; color: #e2e8f0;">Campus Architectural Wings</h2>
    <div class="grid">
      ${CAMPUS_ZONES.map(
        (z) =>
          `<div class="card"><h3>${z.title}</h3><p style="font-size:0.85rem;color:#cbd5e1;">${z.summary}</p></div>`,
      ).join('\n      ')}
    </div>
  </div>
</body>
</html>`;

  const manifestJson = JSON.stringify(
    {
      id: '/',
      name: 'VENOM STONE COMPANY | DROP — Joya, Amroha',
      short_name: 'DROP Joya',
      description:
        'VENOM STONE COMPANY — 3D Corporate Campus & Open-Roof HQ. DROP — One App for Everything Local (Joya, Amroha).',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#10b981',
    },
    null,
    2,
  );

  const blueprintJson = JSON.stringify(
    {
      company: 'VENOM STONE COMPANY',
      product: 'DROP — One App for Everything Local (Joya, Amroha)',
      liveUrl: PUBLIC_SHARED_APP_URL,
      exportedAt: new Date().toISOString(),
      metrics,
      campusZones: CAMPUS_ZONES,
      activeOrders: orders,
    },
    null,
    2,
  );

  const readmeMd = `# VENOM STONE COMPANY | DROP — Joya, Amroha

## Live Web App & 3D Open-Roof HQ
- **Public Shareable URL**: ${PUBLIC_SHARED_APP_URL}
- **PWA Install**: Open the URL in Chrome (Android/Desktop) or Safari (iOS) and select "Install App" or "Add to Home Screen".

## Included Files
1. \`index.html\` — Standalone offline-ready dashboard & launcher
2. \`manifest.json\` — Web App Manifest for PWA installation
3. \`campus-blueprint.json\` — Complete 3D Campus zones, metrics, and Joya hyperlocal order data
4. \`README.md\` — Quick start instructions
`;

  zip.file('index.html', standaloneHtml);
  zip.file('manifest.json', manifestJson);
  zip.file('campus-blueprint.json', blueprintJson);
  zip.file('README.md', readmeMd);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  return { filename, fileCount: 4 };
}
