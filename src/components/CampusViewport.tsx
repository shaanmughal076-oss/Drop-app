import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CampusZoneId,
  INITIAL_ORBIT_TUTORIAL_STATE,
  LightingPreset,
  ORBIT_TUTORIAL_COPY,
  OrbitTutorialState,
  calculateRoofElevation,
  computeZoneCameraPose,
  evaluateOrbitTutorialInteraction,
} from '../domain/campusData';
import { buildVenomStoneCampusScene } from '../three/CampusSceneBuilder';
import { soundEngine } from '../utils/soundEffects';

export interface CampusViewportProps {
  activeZone: CampusZoneId;
  cutawayFactor: number;
  lightingPreset: LightingPreset;
  dispatchPulseCount: number;
  onSelectZone: (zoneId: CampusZoneId) => void;
}

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _mouseNdc = new THREE.Vector2();

export const CampusViewport: React.FC<CampusViewportProps> = ({
  activeZone,
  cutawayFactor,
  lightingPreset,
  dispatchPulseCount,
  onSelectZone,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [tutorialState, setTutorialState] = useState<OrbitTutorialState>(
    INITIAL_ORBIT_TUTORIAL_STATE,
  );

  // Store latest props & callbacks in refs so React UI updates never recreate WebGLRenderer
  const activeZoneRef = useRef<CampusZoneId>(activeZone);
  const cutawayRef = useRef<number>(cutawayFactor);
  const lightingRef = useRef<LightingPreset>(lightingPreset);
  const onSelectZoneRef = useRef(onSelectZone);
  const cameraTransitionActiveRef = useRef<boolean>(true);
  const dispatchPulseRef = useRef<number>(dispatchPulseCount);

  // Auto-fade the initial tutorial overlay after 18 seconds if untouched
  useEffect(() => {
    if (!tutorialState.visible) return;
    const timer = window.setTimeout(() => {
      setTutorialState((prev) =>
        evaluateOrbitTutorialInteraction(prev, { type: 'timeout' }),
      );
    }, 18000);
    return () => window.clearTimeout(timer);
  }, [tutorialState.visible]);

  useEffect(() => {
    if (activeZoneRef.current !== activeZone) {
      activeZoneRef.current = activeZone;
      cameraTransitionActiveRef.current = true;
    }
  }, [activeZone]);

  useEffect(() => {
    cutawayRef.current = cutawayFactor;
  }, [cutawayFactor]);

  useEffect(() => {
    lightingRef.current = lightingPreset;
  }, [lightingPreset]);

  useEffect(() => {
    onSelectZoneRef.current = onSelectZone;
  }, [onSelectZone]);

  useEffect(() => {
    dispatchPulseRef.current = dispatchPulseCount;
  }, [dispatchPulseCount]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Scene, Fog & Studio Environment Reflection (RoomEnvironment)
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xdce5ef);
    scene.background = skyColor;
    scene.fog = new THREE.Fog(0xdce5ef, 48, 138);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 240);
    const initialPose = computeZoneCameraPose(activeZoneRef.current, cutawayRef.current);
    camera.position.set(...initialPose.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialPose.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 8;
    controls.maxDistance = 85;
    controls.update();

    // Cancel scripted camera transition if user manually grabs OrbitControls
    const onControlStart = () => {
      cameraTransitionActiveRef.current = false;
    };
    controls.addEventListener('start', onControlStart);

    // 4. Studio 3-Point & Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x86efac, 0.95);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(28, 42, 26);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 110;
    const d = 34;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.85);
    rimLight.position.set(-26, 22, -24);
    scene.add(rimLight);

    // 5. Build Venom Stone Campus & Open-Roof HQ Scene
    const built = buildVenomStoneCampusScene(renderer, isSoftwareGl);
    scene.add(built.rootGroup);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 6. Raycasting for Interactive 3D Zone Selection & Orbit Drag Tutorial Tracking
    const raycaster = new THREE.Raycaster();
    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastDragX = 0;
    let lastDragY = 0;
    let isPointerDragging = false;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      isPointerDragging = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDragging) return;
      const stepDist = Math.hypot(e.clientX - lastDragX, e.clientY - lastDragY);
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      if (stepDist > 1.5) {
        setTutorialState((prev) =>
          prev.visible
            ? evaluateOrbitTutorialInteraction(prev, {
                type: 'drag',
                dragDeltaPx: stepDist,
              })
            : prev,
        );
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isPointerDragging = false;
      const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (dist > 6) return; // Ignore drag gestures

      const rect = renderer.domElement.getBoundingClientRect();
      _mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_mouseNdc, camera);
      const hits = raycaster.intersectObjects(built.interactables, false);
      if (hits.length > 0) {
        const hitZone = hits[0].object.userData.zoneId as CampusZoneId | undefined;
        if (hitZone) {
          soundEngine.playUiClick(580);
          cameraTransitionActiveRef.current = true;
          setTutorialState((prev) =>
            evaluateOrbitTutorialInteraction(prev, { type: 'wing-click' }),
          );
          onSelectZoneRef.current(hitZone);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerup', onPointerUp);

    // Keyboard WASD / Arrow panning support on window
    const keysPressed: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      keysPressed[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Resize listener
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResize);

    // 7. Render Loop with Software-WebGL afterDraw Pacing
    let frameId = 0;
    let lastPulseSeen = dispatchPulseRef.current;
    const startTimeMs = performance.now();
    let prevTimeMs = startTimeMs;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const nowMs = performance.now();
      const rawDelta = (nowMs - prevTimeMs) / 1000;
      prevTimeMs = nowMs;
      const dt = Math.min(Math.max(rawDelta, 0.001), 0.1);
      const elapsed = (nowMs - startTimeMs) / 1000;

      // Check if a new order was dispatched to boost the scooters
      if (dispatchPulseRef.current !== lastPulseSeen) {
        lastPulseSeen = dispatchPulseRef.current;
        built.activeScooters.forEach((sc) => {
          sc.boostTimer = 3.5;
        });
      }

      // Apply Lighting Preset smoothly
      const preset = lightingRef.current;
      const targetSkyHex =
        preset === 'daylight' ? 0xdce5ef : preset === 'golden' ? 0xfed7aa : 0x0f172a;
      const targetKeyIntensity =
        preset === 'daylight' ? 2.2 : preset === 'golden' ? 2.5 : 0.45;
      const targetHemiIntensity =
        preset === 'daylight' ? 0.95 : preset === 'golden' ? 0.85 : 0.35;
      const targetLampIntensity = preset === 'night' ? 2.6 : preset === 'golden' ? 1.5 : 0.4;

      skyColor.lerp(new THREE.Color(targetSkyHex), 1 - Math.exp(-5 * dt));
      scene.background = skyColor;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.copy(skyColor);
      }
      keyLight.intensity = THREE.MathUtils.damp(
        keyLight.intensity,
        targetKeyIntensity,
        5,
        dt,
      );
      hemiLight.intensity = THREE.MathUtils.damp(
        hemiLight.intensity,
        targetHemiIntensity,
        5,
        dt,
      );
      built.lampLights.forEach((l) => {
        l.intensity = THREE.MathUtils.damp(l.intensity, targetLampIntensity, 5, dt);
      });

      // Roof Cutaway Kinematics (Open-Roof vs Closed-Roof)
      const roofState = calculateRoofElevation(cutawayRef.current, 5.4);
      built.roofGroup.position.y = THREE.MathUtils.damp(
        built.roofGroup.position.y,
        roofState.roofY,
        7,
        dt,
      );
      built.roofMaterials.forEach((mat) => {
        mat.opacity = THREE.MathUtils.damp(mat.opacity, roofState.roofOpacity, 7, dt);
        mat.depthWrite = mat.opacity > 0.85;
      });
      built.roofGroup.visible = built.roofGroup.position.y < 19.2;

      // Highlight active zone floor beacon ring
      built.zoneBeaconRings.forEach((ringMesh, zoneId) => {
        const isSelected = zoneId === activeZoneRef.current;
        const scale = isSelected ? 1.15 + Math.sin(elapsed * 3.5) * 0.08 : 0.88;
        ringMesh.scale.set(scale, scale, 1);
        const mat = ringMesh.material as THREE.MeshBasicMaterial;
        mat.color.setHex(isSelected ? 0x10b981 : 0xd49b27);
        mat.opacity = isSelected ? 0.92 : 0.38;
      });

      // Rotate Central Joya 3D Holographic Command Ring
      built.holoRingGroup.rotation.y = elapsed * 0.55;
      built.holoRingGroup.position.y = 1.65 + Math.sin(elapsed * 2.2) * 0.06;

      // Animate Courtyard Fountain Water Rings
      built.fountainWaterRings.forEach((ring, idx) => {
        const s = 0.92 + ((elapsed * 0.45 + idx * 0.3) % 0.35);
        ring.scale.set(s, s, 1);
      });

      // Animate Active DROP EV Delivery Scooters along Joya NH-9 & Campus Forecourt
      built.activeScooters.forEach((sc, idx) => {
        if (sc.boostTimer > 0) {
          sc.boostTimer = Math.max(0, sc.boostTimer - dt);
        }
        const speedMult = sc.boostTimer > 0 ? 2.4 : 1.0;
        sc.progress = (sc.progress + sc.speed * speedMult * dt) % 1;

        if (sc.laneIndex === 0) {
          // Eastbound NH-9 Highway lane
          const x = -52 + sc.progress * 104;
          sc.group.position.set(x, 0.12, 32.3);
          sc.group.rotation.y = Math.PI / 2;
        } else {
          // Westbound NH-9 / Campus Dispatch loop
          const x = 52 - sc.progress * 104;
          sc.group.position.set(x, 0.12, 35.7 - (idx % 2) * 0.4);
          sc.group.rotation.y = -Math.PI / 2;
        }
      });

      // Keyboard WASD / Arrow camera pan support
      const panSpeed = 16 * dt;
      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) {
        cameraTransitionActiveRef.current = false;
        camera.position.z -= panSpeed;
        controls.target.z -= panSpeed;
      }
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) {
        cameraTransitionActiveRef.current = false;
        camera.position.z += panSpeed;
        controls.target.z += panSpeed;
      }
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) {
        cameraTransitionActiveRef.current = false;
        camera.position.x -= panSpeed;
        controls.target.x -= panSpeed;
      }
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) {
        cameraTransitionActiveRef.current = false;
        camera.position.x += panSpeed;
        controls.target.x += panSpeed;
      }

      // Smooth Exponential Camera Damping toward selected Zone Pose
      if (cameraTransitionActiveRef.current) {
        const pose = computeZoneCameraPose(activeZoneRef.current, cutawayRef.current);
        _targetPos.set(...pose.position);
        _targetLook.set(...pose.target);

        const alpha = 1 - Math.exp(-5.5 * dt);
        camera.position.lerp(_targetPos, alpha);
        controls.target.lerp(_targetLook, alpha);

        if (
          camera.position.distanceToSquared(_targetPos) < 0.04 &&
          controls.target.distanceToSquared(_targetLook) < 0.04
        ) {
          cameraTransitionActiveRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  const dragProgressPct = Math.min(
    100,
    Math.round((tutorialState.dragDistancePx / 14) * 100),
  );

  return (
    <>
      <div
        ref={canvasMountRef}
        data-testid="campus-webgl-viewport"
        className="fixed inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Corporate Campus and Open-Roof HQ of Venom Stone Company"
      />

      {/* Subtle, Animated Interactive 'Drag to Orbit' 3D Navigation Tutorial Overlay */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 sm:bottom-auto sm:left-auto sm:translate-x-0 sm:top-14 sm:right-3.5 z-10 pointer-events-none w-[92vw] max-w-[360px]">
        {tutorialState.visible ? (
          <div
            data-testid="orbit-tutorial-overlay"
            role="status"
            aria-live="polite"
            className="animate-tutorial-enter rounded-xl bg-[#0f172a]/90 border border-emerald-500/40 px-3.5 py-2.5 text-white shadow-xl"
          >
            <div className="flex items-center gap-3">
              {/* Animated 3D Orbit Ring & Gliding Cursor SVG */}
              <div className="shrink-0 w-14 h-11 flex items-center justify-center rounded-lg bg-slate-900/90 border border-slate-800">
                <svg
                  data-testid="orbit-tutorial-svg"
                  viewBox="0 0 64 44"
                  className="w-13 h-9 overflow-visible"
                  aria-hidden="true"
                >
                  {/* Perspective 360 Orbit Ellipse */}
                  <ellipse
                    cx="32"
                    cy="24"
                    rx="24"
                    ry="9"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                  {/* Active Highlighted Front Orbit Arc */}
                  <path
                    d="M 10 24 A 24 9 0 0 0 54 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Left & Right Directional Arrow Tips */}
                  <path
                    d="M 13 20 L 8 24 L 14 27"
                    fill="none"
                    stroke="#d49b27"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 51 20 L 56 24 L 50 27"
                    fill="none"
                    stroke="#d49b27"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Animated Gliding Cursor Node */}
                  <g className="animate-orbit-glide">
                    <circle
                      cx="32"
                      cy="31"
                      r="4.5"
                      fill="#d49b27"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    <path d="M 32 14 L 29 21 L 35 21 Z" fill="#10b981" />
                  </g>
                </svg>
              </div>

              {/* Headline & Subtext */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-wide text-[#10b981]">
                    {ORBIT_TUTORIAL_COPY.headline}
                  </span>
                  <button
                    type="button"
                    data-testid="dismiss-orbit-tutorial"
                    onClick={() => {
                      soundEngine.playUiClick(520);
                      setTutorialState((prev) =>
                        evaluateOrbitTutorialInteraction(prev, {
                          type: 'dismiss',
                        }),
                      );
                    }}
                    className="pointer-events-auto px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    Got it
                  </button>
                </div>
                <p className="text-[11px] text-slate-200 leading-snug mt-0.5">
                  {ORBIT_TUTORIAL_COPY.subheadline}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {ORBIT_TUTORIAL_COPY.secondaryCues}
                </p>
              </div>
            </div>

            {/* Subtle Interactive Drag Progress Bar */}
            {dragProgressPct > 0 && (
              <div className="mt-2 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#10b981] transition-all duration-150"
                  style={{ width: `${dragProgressPct}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex justify-end animate-tutorial-enter">
            <button
              type="button"
              data-testid="replay-orbit-tutorial"
              onClick={() => {
                soundEngine.playUiClick(560);
                setTutorialState((prev) =>
                  evaluateOrbitTutorialInteraction(prev, { type: 'replay' }),
                );
              }}
              aria-label="Show Drag to Orbit 3D Tutorial"
              className="pointer-events-auto px-2.5 py-1 rounded-lg bg-[#0f172a]/85 hover:bg-[#0f172a] border border-slate-700/80 text-[11px] font-medium text-slate-300 hover:text-[#10b981] shadow transition-colors cursor-pointer"
            >
              3D Orbit Guide
            </button>
          </div>
        )}
      </div>
    </>
  );
};

