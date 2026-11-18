export type CampusZoneId =
  | 'overview'
  | 'executive'
  | 'dispatch'
  | 'engineering'
  | 'merchant'
  | 'courtyard';

export type LightingPreset = 'daylight' | 'golden' | 'night';

export type OrderCategory = 'food' | 'grocery' | 'pharmacy' | 'parcel';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

export interface CampusZoneSpec {
  id: CampusZoneId;
  shortLabel: string;
  title: string;
  wingLocation: string;
  floorAreaSqFt: number;
  teamCount: number;
  summary: string;
  architecturalFinish: string;
  features: string[];
  cameraPose: CameraPose;
  markerPosition: [number, number, number];
}

export interface DropOrder {
  id: string;
  merchantName: string;
  category: OrderCategory;
  pickupSector: string;
  dropDestination: string;
  riderName: string;
  etaMinutes: number;
  amountInr: number;
  status: 'Dispatched' | 'In Transit' | 'Arriving';
  createdAtLabel: string;
}

export interface CampusMetrics {
  activeRiders: number;
  liveOrders: number;
  joyaMerchants: number;
  avgDeliveryMins: number;
  dailyGmvInr: number;
}

export interface DispatchFormInput {
  merchantName: string;
  category: OrderCategory;
  pickupSector: string;
  dropDestination: string;
  amountInr: string;
}

export const JOYA_LANDMARKS: string[] = [
  'NH-9 Highway Chowk, Joya',
  'Joya Main Market Bazaar',
  'Amroha Road Crossing',
  'Civil Lines & Block Office, Joya',
  'Mandi Samiti Gate, Joya',
  'Sambhal Chauraha Sector',
];

export const RIDER_ROSTER: string[] = [
  'Aarav Chaudhary (EV-01)',
  'Zaid Pasha (EV-04)',
  'Rohit Saini (EV-07)',
  'Faizan Siddiqui (EV-09)',
  'Vikas Verma (EV-12)',
  'Imran Ali (EV-15)',
];

