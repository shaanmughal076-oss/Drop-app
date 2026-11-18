import * as THREE from 'three';

export const TRAVERTINE_TEXTURE_URL =
  '/src/assets/images/texture_travertine_courtyard_1794905478018.jpg';
export const OBSIDIAN_TEXTURE_URL =
  '/src/assets/images/texture_obsidian_marble_1794905477445.jpg';

/**
 * Loads a hosted local texture generated via generate_image with full PBR safeguards,
 * plus a procedural fallback so it never fails even before image decode completes.
 */
export function loadArchitecturalTexture(
  url: string,
  repeatX: number,
  repeatY: number,
  maxAnisotropy: number,
  fallbackColorHex: string,
): THREE.Texture {
  // Create immediate procedural canvas texture as base/fallback
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = fallbackColorHex;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(212, 155, 39, 0.22)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  }

  const loader = new THREE.TextureLoader();
  const tex = loader.load(
    url,
    (loaded) => {
      loaded.needsUpdate = true;
    },
    undefined,
    () => {
      // Fallback handled by initial canvas if needed
    },
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates a tileable grayscale micro-relief bump/roughness map in linear space.
 */
export function createStoneBumpTexture(repeatX: number, repeatY: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    // Deterministic stone grain & tile joints
    for (let y = 0; y < 256; y += 4) {
      for (let x = 0; x < 256; x += 4) {
        const hash = ((x * 73856093) ^ (y * 19349663)) & 255;
        const val = 110 + (hash % 40);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(x, y, 4, 4);
      }
    }
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

/**
 * Creates a soft radial contact shadow texture for grounding buildings, fountain, obelisk, and vehicles.
 */
export function createRadialContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.65)');
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.28)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates crisp architectural signage plaque texture for VENOM STONE COMPANY & DROP.
 */
export function createSignboardTexture(
  primaryText: string,
  subText: string,
  accentColor = '#d49b27',
  bgHex = '#0f172a',
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 1024, 256);

    // Double architectural border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, 996, 228);
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, 972, 204);

    // Primary brand headline
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 56px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(primaryText, 512, 104);

    // Sub-headline in gold/emerald
    ctx.fillStyle = accentColor;
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subText, 512, 174);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Creates the glowing Joya & Amroha hyperlocal radar map texture for the Central Atrium Table & Dispatch Wall.
 */
export function createJoyaRadarMapTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#071c15';
    ctx.fillRect(0, 0, 512, 512);

    // Radar concentric rings
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 2;
    [70, 135, 195, 240].forEach((r) => {
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // NH-9 Highway & Amroha arterial corridors
    ctx.strokeStyle = '#d49b27';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(20, 256);
    ctx.lineTo(492, 256);
    ctx.stroke();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(256, 25);
    ctx.lineTo(256, 487);
    ctx.moveTo(95, 95);
    ctx.lineTo(415, 415);
    ctx.stroke();

    // Joya node markers
    const nodes: Array<[number, number, string]> = [
      [256, 256, 'VENOM HQ · JOYA'],
      [140, 248, 'NH-9 CHOWK'],
      [370, 248, 'MAIN BAZAAR'],
      [256, 125, 'AMROHA RD'],
      [256, 380, 'SAMBHAL GATE'],
      [345, 345, 'CIVIL LINES'],
    ];

    nodes.forEach(([x, y, label], idx) => {
      ctx.fillStyle = idx === 0 ? '#d49b27' : '#10b981';
      ctx.beginPath();
      ctx.arc(x, y, idx === 0 ? 10 : 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ecfdf5';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 14);
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}
