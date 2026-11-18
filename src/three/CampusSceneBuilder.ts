import * as THREE from 'three';
import { CampusZoneId } from '../domain/campusData';
import {
  OBSIDIAN_TEXTURE_URL,
  TRAVERTINE_TEXTURE_URL,
  createJoyaRadarMapTexture,
  createRadialContactShadowTexture,
  createSignboardTexture,
  createStoneBumpTexture,
  loadArchitecturalTexture,
} from './proceduralTextures';

export interface AnimatedScooter {
  group: THREE.Group;
  laneIndex: number;
  progress: number;
  speed: number;
  boostTimer: number;
}

export interface BuiltCampusScene {
  rootGroup: THREE.Group;
  roofGroup: THREE.Group;
  roofMaterials: THREE.MeshStandardMaterial[];
  interactables: THREE.Object3D[];
  zoneBeaconRings: Map<CampusZoneId, THREE.Mesh>;
  holoRingGroup: THREE.Group;
  fountainWaterRings: THREE.Mesh[];
  activeScooters: AnimatedScooter[];
  windowEmissiveMaterials: THREE.MeshStandardMaterial[];
  lampLights: THREE.PointLight[];
}

/**
 * Builds a multi-part ergonomic office/boardroom chair (5 parts) grounded at y=0.
 */
function createOfficeChair(
  seatMat: THREE.Material,
  frameMat: THREE.Material,
  goldMat: THREE.Material,
): THREE.Group {
  const chair = new THREE.Group();
  // 1. Base star pedestal
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 12), frameMat);
  base.position.y = 0.03;
  chair.add(base);
  // 2. Pneumatic stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.38, 8), goldMat);
  stem.position.y = 0.22;
  chair.add(stem);
  // 3. Seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.5), seatMat);
  seat.position.y = 0.44;
  chair.add(seat);
  // 4. Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.56, 0.07), seatMat);
  back.position.set(0, 0.74, -0.22);
  chair.add(back);
  // 5. Brass lumbar accent bar
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.09), goldMat);
  trim.position.set(0, 0.62, -0.23);
  chair.add(trim);
  return chair;
}

/**
 * Builds a multi-part DROP Electric Delivery Scooter (7 distinct parts) grounded at y=0.
 */
function createDropDeliveryScooter(
  emeraldMat: THREE.Material,
  obsidianMat: THREE.Material,
  goldMat: THREE.Material,
  chromeMat: THREE.Material,
  headlightMat: THREE.Material,
): THREE.Group {
  const scooter = new THREE.Group();

  // 1. Main lower step-through chassis
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 1.35), obsidianMat);
  deck.position.set(0, 0.28, 0);
  scooter.add(deck);

  // 2. Front aerodynamic fairing shield
  const fairing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.72, 12), emeraldMat);
  fairing.position.set(0, 0.62, 0.45);
  fairing.rotation.x = -0.22;
  scooter.add(fairing);

  // 3. Front & Rear wheels
  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const frontWheel = new THREE.Mesh(wheelGeo, obsidianMat);
  frontWheel.position.set(0, 0.22, 0.56);
  scooter.add(frontWheel);

  const rearWheel = new THREE.Mesh(wheelGeo, obsidianMat);
  rearWheel.position.set(0, 0.22, -0.54);
  scooter.add(rearWheel);

  // 4. Rider saddle seat
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.55), obsidianMat);
  saddle.position.set(0, 0.58, -0.15);
  scooter.add(saddle);

  // 5. Handlebar crossbar + grips
  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.68, 8), chromeMat);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 0.96, 0.38);
  scooter.add(handlebar);

  // 6. Signature DROP Insulated Delivery Cargo Box (Rear rack)
  const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.52, 0.52), emeraldMat);
  cargoBox.position.set(0, 0.84, -0.52);
  scooter.add(cargoBox);

  const cargoTrim = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.54), goldMat);
  cargoTrim.position.set(0, 0.84, -0.52);
  scooter.add(cargoTrim);

  // 7. LED Headlight bezel
  const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), headlightMat);
  headlight.position.set(0, 0.82, 0.55);
  scooter.add(headlight);

  return scooter;
}