export const CAMPUS_ZONES: CampusZoneSpec[] = [
  {
    id: 'overview',
    shortLabel: 'Campus Vista',
    title: 'Venom Stone Company — Open-Roof HQ & Campus',
    wingLocation: 'Central Master Plan · Joya, Amroha (NH-9 Corridor)',
    floorAreaSqFt: 48500,
    teamCount: 142,
    summary:
      'Master-planned corporate headquarters of Venom Stone Company, engineered with an open-roof cutaway atrium housing the flagship DROP hyperlocal commerce platform serving Joya and Amroha.',
    architecturalFinish: 'Honed Obsidian Slate, Warm Travertine & Brushed Gold',
    features: [
      'Retractable skylight roof deck with solar pergola & golden spire',
      'Four interconnected interior wings around the Joya 3D Holographic Rotunda',
      'South Travertine Fountain Plaza & Dedicated EV Fleet Dispatch Bay',
    ],
    cameraPose: {
      position: [0, 34, 44],
      target: [0, 2, 2],
    },
    markerPosition: [0, 3.8, 0],
  },
  {
    id: 'executive',
    shortLabel: 'Executive Suite',
    title: 'Executive & Founder Boardroom Suite',
    wingLocation: 'North-West Wing · Level 1 Interior',
    floorAreaSqFt: 8200,
    teamCount: 16,
    summary:
      'Strategic leadership suite featuring a custom boat-shaped obsidian marble board table, brass-inlaid acoustic wall panels, and regional expansion blueprints across Western Uttar Pradesh.',
    architecturalFinish: 'Vein-Cut Obsidian Marble, Walnut Joinery & Anodized Brass',
    features: [
      '10-seat monolithic obsidian conference table with integrated telemetry surface',
      'Founder architectural study and capital allocation war-room',
      'Direct sightline into the Central Joya Topographic Rotunda',
    ],
    cameraPose: {
      position: [-14, 18, 12],
      target: [-8.5, 2.0, -5.5],
    },
    markerPosition: [-8.5, 3.2, -5.5],
  },
  {
    id: 'dispatch',
    shortLabel: 'DROP Dispatch',
    title: 'DROP Hyperlocal Live Command & Dispatch Hub',
    wingLocation: 'North-East Wing · Level 1 Interior',
    floorAreaSqFt: 11400,
    teamCount: 38,
    summary:
      'Mission-critical operations floor powering DROP — One App for Everything Local in Joya & Amroha. Tracks real-time food, grocery, pharmacy, and instant parcel orders under a 14-minute SLA.',
    architecturalFinish: 'Acoustic Emerald Slats, Matte Slate Flooring & Low-Glare Glass',
    features: [
      'Curved 3-panel Joya & Amroha hyperlocal live routing wall',
      '6 dual-monitor dispatch operator consoles with automated batch assignment',
      'Real-time weather, NH-9 highway traffic, and rider battery telemetry',
    ],
    cameraPose: {
      position: [15, 18, 12],
      target: [8.5, 2.2, -5.5],
    },
    markerPosition: [8.5, 3.2, -5.5],
  },
  {
    id: 'engineering',
    shortLabel: 'Engineering Lab',
    title: 'Product, AI Routing & Cloud Engineering Lab',
    wingLocation: 'South-West Wing · Level 1 Interior',
    floorAreaSqFt: 12800,
    teamCount: 54,
    summary:
      'Core software engineering wing where DROP consumer, merchant POS, and rider fleet apps are built, load-tested, and deployed on edge servers.',
    architecturalFinish: 'Polished Concrete, Tempered Partition Glass & Brushed Aluminum',
    features: [
      '8 ergonomic quad-desk engineering pods with standing-desk actuators',
      'Glass-enclosed local edge server rack cluster with redundant power',
      'Hardware QA bench for Android merchant thermal printers & soundboxes',
    ],
    cameraPose: {
      position: [-15, 17, 19],
      target: [-8.5, 2.0, 5.0],
    },
    markerPosition: [-8.5, 3.2, 5.0],
  },
  {
    id: 'merchant',
    shortLabel: 'Partner Lounge',
    title: 'Joya Merchant Onboarding & Partner Studio',
    wingLocation: 'South-East Wing · Level 1 Interior',
    floorAreaSqFt: 7600,
    teamCount: 22,
    summary:
      'Dedicated hospitality and onboarding lounge welcoming local Joya & Amroha shopkeepers, chemists, restaurants, and delivery partners joining the DROP ecosystem.',
    architecturalFinish: 'Warm Sandstone Veneer, Emerald Upholstery & Terrazzo',
    features: [
      'Instant catalog digitization & QR storefront setup bar',
      'Partner training auditorium and zero-commission onboarding desk',
      'Direct walkway access to the East EV Scooter Dispatch Canopy',
    ],
    cameraPose: {
      position: [15, 17, 19],
      target: [8.5, 2.0, 5.0],
    },
    markerPosition: [8.5, 3.2, 5.0],
  },
  {
    id: 'courtyard',
    shortLabel: 'Fleet & Plaza',
    title: 'Central Travertine Fountain Plaza & DROP EV Fleet Bay',
    wingLocation: 'South Forecourt & East Mobility Bay',
    floorAreaSqFt: 8500,
    teamCount: 12,
    summary:
      'Ceremonial arrival forecourt anchored by the Venom Stone Golden Obelisk, tiered travertine water fountain, and the high-speed DROP electric scooter dispatch bay.',
    architecturalFinish: 'Seamless Cream Travertine Pavers, Bronze Basin & Emerald Canopy',
    features: [
      'Venom Stone Company 9-meter obsidian & gold obelisk monument',
      'Tiered hydrostatic courtyard fountain with acoustic cooling',
      'Solar fast-charging EV scooter dock with direct NH-9 exit lane',
    ],
    cameraPose: {
      position: [12, 14, 34],
      target: [2, 1.5, 17],
    },
    markerPosition: [0, 2.8, 17],
  },
];

export const INITIAL_DROP_ORDERS: DropOrder[] = [
  {
    id: 'DRP-9041',
    merchantName: 'Al-Baik Royal Darbar, Joya',
    category: 'food',
    pickupSector: 'NH-9 Highway Chowk, Joya',
    dropDestination: 'Civil Lines & Block Office, Joya',
    riderName: 'Aarav Chaudhary (EV-01)',
    etaMinutes: 9,
    amountInr: 460,
    status: 'In Transit',
    createdAtLabel: '2m ago',
  },
  {
    id: 'DRP-9040',
    merchantName: 'Kisan Super Mart & Kirana',
    category: 'grocery',
    pickupSector: 'Joya Main Market Bazaar',
    dropDestination: 'Amroha Road Crossing',
    riderName: 'Zaid Pasha (EV-04)',
    etaMinutes: 12,
    amountInr: 1180,
    status: 'Dispatched',
    createdAtLabel: '4m ago',
  },
  {
    id: 'DRP-9039',
    merchantName: 'Shifa Medicos 24x7 Pharmacy',
    category: 'pharmacy',
    pickupSector: 'Joya Main Market Bazaar',
    dropDestination: 'Sambhal Chauraha Sector',
    riderName: 'Rohit Saini (EV-07)',
    etaMinutes: 6,
    amountInr: 340,
    status: 'Arriving',
    createdAtLabel: '7m ago',
  },
  {
    id: 'DRP-9038',
    merchantName: 'Bikaner Sweets & Dairy House',
    category: 'food',
    pickupSector: 'Amroha Road Crossing',
    dropDestination: 'Mandi Samiti Gate, Joya',
    riderName: 'Faizan Siddiqui (EV-09)',
    etaMinutes: 11,
    amountInr: 620,
    status: 'In Transit',
    createdAtLabel: '11m ago',
  },
  {
    id: 'DRP-9037',
    merchantName: 'Joya Express Document & Parcel',
    category: 'parcel',
    pickupSector: 'Civil Lines & Block Office, Joya',
    dropDestination: 'NH-9 Highway Chowk, Joya',
    riderName: 'Vikas Verma (EV-12)',
    etaMinutes: 14,
    amountInr: 150,
    status: 'Dispatched',
    createdAtLabel: '15m ago',
  },
];

export const INITIAL_CAMPUS_METRICS: CampusMetrics = {
  activeRiders: 48,
  liveOrders: 194,
  joyaMerchants: 312,
  avgDeliveryMins: 11.4,
  dailyGmvInr: 428500,
};

/**
 * Pure calculation for the Open-Roof cutaway elevation and opacity.
 * cutawayFactor = 0 -> Closed architectural roof sitting flush at baseHeight.
 * cutawayFactor = 1 -> Open-roof cutaway elevated above the building and semi-transparent/hidden.
 */
export function calculateRoofElevation(
  cutawayFactor: number,
  baseHeight = 5.4,
): {
  roofY: number;
  roofOpacity: number;
  isCutawayOpen: boolean;
} {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(cutawayFactor) ? cutawayFactor : 0));
  const liftDistance = 14.5;
  const roofY = Number((baseHeight + clamped * liftDistance).toFixed(3));
  const roofOpacity = Number(Math.max(0.06, 1 - clamped * 0.92).toFixed(3));
  return {
    roofY,
    roofOpacity,
    isCutawayOpen: clamped >= 0.35,
  };
}

/**
 * Pure camera pose calculation that adjusts camera elevation slightly when roof is closed vs open.
 */
export function computeZoneCameraPose(
  zoneId: CampusZoneId,
  cutawayFactor: number,
): CameraPose {
  const zone = CAMPUS_ZONES.find((z) => z.id === zoneId) ?? CAMPUS_ZONES[0];
  const clamped = Math.max(0, Math.min(1, Number.isFinite(cutawayFactor) ? cutawayFactor : 1));
  const [px, py, pz] = zone.cameraPose.position;
  const [tx, ty, tz] = zone.cameraPose.target;

  // For interior rooms, if the roof is closed (cutawayFactor < 0.3), pull camera slightly lower/closer
  const isInterior =
    zoneId === 'executive' ||
    zoneId === 'dispatch' ||
    zoneId === 'engineering' ||
    zoneId === 'merchant';

  const adjustedY = isInterior ? Number((py - (1 - clamped) * 2.5).toFixed(2)) : py;
  return {
    position: [px, adjustedY, pz],
    target: [tx, ty, tz],
  };
}