export function buildVenomStoneCampusScene(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
): BuiltCampusScene {
  const rootGroup = new THREE.Group();
  const roofGroup = new THREE.Group();
  const roofMaterials: THREE.MeshStandardMaterial[] = [];
  const interactables: THREE.Object3D[] = [];
  const zoneBeaconRings = new Map<CampusZoneId, THREE.Mesh>();
  const fountainWaterRings: THREE.Mesh[] = [];
  const activeScooters: AnimatedScooter[] = [];
  const windowEmissiveMaterials: THREE.MeshStandardMaterial[] = [];
  const lampLights: THREE.PointLight[] = [];

  const maxAniso = renderer.capabilities.getMaxAnisotropy() || 4;

  // --- Shared PBR Material Library ---
  const travertineMap = loadArchitecturalTexture(
    TRAVERTINE_TEXTURE_URL,
    8,
    8,
    maxAniso,
    '#e8dec8',
  );
  const obsidianMap = loadArchitecturalTexture(
    OBSIDIAN_TEXTURE_URL,
    6,
    6,
    maxAniso,
    '#1e242d',
  );
  const stoneBump = createStoneBumpTexture(8, 8);
  const contactShadowTex = createRadialContactShadowTexture();

  const travertinePlazaMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: travertineMap,
    bumpMap: stoneBump,
    bumpScale: 0.015,
    roughness: 0.72,
    metalness: 0.08,
  });

  const obsidianStoneMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: obsidianMap,
    bumpMap: stoneBump,
    bumpScale: 0.012,
    roughness: 0.32,
    metalness: 0.45,
  });

  const warmLimestoneMat = new THREE.MeshStandardMaterial({
    color: 0xf4efe6,
    bumpMap: stoneBump,
    bumpScale: 0.008,
    roughness: 0.68,
    metalness: 0.05,
  });

  const brushedGoldMat = new THREE.MeshPhysicalMaterial({
    color: 0xd49b27,
    roughness: 0.22,
    metalness: 0.88,
    clearcoat: 0.4,
  });

  const deepBronzeMat = new THREE.MeshStandardMaterial({
    color: 0x5c4014,
    roughness: 0.38,
    metalness: 0.78,
  });

  const dropEmeraldMat = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    roughness: 0.25,
    metalness: 0.35,
    clearcoat: 0.6,
  });

  const deepTealMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.55,
    metalness: 0.15,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.18,
    metalness: 0.9,
  });

  const walnutWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.52,
    metalness: 0.08,
  });

  const glassCurtainMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    transparent: true,
    opacity: isSoftwareGl ? 0.32 : 0.42,
    roughness: 0.1,
    metalness: 0.15,
    depthWrite: false,
  });

  const glowingScreenMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b,
    emissive: 0x10b981,
    emissiveIntensity: 0.65,
    roughness: 0.2,
  });
  windowEmissiveMaterials.push(glowingScreenMat);

  const warmInteriorFloorMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.42,
    metalness: 0.1,
  });

  const darkSlateFloorMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.48,
    metalness: 0.2,
  });

  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const addContactShadow = (x: number, z: number, radiusX: number, radiusZ: number, y = 0.03) => {
    const disc = new THREE.Mesh(new THREE.PlaneGeometry(radiusX * 2, radiusZ * 2), contactShadowMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(x, y, z);
    rootGroup.add(disc);
  };

  // ============================================================================
  // 1. EXTENDED NATURAL TERRAIN, NH-9 JOYA HIGHWAY & PERIMETER PARKLAND
  // ============================================================================
  const parklandGround = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 260),
    new THREE.MeshStandardMaterial({
      color: 0xc8d9c3,
      roughness: 0.92,
      metalness: 0.0,
    }),
  );
  parklandGround.rotation.x = -Math.PI / 2;
  parklandGround.position.y = -0.08;
  parklandGround.receiveShadow = !isSoftwareGl;
  rootGroup.add(parklandGround);

  // Raised manicured campus lawn platform
  const campusLawn = new THREE.Mesh(
    new THREE.BoxGeometry(88, 0.14, 78),
    new THREE.MeshStandardMaterial({
      color: 0x7cb37f,
      roughness: 0.85,
      metalness: 0.02,
    }),
  );
  campusLawn.position.set(0, -0.01, 4);
  campusLawn.receiveShadow = !isSoftwareGl;
  rootGroup.add(campusLawn);

  // Main Travertine Courtyard & Building Plinth (disjoint Y = 0.08)
  const mainPlazaSlab = new THREE.Mesh(new THREE.BoxGeometry(52, 0.16, 48), travertinePlazaMat);
  mainPlazaSlab.position.set(0, 0.08, 4);
  mainPlazaSlab.receiveShadow = !isSoftwareGl;
  rootGroup.add(mainPlazaSlab);

  // Gold & Obsidian border trim around the main plaza
  const plazaBorder = new THREE.Mesh(new THREE.BoxGeometry(52.8, 0.12, 48.8), obsidianStoneMat);
  plazaBorder.position.set(0, 0.04, 4);
  rootGroup.add(plazaBorder);

  // NH-9 Joya-Amroha Highway Corridor across the South frontage (z = 34)
  const highwayAsphalt = new THREE.Mesh(
    new THREE.BoxGeometry(180, 0.1, 8.5),
    new THREE.MeshStandardMaterial({ color: 0x262f3d, roughness: 0.82, metalness: 0.08 }),
  );
  highwayAsphalt.position.set(0, 0.05, 34);
  rootGroup.add(highwayAsphalt);

  // Highway dashed gold lane markings (InstancedMesh)
  const dashGeo = new THREE.PlaneGeometry(2.4, 0.22);
  dashGeo.rotateX(-Math.PI / 2);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const dashInst = new THREE.InstancedMesh(dashGeo, dashMat, 28);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 28; i++) {
    dummy.position.set(-80 + i * 6, 0.12, 34);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    dashInst.setMatrixAt(i, dummy.matrix);
  }
  dashInst.computeBoundingSphere();
  rootGroup.add(dashInst);

  // ============================================================================
  // 2. OPEN-ROOF CORPORATE HQ BUILDING SHELL & 4 INTERCONNECTED WINGS
  // ============================================================================
  // HQ footprint: X from -18 to +18 (36m wide), Z from -13 to +12 (25m deep), centered at (0, 0, -0.5)
  const hqPod = new THREE.Mesh(new THREE.BoxGeometry(36.8, 0.28, 25.8), obsidianStoneMat);
  hqPod.position.set(0, 0.22, -0.5);
  hqPod.receiveShadow = !isSoftwareGl;
  rootGroup.add(hqPod);
  addContactShadow(0, -0.5, 21, 15, 0.17);

  // 4 Quadrant Interior Floors (disjoint Y = 0.38 so zero Z-fighting)
  const nwFloor = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.06, 11.4), darkSlateFloorMat);
  nwFloor.position.set(-8.6, 0.39, -6.2);
  rootGroup.add(nwFloor);

  const neFloor = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.06, 11.4), darkSlateFloorMat);
  neFloor.position.set(8.6, 0.39, -6.2);
  rootGroup.add(neFloor);

  const swFloor = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.06, 11.4), warmInteriorFloorMat);
  swFloor.position.set(-8.6, 0.39, 5.2);
  rootGroup.add(swFloor);

  const seFloor = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.06, 11.4), warmInteriorFloorMat);
  seFloor.position.set(8.6, 0.39, 5.2);
  rootGroup.add(seFloor);

  // Exterior Colonnade Pillars (22 architectural obsidian & gold fluted piers around the perimeter)
  const wallHeight = 5.0;
  const wallCenterY = 0.36 + wallHeight / 2;

  const createArchitecturalPier = (x: number, z: number) => {
    const pierGroup = new THREE.Group();
    pierGroup.position.set(x, 0.36, z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 0.95), brushedGoldMat);
    base.position.y = 0.225;
    pierGroup.add(base);

    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, wallHeight - 0.8, 0.76),
      obsidianStoneMat,
    );
    shaft.position.y = wallHeight / 2;
    shaft.castShadow = !isSoftwareGl;
    pierGroup.add(shaft);

    const capital = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.4, 1.02), brushedGoldMat);
    capital.position.y = wallHeight - 0.2;
    pierGroup.add(capital);

    rootGroup.add(pierGroup);
  };

  for (let x = -18; x <= 18; x += 6) {
    createArchitecturalPier(x, -13);
    if (Math.abs(x) >= 6) {
      createArchitecturalPier(x, 12);
    }
  }
  for (let z = -7; z <= 6; z += 6.5) {
    createArchitecturalPier(-18, z);
    createArchitecturalPier(18, z);
  }

  // Exterior Curtain Walls & Architectural Limestone Spandrels
  // North Rear Wall (Solid warm limestone with bronze acoustic ribs + glass clerestory)
  const northWall = new THREE.Mesh(
    new THREE.BoxGeometry(35.6, wallHeight, 0.42),
    warmLimestoneMat,
  );
  northWall.position.set(0, wallCenterY, -13);
  northWall.castShadow = !isSoftwareGl;
  rootGroup.add(northWall);

  // West & East Glazed Curtain Walls
  const westGlass = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.2, 24.4), glassCurtainMat);
  westGlass.position.set(-18, wallCenterY, -0.5);
  westGlass.renderOrder = 2;
  rootGroup.add(westGlass);

  const eastGlass = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.2, 24.4), glassCurtainMat);
  eastGlass.position.set(18, wallCenterY, -0.5);
  eastGlass.renderOrder = 2;
  rootGroup.add(eastGlass);

  // South Front Facade with Grand Open Portico Entryway
  const southLeftGlass = new THREE.Mesh(new THREE.BoxGeometry(11.6, 4.2, 0.24), glassCurtainMat);
  southLeftGlass.position.set(-12, wallCenterY, 12);
  southLeftGlass.renderOrder = 2;
  rootGroup.add(southLeftGlass);

  const southRightGlass = new THREE.Mesh(new THREE.BoxGeometry(11.6, 4.2, 0.24), glassCurtainMat);
  southRightGlass.position.set(12, wallCenterY, 12);
  southRightGlass.renderOrder = 2;
  rootGroup.add(southRightGlass);

  // Grand South Entrance Portico & VENOM STONE COMPANY Signboard
  const porticoCanopy = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.55, 4.2), obsidianStoneMat);
  porticoCanopy.position.set(0, 5.25, 13.4);
  rootGroup.add(porticoCanopy);

  const porticoGoldTrim = new THREE.Mesh(new THREE.BoxGeometry(13.1, 0.18, 4.4), brushedGoldMat);
  porticoGoldTrim.position.set(0, 5.55, 13.4);
  rootGroup.add(porticoGoldTrim);

  // Left & Right Portico Fluted Columns
  [-5.2, 5.2].forEach((px) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 4.9, 16), obsidianStoneMat);
    col.position.set(px, 2.8, 14.8);
    col.castShadow = !isSoftwareGl;
    rootGroup.add(col);
    const colRing = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 16), brushedGoldMat);
    colRing.position.set(px, 0.5, 14.8);
    rootGroup.add(colRing);
  });

  // Main Facade Signboard: VENOM STONE COMPANY
  const hqSignTex = createSignboardTexture(
    'VENOM STONE COMPANY',
    'CORPORATE HQ · DROP HYPERLOCAL (JOYA, AMROHA)',
    '#d49b27',
    '#0f172a',
    maxAniso,
  );
  const hqSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10.8, 2.1),
    new THREE.MeshBasicMaterial({ map: hqSignTex }),
  );
  hqSignMesh.position.set(0, 6.65, 13.65);
  rootGroup.add(hqSignMesh);

  const hqSignBacking = new THREE.Mesh(new THREE.BoxGeometry(11.1, 2.3, 0.35), brushedGoldMat);
  hqSignBacking.position.set(0, 6.65, 13.45);
  rootGroup.add(hqSignBacking);

  // Interior Partition Walls with Framed Doorway Openings (leaving Central Rotunda radius 4.8m clear)
  const buildInteriorWall = (
    w: number,
    h: number,
    d: number,
    x: number,
    z: number,
    mat = warmLimestoneMat,
  ) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    wall.position.set(x, 0.36 + h / 2, z);
    wall.castShadow = !isSoftwareGl;
    wall.receiveShadow = !isSoftwareGl;
    rootGroup.add(wall);
    // Gold top rail along interior partition so cutaway view looks like an architectural blueprint
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.08, d + 0.04), brushedGoldMat);
    topRail.position.set(x, 0.36 + h + 0.04, z);
    rootGroup.add(topRail);
  };

  // North-South Divider Segments (between NW Executive and NE Dispatch, and SW Eng and SE Merchant)
  buildInteriorWall(0.32, 3.6, 6.8, 0, -9.2);
  buildInteriorWall(0.32, 3.6, 5.4, 0, 8.2);
  // East-West Divider Segments (between North and South wings)
  buildInteriorWall(11.8, 3.6, 0.32, -11.6, -0.5);
  buildInteriorWall(11.8, 3.6, 0.32, 11.6, -0.5);

  // ============================================================================
  // 3. CENTRAL ATRIUM ROTUNDA: JOYA & AMROHA 3D HOLOGRAPHIC COMMAND TABLE
  // ============================================================================
  const rotundaGroup = new THREE.Group();
  rotundaGroup.position.set(0, 0.38, -0.5);

  // Circular Obsidian & Brass dais
  const daisStep = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 4.1, 0.18, 32),
    obsidianStoneMat,
  );
  daisStep.position.y = 0.09;
  rotundaGroup.add(daisStep);

  const daisGoldRing = new THREE.Mesh(
    new THREE.RingGeometry(3.55, 3.78, 32),
    new THREE.MeshBasicMaterial({ color: 0xd49b27, side: THREE.DoubleSide }),
  );
  daisGoldRing.rotation.x = -Math.PI / 2;
  daisGoldRing.position.y = 0.19;
  rotundaGroup.add(daisGoldRing);

  // Holographic Map Table Pedestal
  const tablePedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.45, 1.85, 0.92, 24),
    obsidianStoneMat,
  );
  tablePedestal.position.y = 0.64;
  rotundaGroup.add(tablePedestal);

  const tableRim = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.12, 12, 32), brushedGoldMat);
  tableRim.rotation.x = Math.PI / 2;
  tableRim.position.y = 1.12;
  rotundaGroup.add(tableRim);

  // Glowing Joya Radar Surface
  const radarTex = createJoyaRadarMapTexture(maxAniso);
  const radarDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.98, 32),
    new THREE.MeshBasicMaterial({ map: radarTex }),
  );
  radarDisc.rotation.x = -Math.PI / 2;
  radarDisc.position.y = 1.14;
  rotundaGroup.add(radarDisc);

  // Rotating 3D Holographic City Blocks & Gyro Rings above the table
  const holoRingGroup = new THREE.Group();
  holoRingGroup.position.y = 1.65;

  const holoOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.03, 8, 32),
    dropEmeraldMat,
  );
  holoOuterRing.rotation.x = Math.PI / 2;
  holoRingGroup.add(holoOuterRing);

  const holoCentralSpire = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.85, 6),
    brushedGoldMat,
  );
  holoCentralSpire.position.y = 0.25;
  holoRingGroup.add(holoCentralSpire);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const nodeTower = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.35 + (i % 3) * 0.16, 0.18),
      dropEmeraldMat,
    );
    nodeTower.position.set(Math.cos(angle) * 1.1, 0.05, Math.sin(angle) * 1.1);
    holoRingGroup.add(nodeTower);
  }
  rotundaGroup.add(holoRingGroup);
  rootGroup.add(rotundaGroup);

  // ============================================================================
  // 4. WING 1 (NW): EXECUTIVE & FOUNDER SUITE (-8.5, -5.5)
  // ============================================================================
  const execGroup = new THREE.Group();
  execGroup.position.set(-9.2, 0.42, -6.2);

  // Executive Rug (disjoint Y = 0.02)
  const execRug = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.03, 5.6),
    new THREE.MeshStandardMaterial({ color: 0x132a23, roughness: 0.9 }),
  );
  execRug.position.set(0, 0.015, 0);
  execGroup.add(execRug);

  // Boat-shaped Monolithic Obsidian Conference Table (3-part assembly)
  const boardTableBase1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.6, 0.72, 16),
    brushedGoldMat,
  );
  boardTableBase1.position.set(-1.8, 0.36, 0);
  execGroup.add(boardTableBase1);

  const boardTableBase2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.6, 0.72, 16),
    brushedGoldMat,
  );
  boardTableBase2.position.set(1.8, 0.36, 0);
  execGroup.add(boardTableBase2);

  const boardTableTop = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.12, 2.2),
    obsidianStoneMat,
  );
  boardTableTop.position.set(0, 0.76, 0);
  boardTableTop.castShadow = !isSoftwareGl;
  execGroup.add(boardTableTop);

  const boardTableInlay = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.02, 0.65),
    brushedGoldMat,
  );
  boardTableInlay.position.set(0, 0.83, 0);
  execGroup.add(boardTableInlay);

  // 8 Executive Chairs around the board table
  [-2.1, -0.7, 0.7, 2.1].forEach((cx) => {
    const northChair = createOfficeChair(walnutWoodMat, obsidianStoneMat, brushedGoldMat);
    northChair.position.set(cx, 0, -1.65);
    execGroup.add(northChair);

    const southChair = createOfficeChair(walnutWoodMat, obsidianStoneMat, brushedGoldMat);
    southChair.position.set(cx, 0, 1.65);
    southChair.rotation.y = Math.PI;
    execGroup.add(southChair);
  });

  // Wall-mounted Executive Strategy Screen & Credenza anchored flush to North wall
  const execCredenza = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.85, 0.75), walnutWoodMat);
  execCredenza.position.set(0, 0.425, -5.8);
  execGroup.add(execCredenza);

  const execWallScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 2.1),
    new THREE.MeshBasicMaterial({
      map: createSignboardTexture(
        'VENOM STONE STRATEGY 2026',
        'DROP HYPERLOCAL · 100% JOYA & AMROHA COVERAGE',
        '#10b981',
        '#091526',
        maxAniso,
      ),
    }),
  );
  execWallScreen.position.set(0, 2.4, -6.45);
  execGroup.add(execWallScreen);

  rootGroup.add(execGroup);

  // ============================================================================
  // 5. WING 2 (NE): DROP LIVE DISPATCH & COMMAND HUB (+8.5, -5.5)
  // ============================================================================
  const dispatchGroup = new THREE.Group();
  dispatchGroup.position.set(9.2, 0.42, -6.2);

  // 3-Panel Live Command Wall anchored along North wall
  const cmdWallBacking = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 2.6, 0.25),
    obsidianStoneMat,
  );
  cmdWallBacking.position.set(0, 2.2, -6.35);
  dispatchGroup.add(cmdWallBacking);

  const cmdScreenTex = createSignboardTexture(
    'DROP LIVE DISPATCH · JOYA',
    'SLA: 11.4 MIN AVG · ACTIVE EV FLEET: 48 RIDERS',
    '#10b981',
    '#041f18',
    maxAniso,
  );
  const cmdScreenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8.2, 2.2),
    new THREE.MeshBasicMaterial({ map: cmdScreenTex }),
  );
  cmdScreenMesh.position.set(0, 2.2, -6.2);
  dispatchGroup.add(cmdScreenMesh);

  // 6 Dispatch Operator Workstations (2 rows of 3 consoles)
  [-2.6, 0, 2.6].forEach((dx) => {
    [-2.4, 0.8].forEach((dz) => {
      const desk = new THREE.Group();
      desk.position.set(dx, 0, dz);

      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.95), obsidianStoneMat);
      deskTop.position.y = 0.74;
      desk.add(deskTop);

      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.85), chromeMat);
      leftLeg.position.set(-0.85, 0.36, 0);
      desk.add(leftLeg);

      const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.85), chromeMat);
      rightLeg.position.set(0.85, 0.36, 0);
      desk.add(rightLeg);

      // Dual Widescreen Monitors
      [-0.42, 0.42].forEach((mx) => {
        const monitor = new THREE.Mesh(
          new THREE.BoxGeometry(0.74, 0.44, 0.05),
          glowingScreenMat,
        );
        monitor.position.set(mx, 1.08, -0.25);
        desk.add(monitor);
      });

      const opChair = createOfficeChair(dropEmeraldMat, obsidianStoneMat, chromeMat);
      opChair.position.set(0, 0, 0.75);
      opChair.rotation.y = Math.PI;
      desk.add(opChair);

      dispatchGroup.add(desk);
    });
  });

  rootGroup.add(dispatchGroup);

  // ============================================================================
  // 6. WING 3 (SW): PRODUCT & CLOUD ENGINEERING LAB (-8.5, +5.0)
  // ============================================================================
  const engGroup = new THREE.Group();
  engGroup.position.set(-9.2, 0.42, 5.2);

  // Glass-Enclosed Edge Server Rack Cluster (4 multi-part server cabinets)
  for (let i = 0; i < 4; i++) {
    const rack = new THREE.Group();
    rack.position.set(-5.6, 0, -2.8 + i * 1.65);

    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.3, 1.15), obsidianStoneMat);
    cabinet.position.y = 1.15;
    rack.add(cabinet);

    // Emerald LED telemetry strips on server rack face
    for (let bar = 0; bar < 4; bar++) {
      const ledBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.12, 0.85),
        glowingScreenMat,
      );
      ledBar.position.set(0.56, 0.55 + bar * 0.45, 0);
      rack.add(ledBar);
    }
    engGroup.add(rack);
  }

  // 2 Quad Engineering Workbench Pods
  [-1.2, 2.6].forEach((podX) => {
    const pod = new THREE.Group();
    pod.position.set(podX, 0, 0);

    const tableSurface = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 4.4), warmLimestoneMat);
    tableSurface.position.y = 0.75;
    pod.add(tableSurface);

    const privacyDivider = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 4.1), deepTealMat);
    privacyDivider.position.set(0, 1.0, 0);
    pod.add(privacyDivider);

    [-1.1, 1.1].forEach((zOff) => {
      const chairL = createOfficeChair(obsidianStoneMat, chromeMat, brushedGoldMat);
      chairL.position.set(-1.55, 0, zOff);
      chairL.rotation.y = Math.PI / 2;
      pod.add(chairL);

      const chairR = createOfficeChair(obsidianStoneMat, chromeMat, brushedGoldMat);
      chairR.position.set(1.55, 0, zOff);
      chairR.rotation.y = -Math.PI / 2;
      pod.add(chairR);
    });

    engGroup.add(pod);
  });

  rootGroup.add(engGroup);

  // ============================================================================
  // 7. WING 4 (SE): JOYA MERCHANT ONBOARDING & PARTNER LOUNGE (+8.5, +5.0)
  // ============================================================================
  const merchantGroup = new THREE.Group();
  merchantGroup.position.set(9.2, 0.42, 5.2);

  // Curved Partner Reception & POS Onboarding Bar
  const receptionDesk = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 1.05, 1.15),
    obsidianStoneMat,
  );
  receptionDesk.position.set(0, 0.525, -2.4);
  merchantGroup.add(receptionDesk);

  const receptionCounterTop = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.12, 1.3),
    brushedGoldMat,
  );
  receptionCounterTop.position.set(0, 1.1, -2.4);
  merchantGroup.add(receptionCounterTop);

  // Partner Collaboration Lounge Sofas & Coffee Table
  const coffeeTable = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.15, 0.42, 24),
    brushedGoldMat,
  );
  coffeeTable.position.set(0, 0.21, 1.6);
  merchantGroup.add(coffeeTable);

  [-2.3, 2.3].forEach((sx) => {
    const sofa = new THREE.Group();
    sofa.position.set(sx, 0, 1.6);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 3.2), deepTealMat);
    seat.position.y = 0.21;
    sofa.add(seat);
    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.85, 3.2),
      deepTealMat,
    );
    backrest.position.set(sx < 0 ? -0.45 : 0.45, 0.425, 0);
    sofa.add(backrest);
    merchantGroup.add(sofa);
  });

  rootGroup.add(merchantGroup);

  // ============================================================================
  // 8. RETRACTABLE / CUTAWAY ARCHITECTURAL ROOF ASSEMBLY (roofGroup)
  // ============================================================================
  const roofMainMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.35,
    transparent: true,
    opacity: 0.08,
  });
  const roofTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd49b27,
    roughness: 0.25,
    metalness: 0.82,
    transparent: true,
    opacity: 0.08,
  });
  const roofSolarMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.18,
    metalness: 0.75,
    transparent: true,
    opacity: 0.08,
  });
  roofMaterials.push(roofMainMat, roofTrimMat, roofSolarMat);

  roofGroup.position.set(0, 19.9, -0.5);

  // Outer Roof Deck Frame (4 slabs around a central 9m x 9m glass atrium skylight)
  const roofNorthSlab = new THREE.Mesh(new THREE.BoxGeometry(37.4, 0.48, 8.2), roofMainMat);
  roofNorthSlab.position.set(0, 0, -8.6);
  roofGroup.add(roofNorthSlab);

  const roofSouthSlab = new THREE.Mesh(new THREE.BoxGeometry(37.4, 0.48, 8.2), roofMainMat);
  roofSouthSlab.position.set(0, 0, 8.6);
  roofGroup.add(roofSouthSlab);

  const roofWestSlab = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.48, 9.0), roofMainMat);
  roofWestSlab.position.set(-11.8, 0, 0);
  roofGroup.add(roofWestSlab);

  const roofEastSlab = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.48, 9.0), roofMainMat);
  roofEastSlab.position.set(11.8, 0, 0);
  roofGroup.add(roofEastSlab);

  // Cornice Gold Perimeter Crown
  const roofCornice = new THREE.Mesh(new THREE.BoxGeometry(38.0, 0.26, 26.2), roofTrimMat);
  roofCornice.position.set(0, 0.28, 0);
  roofGroup.add(roofCornice);

  // Central Pyramid Skylight Crown & Spire
  const skylightFrame = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 6.4, 2.6, 4),
    roofTrimMat,
  );
  skylightFrame.rotation.y = Math.PI / 4;
  skylightFrame.position.set(0, 1.5, 0);
  roofGroup.add(skylightFrame);

  // Solar Array Panels on West & East Roof Decks
  [-13, -9.5, 9.5, 13].forEach((sx) => {
    [-6.5, 0, 6.5].forEach((sz) => {
      const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 4.2), roofSolarMat);
      solarPanel.position.set(sx, 0.42, sz);
      solarPanel.rotation.x = 0.14;
      roofGroup.add(solarPanel);
    });
  });

  rootGroup.add(roofGroup);

  // ============================================================================
  // 9. SOUTH COURTYARD: TIERED FOUNTAIN, OBELISK MONUMENT & DROP EV FLEET BAY
  // ============================================================================
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(0, 0.16, 20.5);
  addContactShadow(0, 20.5, 5.8, 5.8, 0.17);

  // Outer Octagonal Travertine Basin
  const basinOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(4.6, 4.9, 0.65, 16),
    obsidianStoneMat,
  );
  basinOuter.position.y = 0.325;
  fountainGroup.add(basinOuter);

  const basinWater = new THREE.Mesh(
    new THREE.CylinderGeometry(4.25, 4.25, 0.1, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 0.9,
    }),
  );
  basinWater.position.y = 0.58;
  fountainGroup.add(basinWater);

  // Animated Water Ripple Rings
  [1.6, 2.7, 3.6].forEach((radius) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius, radius + 0.12, 32),
      new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.65;
    fountainWaterRings.push(ring);
    fountainGroup.add(ring);
  });

  // Tier 2 Bowl & Central Golden Obelisk Spire
  const tier2Bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 1.3, 0.95, 16),
    brushedGoldMat,
  );
  tier2Bowl.position.y = 1.1;
  fountainGroup.add(tier2Bowl);

  const obeliskShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.72, 4.6, 4),
    obsidianStoneMat,
  );
  obeliskShaft.position.y = 3.6;
  obeliskShaft.rotation.y = Math.PI / 4;
  obeliskShaft.castShadow = !isSoftwareGl;
  fountainGroup.add(obeliskShaft);

  const obeliskPyramidion = new THREE.Mesh(
    new THREE.ConeGeometry(0.46, 1.1, 4),
    brushedGoldMat,
  );
  obeliskPyramidion.position.y = 6.45;
  obeliskPyramidion.rotation.y = Math.PI / 4;
  fountainGroup.add(obeliskPyramidion);

  rootGroup.add(fountainGroup);

  // DROP EV Scooter Charging & Dispatch Bay (East Forecourt: X = 17.5, Z = 20.5)
  const fleetBayGroup = new THREE.Group();
  fleetBayGroup.position.set(17.5, 0.16, 20.5);
  addContactShadow(17.5, 20.5, 6.2, 4.5, 0.17);

  const bayPad = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.12, 6.8), obsidianStoneMat);
  bayPad.position.y = 0.06;
  fleetBayGroup.add(bayPad);

  // Cantilevered Emerald & Gold Solar Canopy
  [-4.2, 0, 4.2].forEach((postX) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.4, 12), deepBronzeMat);
    post.position.set(postX, 1.7, -2.6);
    fleetBayGroup.add(post);
  });

  const bayCanopy = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.24, 5.4), dropEmeraldMat);
  bayCanopy.position.set(0, 3.45, -0.6);
  bayCanopy.rotation.x = 0.08;
  fleetBayGroup.add(bayCanopy);

  const baySignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 1.25),
    new THREE.MeshBasicMaterial({
      map: createSignboardTexture(
        'DROP EV DISPATCH BAY',
        'ONE APP FOR EVERYTHING LOCAL · JOYA',
        '#10b981',
        '#0f172a',
        maxAniso,
      ),
    }),
  );
  baySignMesh.position.set(0, 4.25, 1.8);
  fleetBayGroup.add(baySignMesh);

  // 5 Parked DROP EV Scooters in charging stalls
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  [-3.6, -1.8, 0, 1.8, 3.6].forEach((sx) => {
    const parkedScooter = createDropDeliveryScooter(
      dropEmeraldMat,
      obsidianStoneMat,
      brushedGoldMat,
      chromeMat,
      headlightMat,
    );
    parkedScooter.position.set(sx, 0.12, -0.3);
    fleetBayGroup.add(parkedScooter);
  });

  rootGroup.add(fleetBayGroup);

  // Active Moving DROP Delivery Scooters along the Campus Drive & NH-9 Joya Corridor
  for (let i = 0; i < 4; i++) {
    const riderScooter = createDropDeliveryScooter(
      dropEmeraldMat,
      obsidianStoneMat,
      brushedGoldMat,
      chromeMat,
      headlightMat,
    );
    rootGroup.add(riderScooter);
    activeScooters.push({
      group: riderScooter,
      laneIndex: i % 2,
      progress: i * 0.25,
      speed: 0.08 + (i % 2) * 0.025,
      boostTimer: 0,
    });
  }

  // ============================================================================
  // 10. INSTANCED CAMPUS CYPRESS & NEEM TREES + ARCHITECTURAL BOLLARD LIGHTS
  // ============================================================================
  const treePositions: Array<[number, number, number]> = [
    [-28, 0, -18],
    [-28, 0, -6],
    [-28, 0, 6],
    [-28, 0, 18],
    [-28, 0, 27],
    [28, 0, -18],
    [28, 0, -6],
    [28, 0, 6],
    [28, 0, 18],
    [28, 0, 27],
    [-22, 0, -24],
    [-11, 0, -24],
    [0, 0, -24],
    [11, 0, -24],
    [22, 0, -24],
    [-35, 0, -12],
    [-35, 0, 2],
    [-35, 0, 15],
    [35, 0, -12],
    [35, 0, 2],
    [35, 0, 15],
    [-16, 0, 27],
    [16, 0, 27],
    [-24, 0, 27],
  ];

  const trunkInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.22, 0.34, 1.8, 8),
    walnutWoodMat,
    treePositions.length,
  );
  const lowerCanopyInst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.65, 3.2, 10),
    deepTealMat,
    treePositions.length,
  );
  const upperCanopyInst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.2, 2.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 }),
    treePositions.length,
  );

  const tintColor = new THREE.Color();
  treePositions.forEach(([tx, ty, tz], idx) => {
    const scale = 0.88 + ((idx * 37) % 28) / 100;
    dummy.position.set(tx, ty + 0.9 * scale, tz);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.set(0, idx * 0.7, 0);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, ty + 2.7 * scale, tz);
    dummy.updateMatrix();
    lowerCanopyInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, ty + 4.3 * scale, tz);
    dummy.updateMatrix();
    upperCanopyInst.setMatrixAt(idx, dummy.matrix);

    tintColor.setHSL(0.36 + (idx % 4) * 0.015, 0.58, 0.32 + (idx % 3) * 0.04);
    lowerCanopyInst.setColorAt(idx, tintColor);
  });

  trunkInst.computeBoundingSphere();
  lowerCanopyInst.computeBoundingSphere();
  upperCanopyInst.computeBoundingSphere();
  rootGroup.add(trunkInst, lowerCanopyInst, upperCanopyInst);

  // Courtyard Warm Architectural Lamp Posts (4 PointLights within 4-6 budget)
  const lampCoords: Array<[number, number]> = [
    [-9.5, 16.5],
    [9.5, 16.5],
    [-9.5, 25.5],
    [9.5, 25.5],
  ];
  lampCoords.forEach(([lx, lz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 3.2, 8), brushedGoldMat);
    post.position.set(lx, 1.76, lz);
    rootGroup.add(post);

    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef3c7 }),
    );
    lantern.position.set(lx, 3.45, lz);
    rootGroup.add(lantern);

    const ptLight = new THREE.PointLight(0xfbbf24, 0.8, 18);
    ptLight.position.set(lx, 3.6, lz);
    lampLights.push(ptLight);
    rootGroup.add(ptLight);
  });

  // ============================================================================
  // 11. INTERACTIVE 3D ZONE HITBOXES & FLOOR BEACON RINGS FOR RAYCASTING
  // ============================================================================
  const zoneHitSpecs: Array<{
    id: CampusZoneId;
    pos: [number, number, number];
    size: [number, number, number];
  }> = [
    { id: 'overview', pos: [0, 1.8, -0.5], size: [6.5, 3.2, 6.5] },
    { id: 'executive', pos: [-9.2, 1.8, -6.2], size: [12, 3.2, 9.5] },
    { id: 'dispatch', pos: [9.2, 1.8, -6.2], size: [12, 3.2, 9.5] },
    { id: 'engineering', pos: [-9.2, 1.8, 5.2], size: [12, 3.2, 9.5] },
    { id: 'merchant', pos: [9.2, 1.8, 5.2], size: [12, 3.2, 9.5] },
    { id: 'courtyard', pos: [4.5, 1.8, 20.5], size: [26, 4.0, 12] },
  ];

  const invisibleHitMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  zoneHitSpecs.forEach(({ id, pos, size }) => {
    const hitBox = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), invisibleHitMat);
    hitBox.position.set(pos[0], pos[1], pos[2]);
    hitBox.userData.zoneId = id;
    interactables.push(hitBox);
    rootGroup.add(hitBox);

    // Subtle Gold Beacon Ring on the floor of each zone
    const beaconRing = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 1.68, 32),
      new THREE.MeshBasicMaterial({
        color: 0xd49b27,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.set(pos[0], 0.46, pos[2]);
    zoneBeaconRings.set(id, beaconRing);
    rootGroup.add(beaconRing);
  });

  return {
    rootGroup,
    roofGroup,
    roofMaterials,
    interactables,
    zoneBeaconRings,
    holoRingGroup,
    fountainWaterRings,
    activeScooters,
    windowEmissiveMaterials,
    lampLights,
  };
}