/**
 * Validates form input for dispatching a new DROP local order in Joya, Amroha.
 */
export function validateOrderDispatch(input: DispatchFormInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const merchant = input.merchantName.trim();
  if (!merchant) {
    errors.merchantName = 'Merchant or store name is required.';
  } else if (merchant.length < 3) {
    errors.merchantName = 'Merchant name must be at least 3 characters.';
  }

  if (!input.pickupSector.trim()) {
    errors.pickupSector = 'Select a pickup sector in Joya.';
  }

  if (!input.dropDestination.trim()) {
    errors.dropDestination = 'Select a drop destination in Joya / Amroha.';
  } else if (
    input.pickupSector.trim() &&
    input.pickupSector.trim() === input.dropDestination.trim()
  ) {
    errors.dropDestination = 'Drop destination must differ from pickup sector.';
  }

  const parsedAmount = Number(input.amountInr);
  if (!input.amountInr.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 40) {
    errors.amountInr = 'Enter a valid order value (minimum ₹40).';
  } else if (parsedAmount > 50000) {
    errors.amountInr = 'Single instant delivery order cannot exceed ₹50,000.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Creates a new dispatched DROP order and updates campus live metrics deterministically.
 */
export function createDispatchedOrder(
  input: DispatchFormInput,
  existingOrders: DropOrder[],
   currentMetrics: CampusMetrics,
): {
  order: DropOrder;
  updatedOrders: DropOrder[];
  updatedMetrics: CampusMetrics;
} {
  const nextNumber = 9042 + existingOrders.length;
  const parsedAmount = Math.round(Number(input.amountInr));
  const riderIndex = existingOrders.length % RIDER_ROSTER.length;
  const etaByCategory: Record<OrderCategory, number> = {
    pharmacy: 7,
    food: 10,
    grocery: 12,
    parcel: 13,
  };

  const order: DropOrder = {
    id: `DRP-${nextNumber}`,
    merchantName: input.merchantName.trim(),
    category: input.category,
    pickupSector: input.pickupSector.trim(),
    dropDestination: input.dropDestination.trim(),
    riderName: RIDER_ROSTER[riderIndex],
    etaMinutes: etaByCategory[input.category] ?? 11,
    amountInr: parsedAmount,
    status: 'Dispatched',
    createdAtLabel: 'Just now',
  };

  const updatedOrders = [order, ...existingOrders];
  const updatedMetrics: CampusMetrics = {
    ...currentMetrics,
    liveOrders: currentMetrics.liveOrders + 1,
    activeRiders: currentMetrics.activeRiders + 1,
    dailyGmvInr: currentMetrics.dailyGmvInr + parsedAmount,
  };

  return {
    order,
    updatedOrders,
    updatedMetrics,
  };
}

export function filterOrdersByCategory(
  orders: DropOrder[],
  category: OrderCategory | 'all',
): DropOrder[] {
  if (category === 'all') return orders;
  return orders.filter((o) => o.category === category);
}

export type AmbientTrackId =
  | 'serene-wind'
  | 'boardroom-poise'
  | 'office-hustle'
  | 'server-hum'
  | 'lounge-warmth'
  | 'fountain-plaza';

export interface AmbientSoundscapeSpec {
  trackId: AmbientTrackId;
  label: string;
  description: string;
  baseFreqHz: number;
  harmonicFreqHz: number;
  filterCutoffHz: number;
  filterType: BiquadFilterType;
  lfoRateHz: number;
  pulseIntervalMs: number | null;
}

export const ZONE_AMBIENT_SOUNDSCAPES: Record<CampusZoneId, AmbientSoundscapeSpec> = {
  overview: {
    trackId: 'serene-wind',
    label: 'Serene Wind',
    description: 'High-altitude breeze sweeping across the Joya NH-9 campus parkland',
    baseFreqHz: 110,
    harmonicFreqHz: 164.81,
    filterCutoffHz: 420,
    filterType: 'bandpass',
    lfoRateHz: 0.18,
    pulseIntervalMs: null,
  },
  executive: {
    trackId: 'boardroom-poise',
    label: 'Boardroom Poise',
    description: 'Warm acoustic resonance and quiet architectural poise',
    baseFreqHz: 98,
    harmonicFreqHz: 146.83,
    filterCutoffHz: 280,
    filterType: 'lowpass',
    lfoRateHz: 0.12,
    pulseIntervalMs: null,
  },
  dispatch: {
    trackId: 'office-hustle',
    label: 'Office Hustle',
    description: 'Active DROP dispatch telemetry, routing chimes, and operator cadence',
    baseFreqHz: 146.83,
    harmonicFreqHz: 220,
    filterCutoffHz: 920,
    filterType: 'bandpass',
    lfoRateHz: 0.65,
    pulseIntervalMs: 950,
  },
  engineering: {
    trackId: 'server-hum',
    label: 'Server Hum',
    description: 'Precision edge server rack airflow and low-frequency transformer hum',
    baseFreqHz: 120,
    harmonicFreqHz: 240,
    filterCutoffHz: 540,
    filterType: 'lowpass',
    lfoRateHz: 0.35,
    pulseIntervalMs: 1400,
  },
  merchant: {
    trackId: 'lounge-warmth',
    label: 'Lounge Warmth',
    description: 'Inviting partner hospitality chord and soft ambient murmur',
    baseFreqHz: 130.81,
    harmonicFreqHz: 196.0,
    filterCutoffHz: 620,
    filterType: 'lowpass',
    lfoRateHz: 0.22,
    pulseIntervalMs: null,
  },
  courtyard: {
    trackId: 'fountain-plaza',
    label: 'Fountain Plaza',
    description: 'Cascading travertine fountain water and open forecourt air',
    baseFreqHz: 174.61,
    harmonicFreqHz: 261.63,
    filterCutoffHz: 1150,
    filterType: 'bandpass',
    lfoRateHz: 0.42,
    pulseIntervalMs: null,
  },
};

export function getAmbientSoundscapeForZone(zoneId: CampusZoneId): AmbientSoundscapeSpec {
  return ZONE_AMBIENT_SOUNDSCAPES[zoneId] ?? ZONE_AMBIENT_SOUNDSCAPES.overview;
}

export const PUBLIC_SHARED_APP_URL =
  'https://ais-pre-zzcpnloggrxeomltrq4uho-816539758515.asia-southeast1.run.app';

export const DEV_APP_URL =
  'https://ais-dev-zzcpnloggrxeomltrq4uho-816539758515.asia-southeast1.run.app';

export interface SharePackage {
  shareUrl: string;
  devUrl: string;
  whatsappText: string;
  instagramCaption: string;
}

export function buildPublicShareLink(
  currentOrigin?: string,
  _zoneId: CampusZoneId = 'overview',
): SharePackage {
  const isLiveHttpsOrigin =
    Boolean(currentOrigin) &&
    currentOrigin!.startsWith('https://') &&
    !currentOrigin!.includes('localhost');

  const shareUrl = isLiveHttpsOrigin
    ? currentOrigin!.replace(/\/$/, '')
    : PUBLIC_SHARED_APP_URL;

  const whatsappText = `Download DROP — One App for Everything Local (Joya, Amroha) by VENOM STONE COMPANY! Open & Install Free Web App: ${shareUrl}`;
  const instagramCaption = `VENOM STONE COMPANY · DROP App (Joya, Amroha) — Food, Grocery, 24x7 Pharmacy & Instant Parcel! Open & Install Free Web App: ${shareUrl}`;

  return {
    shareUrl,
    devUrl: DEV_APP_URL,
    whatsappText,
    instagramCaption,
  };
}

export interface ApkInstallGuide {
  noticeHeadline: string;
  noticeSubtext: string;
  androidSteps: string[];
  iosSteps: string[];
}

export function getApkAndPwaInstallSteps(): ApkInstallGuide {
  return {
    noticeHeadline: 'APK Coming Soon - Abhi Web App Install Karo',
    noticeSubtext:
      'Direct Android .APK package is in final signing. Abhi niche diye steps se 2 second me DROP Web App (PWA) apne phone ke Home Screen pe APK jaisa install karein:',
    androidSteps: [
      'Step 1: Click "Install App Now (PWA)" button below or tap Chrome top-right menu (⋮).',
      'Step 2: Select "Install App" or "Add to Home Screen" from the browser menu.',
      'Step 3: Tap "Install" — DROP Joya icon will appear on your Home Screen like a native APK!',
    ],
    iosSteps: [
      'Step 1: Open this link in Safari on your iPhone or iPad and tap the Share icon (↑).',
      'Step 2: Scroll down and tap "Add to Home Screen".',
      'Step 3: Tap "Add" in the top-right corner to launch DROP in full-screen standalone mode.',
    ],
  };
}

export interface OrderVelocityPoint {
  minutesAgo: number;
  timeLabel: string;
  ordersPerMin: number;
}

export interface OrderVelocitySummary {
  currentRate: number;
  peakRate: number;
  avgRate: number;
  deltaPercent: number;
  zoneUnitLabel: string;
}

const ZONE_VELOCITY_BASELINES: Record<
  CampusZoneId,
  { base: number; amp: number; phase: number; unitLabel: string }
> = {
  overview: {
    base: 16.4,
    amp: 4.2,
    phase: 0.2,
    unitLabel: 'Campus Total Orders / Min',
  },
  dispatch: {
    base: 22.8,
    amp: 6.5,
    phase: 0.8,
    unitLabel: 'Dispatched Joya Orders / Min',
  },
  executive: {
    base: 9.2,
    amp: 2.4,
    phase: 1.4,
    unitLabel: 'High-Value Bulk Orders / Min',
  },
  engineering: {
    base: 18.6,
    amp: 5.1,
    phase: 2.1,
    unitLabel: 'Auto-Routed API Batches / Min',
  },
  merchant: {
    base: 14.0,
    amp: 3.8,
    phase: 2.7,
    unitLabel: 'Merchant POS Accepts / Min',
  },
  courtyard: {
    base: 19.5,
    amp: 5.4,
    phase: 0.5,
    unitLabel: 'EV Fleet Departures / Min',
  },
};

/**
 * Generates a 13-point time-series over the last 60 minutes (5-minute intervals from -60m to Now)
 * representing order flow velocity for the selected campus zone.
 */
export function generateZoneOrderVelocitySeries(
  zoneId: CampusZoneId,
  liveOrders: number,
  tickStep = 0,
): OrderVelocityPoint[] {
  const cfg = ZONE_VELOCITY_BASELINES[zoneId] ?? ZONE_VELOCITY_BASELINES.overview;
  const orderBonus = Math.max(0, liveOrders - INITIAL_CAMPUS_METRICS.liveOrders) * 1.35;
  const points: OrderVelocityPoint[] = [];

  for (let i = 0; i <= 12; i++) {
    const minutesAgo = (12 - i) * 5;
    const progress = i / 12; // 0 at -60m, 1 at Now
    const wave1 = Math.sin(i * 0.65 + cfg.phase + tickStep * 0.35) * cfg.amp * 0.65;
    const wave2 = Math.cos(i * 1.15 - cfg.phase + tickStep * 0.2) * cfg.amp * 0.35;
    const trendBoost = progress * (cfg.amp * 0.55);
    const liveSpike = i === 12 ? orderBonus : i === 11 ? orderBonus * 0.45 : 0;

    const rawVal = cfg.base + wave1 + wave2 + trendBoost + liveSpike;
    const ordersPerMin = Number(Math.max(2.0, rawVal).toFixed(1));

    points.push({
      minutesAgo,
      timeLabel: minutesAgo === 0 ? 'Now' : `-${minutesAgo}m`,
      ordersPerMin,
    });
  }

  return points;
}

export function computeOrderVelocitySummary(
  zoneId: CampusZoneId,
  series: OrderVelocityPoint[],
): OrderVelocitySummary {
  const cfg = ZONE_VELOCITY_BASELINES[zoneId] ?? ZONE_VELOCITY_BASELINES.overview;
  if (series.length === 0) {
    return {
      currentRate: 0,
      peakRate: 0,
      avgRate: 0,
      deltaPercent: 0,
      zoneUnitLabel: cfg.unitLabel,
    };
  }

  const firstRate = series[0].ordersPerMin;
  const currentRate = series[series.length - 1].ordersPerMin;
  let peakRate = 0;
  let sum = 0;

  for (const pt of series) {
    if (pt.ordersPerMin > peakRate) peakRate = pt.ordersPerMin;
    sum += pt.ordersPerMin;
  }

  const avgRate = Number((sum / series.length).toFixed(1));
  const deltaPercent =
    firstRate > 0
      ? Number((((currentRate - firstRate) / firstRate) * 100).toFixed(1))
      : 0;

  return {
    currentRate,
    peakRate,
    avgRate,
    deltaPercent,
    zoneUnitLabel: cfg.unitLabel,
  };
}

export type OrbitTutorialDismissReason =
  | 'none'
  | 'dragged'
  | 'clicked-wing'
  | 'manual-dismiss'
  | 'auto-timeout';

export interface OrbitTutorialState {
  visible: boolean;
  hasInteracted: boolean;
  dragDistancePx: number;
  dismissedReason: OrbitTutorialDismissReason;
}

export interface OrbitTutorialEvent {
  type: 'drag' | 'wing-click' | 'dismiss' | 'timeout' | 'replay';
  dragDeltaPx?: number;
}

export const INITIAL_ORBIT_TUTORIAL_STATE: OrbitTutorialState = {
  visible: true,
  hasInteracted: false,
  dragDistancePx: 0,
  dismissedReason: 'none',
};

export const ORBIT_TUTORIAL_COPY = {
  headline: 'Drag to Orbit',
  subheadline: 'Click & drag anywhere to rotate 360° around the Open-Roof HQ',
  secondaryCues: 'Scroll to Zoom · Click Wing to Inspect · WASD Pan',
} as const;

/**
 * Pure state transition evaluator for the CampusViewport 'Drag to Orbit' interactive tutorial overlay.
 */
export function evaluateOrbitTutorialInteraction(
  state: OrbitTutorialState,
  event: OrbitTutorialEvent,
  dragThresholdPx = 14,
): OrbitTutorialState {
  if (event.type === 'replay') {
    return {
      visible: true,
      hasInteracted: false,
      dragDistancePx: 0,
      dismissedReason: 'none',
    };
  }

  if (!state.visible) {
    return state;
  }

  if (event.type === 'drag') {
    const delta = Math.max(0, Number.isFinite(event.dragDeltaPx) ? event.dragDeltaPx! : 0);
    const nextDistance = Number((state.dragDistancePx + delta).toFixed(2));
    if (nextDistance >= dragThresholdPx) {
      return {
        visible: false,
        hasInteracted: true,
        dragDistancePx: nextDistance,
        dismissedReason: 'dragged',
      };
    }
    return {
      ...state,
      dragDistancePx: nextDistance,
    };
  }

  if (event.type === 'wing-click') {
    return {
      ...state,
      visible: false,
      hasInteracted: true,
      dismissedReason: 'clicked-wing',
    };
  }

  if (event.type === 'dismiss') {
    return {
      ...state,
      visible: false,
      hasInteracted: true,
      dismissedReason: 'manual-dismiss',
    };
  }

  if (event.type === 'timeout') {
    return {
      ...state,
      visible: false,
      dismissedReason: 'auto-timeout',
    };
  }

  return state;
}




