// Application Controller: State, API Sync, UI Rendering, Compatibility, Thermals, Benchmarks, 3D Control Loop
(function () {
  const activeBuild = {
    cpu: null,
    gpu: null,
    motherboard: null,
    memory: null,
    storage: null,
    cooler: null,
    psu: null,
    chassis: null,
  };
  let currentResolution = '1440p';
  let allComponents = [];
  let liveMarketQuotes = {};
  let lastVerifyData = {
    isCompatible: true,
    totalCostUsd: 0,
    estimatedPeakWatts: 50,
    recommendedPsuWatts: 550,
    statusSummary: 'Ready',
    warnings: [],
    errors: [],
  };
  let lastPowerData = {
    idleWatts: 45,
    loadWatts: 380,
    peakWatts: 580,
    transientSpikeWatts: 760,
    recommendedPsuWatts: 850,
    efficiencyPct: 90,
    annualCostKwh: 85,
    cpuIdleTempC: 32,
    cpuLoadTempC: 54,
    gpuIdleTempC: 34,
    gpuLoadTempC: 62,
    noiseDecibelsIdle: 24,
    noiseDecibelsLoad: 36,
    thermalThrottling: false,
  };

  let crawlerTerminalLogs = [
    '[INIT] Open Hardware Dataset Engine Ready',
    '[INDEX] Linked to docyx/pc-part-dataset (45,951 retail records)',
    '[STATUS] Catalog Parts Matched Against Live Scraped Quotes',
  ];
  let isCrawlingLive = false;
  let applyRealMarketPrices = false;
  let rawJsonExpanded = {};
  let currentBenchmarkList = [];
  let activeTab = 'chosen';
  let activeCategory = 'all';
  let compatibleOnlyFilter = false;
  let exploded = false;
  let explodeProgress = 0;
  let wireframeMode = false;
  let thermalMode = false;
  let showCase = false;
  let verticalGpu = false;
  let stressActive = false;
  let showLabels = false;
  let currentCpuTemp = 48;
  let currentGpuTemp = 60;
  let activeLightMode = 'studio';
  let selectedFanProfile = 'balanced';
  let aioDisplayMetric = 0;

  // Verified Steam Store Header Artwork
  const STEAM_GAME_ASSETS = {
    'Sons of the Forest': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1326400/header.jpg',
    'Cyberpunk 2077': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    'Black Myth: Wukong': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
    'Counter-Strike 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    'Red Dead Redemption 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg',
    'Grand Theft Auto V': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg',
    'Elden Ring': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    "Baldur's Gate 3": 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    'Helldivers 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg',
    'Call of Duty: Warzone': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1938090/header.jpg',
    'Apex Legends': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg',
    'Forza Horizon 5': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg',
    'Starfield': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg',
    'Hogwarts Legacy': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg',
    'Shadow of the Tomb Raider': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/750920/header.jpg',
    "Marvel's Spider-Man Remastered": 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg',
    'God of War': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg',
    'Rainbow Six Siege': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/359550/header.jpg',
    'Overwatch 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg',
    'The Witcher 3 Next-Gen': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
    'Resident Evil 4 Remake': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg',
    'Warhammer 40,000: Space Marine 2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2183900/header.jpg',
    'Ghost of Tsushima': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/header.jpg',
    'The Last of Us Part I': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg',
    'Horizon Forbidden West': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2420110/header.jpg',
    'Palworld': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg',
    "Dragon's Dogma 2": 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2054970/header.jpg',
    'Dying Light 2 Stay Human': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/534380/header.jpg',
    'Dead Space Remake': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1693980/header.jpg',
    'Microsoft Flight Simulator': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1250410/header.jpg',
    'ARK: Survival Ascended': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2399830/header.jpg',
    'Diablo IV': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2344520/header.jpg',
    'DOOM Eternal': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/header.jpg',
    'Hunt: Showdown 1896': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/594650/header.jpg',
  };

  function kindString(comp) {
    if (!comp) return '';
    return typeof comp.kind === 'string'
      ? comp.kind.toLowerCase()
      : ['processor', 'graphics_card', 'motherboard', 'memory', 'storage', 'power_supply', 'cooler', 'chassis'][comp.kind];
  }

  function slotKeyForComp(comp) {
    const map = {
      processor: 'cpu',
      graphics_card: 'gpu',
      motherboard: 'motherboard',
      memory: 'memory',
      storage: 'storage',
      power_supply: 'psu',
      cooler: 'cooler',
      chassis: 'chassis',
    };
    return map[kindString(comp)] || 'cpu';
  }

  // Client-side pre-check so Catalog shows compatibility BEFORE installing
  function checkCandidateCompatibility(candidate) {
    const test = Object.assign({}, activeBuild);
    test[slotKeyForComp(candidate)] = candidate;
    const issues = [];

    if (test.cpu && test.motherboard && test.cpu.socket !== test.motherboard.socket) {
      issues.push('Socket Mismatch');
    }
    if (test.memory && test.motherboard && test.memory.memType !== test.motherboard.memType) {
      issues.push('RAM Type Mismatch');
    }
    if (test.chassis && test.motherboard && test.chassis.formFactor === 'mini_itx' && test.motherboard.formFactor !== 'mini_itx') {
      issues.push('Board Too Large for ITX Case');
    }
    if (test.chassis && test.gpu && test.gpu.lengthMm > test.chassis.lengthMm) {
      issues.push('GPU Exceeds Case Length');
    }
    if (test.chassis && test.cooler) {
      if (test.cooler.coolerType === 'air' && test.cooler.heightMm > test.chassis.heightMm) {
        issues.push('Cooler Too Tall for Case');
      }
      if (test.chassis.formFactor === 'mini_itx' && (test.cooler.coolerType === 'liquid_aio_360' || test.cooler.coolerType === 'liquid_aio_420')) {
        issues.push('360mm Rad Fails ITX Fit');
      }
    }
    if (test.psu) {
      const peak = 50 +
        (test.cpu ? test.cpu.tdpWatts : 0) +
        (test.gpu ? test.gpu.tdpWatts : 0) +
        (test.motherboard ? test.motherboard.tdpWatts : 0) +
        (test.memory ? test.memory.tdpWatts : 0) +
        (test.storage ? test.storage.tdpWatts : 0) +
        (test.cooler ? test.cooler.tdpWatts : 0);
      if (test.psu.psuWattage < peak) {
        issues.push('PSU Below Peak Draw');
      }
    }
    return issues;
  }

  // Initialize 3D Scene
  const container = document.getElementById('viewport-container');
  const sceneCtx = window.Scene3D.initScene(container);
  const { scene, camera, renderer, controls, benchGroup, rearBladesGroup } = sceneCtx;

  const meshNodes = {
    motherboard: null,
    cpu: null,
    cooler: null,
    coolerFanList: [],
    chassisFanList: [rearBladesGroup],
    caseFanList: [],
    ram: null,
    gpu: null,
    gpuFanList: [],
    gpuHeatpipes: [],
    gpuLogoMat: null,
    psu: null,
    storage: null,
    caseEnclosure: null,
    caseLeftDoor: null,
    caseFront: null,
    caseTop: null,
    caseRight: null,
    aioCanvas: null,
    aioTexture: null,
    aioScreenMesh: null,
  };

  let isCameraTransitioning = false;
  let activeCamPreset = 'iso';
  let activeRgbTheme = '#10f06a';
  const initCamFrame = window.Scene3D.getFramingPreset('iso', {
    sidebarOpen: true,
    trayOpen: true,
    viewportWidth: window.innerWidth,
  });
  const targetCameraPos = initCamFrame.pos.clone();
  const targetCameraTarget = initCamFrame.target.clone();

  function getLayoutState() {
    const sb = document.getElementById('workstation-sidebar');
    const tr = document.getElementById('benchmark-tray');
    return {
      sidebarOpen: sb ? !sb.classList.contains('collapsed') : true,
      trayOpen: tr ? !tr.classList.contains('collapsed') : true,
      viewportWidth: window.innerWidth,
    };
  }

  function refreshCameraFraming(preset) {
    if (!preset) return;
    const f = window.Scene3D.getFramingPreset(preset, getLayoutState());
    smoothTransitionCamera(f.pos, f.target);
  }

  function applyCurrentRgbColor() {
    if (activeRgbTheme === 'rainbow') return;
    window.Scene3D.applyRgbSyncColor(sceneCtx, activeRgbTheme);
    if (meshNodes.gpuLogoMat && !thermalMode && !stressActive) {
      meshNodes.gpuLogoMat.color.set(activeRgbTheme);
      meshNodes.gpuLogoMat.emissive.set(activeRgbTheme);
    }
  }

  function smoothTransitionCamera(newPos, newTarget) {
    targetCameraPos.copy(newPos);
    if (newTarget) targetCameraTarget.copy(newTarget);
    isCameraTransitioning = true;
  }

  renderer.domElement.addEventListener('pointerdown', () => {
    isCameraTransitioning = false;
    targetCameraPos.copy(camera.position);
    targetCameraTarget.copy(controls.target);
  });

  function animateRollingNumber(element, startVal, endVal, duration, formatter) {
    if (!element) return;
    const start = typeof startVal === 'number' && !isNaN(startVal) ? startVal : 0;
    const end = typeof endVal === 'number' && !isNaN(endVal) ? endVal : 0;
    const fmt = formatter || ((v) => Math.round(v).toString());
    if (Math.abs(end - start) < 0.001) {
      const res = fmt(end);
      if (typeof res === 'string' && res.includes('<')) element.innerHTML = res;
      else element.textContent = res;
      return;
    }
    const startTime = performance.now();
    const diff = end - start;
    function step(now) {
      const progress = Math.min((now - startTime) / (duration || 380), 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = start + diff * ease;
      const out = fmt(val);
      if (typeof out === 'string' && out.includes('<')) element.innerHTML = out;
      else element.textContent = out;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Floating 3D Part Labels with Screen-Space Collision Spread
  const labelAnchors = [
    { id: 'cooler', name: 'CPU COOLER', pos: new THREE.Vector3(-30, 176, -8), compKey: 'cooler' },
    { id: 'cpu', name: 'PROCESSOR', pos: new THREE.Vector3(-30, 170, -34), compKey: 'cpu' },
    { id: 'ram', name: 'MEMORY', pos: new THREE.Vector3(20, 188, -16), compKey: 'memory' },
    { id: 'storage', name: 'NVMe SSD', pos: new THREE.Vector3(-28, 134, -22), compKey: 'storage' },
    { id: 'gpu', name: 'GRAPHICS CARD', pos: new THREE.Vector3(-12, 108, 22), compKey: 'gpu' },
    { id: 'motherboard', name: 'MOTHERBOARD', pos: new THREE.Vector3(16, 86, -34), compKey: 'motherboard' },
    { id: 'psu', name: 'POWER SUPPLY', pos: new THREE.Vector3(-62, 48, 30), compKey: 'psu' },
  ];

  function createSpatialLabels() {
    const el = document.getElementById('labels-container');
    el.innerHTML = '';
    labelAnchors.forEach((anc) => {
      const div = document.createElement('div');
      div.className = 'part-label-tag';
      div.id = 'label-' + anc.id;
      div.innerHTML =
        '<div class="part-label-content"><span class="part-label-dot"></span><span class="part-label-text">' +
        anc.name +
        '</span></div><div class="part-label-arrow"></div>';
      el.appendChild(div);
    });
  }
  createSpatialLabels();

  function updateSpatialLabels() {
    const labelContainer = document.getElementById('labels-container');
    if (!showLabels || wireframeMode) {
      if (labelContainer.style.display !== 'none') labelContainer.style.display = 'none';
      return;
    }
    if (labelContainer.style.display !== 'block') labelContainer.style.display = 'block';

    const projected = [];
    labelAnchors.forEach((anc) => {
      const el = document.getElementById('label-' + anc.id);
      const comp = activeBuild[anc.compKey];
      if (!el) return;
      if (!comp || (anc.id === 'cpu' && activeBuild.cooler)) {
        el.style.opacity = '0';
        return;
      }

      const targetPos = anc.pos.clone();
      if (anc.id === 'gpu') targetPos.z += 75 * explodeProgress;
      if (anc.id === 'cooler') targetPos.z += 52 * explodeProgress;
      if (anc.id === 'ram') targetPos.z += 42 * explodeProgress;
      if (anc.id === 'storage') targetPos.z += 28 * explodeProgress;
      if (anc.id === 'psu') targetPos.x -= 45 * explodeProgress;

      const sp = targetPos.project(camera);
      if (sp.z > 1) {
        el.style.opacity = '0';
        return;
      }
      const x = (sp.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-sp.y * 0.5 + 0.5) * window.innerHeight;
      el.querySelector('.part-label-text').textContent = comp.name;
      projected.push({ el, x, y });
    });

    // Separate overlapping screen-space tags cleanly
    projected.sort((a, b) => a.y - b.y);
    for (let i = 1; i < projected.length; i++) {
      for (let j = 0; j < i; j++) {
        if (Math.abs(projected[i].x - projected[j].x) < 135 && Math.abs(projected[i].y - projected[j].y) < 28) {
          projected[i].y = projected[j].y + 29;
        }
      }
    }
    projected.forEach((p) => {
      p.el.style.left = Math.round(p.x) + 'px';
      p.el.style.top = Math.round(p.y) + 'px';
      p.el.style.opacity = '1';
    });
  }

  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('interact-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 2200);
  }

  function focusOnAnchor(anc) {
    activeCamPreset = null;
    const t = anc.pos.clone();
    const camPos = new THREE.Vector3(t.x + 85, t.y + 42, t.z + 135);
    smoothTransitionCamera(camPos, t);
  }

  // Deep Parent-Chain Raycast Identification
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let clickOrigin = { x: 0, y: 0 };
  const inspectChip = document.getElementById('cursor-inspect-chip');
  const chipTitle = document.getElementById('chip-title');
  const chipSub = document.getElementById('chip-sub');

  function identifyHitPart(obj) {
    let cur = obj;
    while (cur) {
      if (cur === meshNodes.aioScreenMesh) return 'aioScreen';
      if (cur === meshNodes.cooler) return 'cooler';
      if (cur === meshNodes.gpu) return 'gpu';
      if (cur === meshNodes.ram) return 'ram';
      if (cur === meshNodes.storage) return 'storage';
      if (cur === meshNodes.cpu) return 'cpu';
      if (cur === meshNodes.psu) return 'psu';
      if (cur === meshNodes.motherboard) return 'motherboard';
      if (cur === meshNodes.caseEnclosure) return 'case';
      cur = cur.parent;
    }
    return null;
  }

  renderer.domElement.addEventListener('pointerdown', (e) => {
    clickOrigin = { x: e.clientX, y: e.clientY };
  });

  renderer.domElement.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(benchGroup.children, true);
    if (hits.length > 0) {
      const part = identifyHitPart(hits[0].object);
      if (part) {
        const meta = {
          aioScreen: [activeBuild.cooler ? activeBuild.cooler.name : 'AIO Pump OLED', 'Click to cycle OLED telemetry'],
          cooler: [activeBuild.cooler ? activeBuild.cooler.name : 'CPU Cooler', 'Click to focus inspection'],
          gpu: [activeBuild.gpu ? activeBuild.gpu.name : 'Graphics Card', 'Click to focus 3D inspection'],
          ram: [activeBuild.memory ? activeBuild.memory.name : 'Memory', 'Click to focus 3D inspection'],
          storage: [activeBuild.storage ? activeBuild.storage.name : 'NVMe SSD', 'Click to focus 3D inspection'],
          cpu: [activeBuild.cpu ? activeBuild.cpu.name : 'Processor', 'Click to focus 3D inspection'],
          psu: [activeBuild.psu ? activeBuild.psu.name : 'Power Supply', 'Click to focus 3D inspection'],
          motherboard: [activeBuild.motherboard ? activeBuild.motherboard.name : 'Motherboard', 'Click to focus 3D inspection'],
          case: [activeBuild.chassis ? activeBuild.chassis.name : 'PC Case', 'Click to toggle Case Mode'],
        }[part];
        chipTitle.textContent = meta[0];
        chipSub.textContent = meta[1];
        inspectChip.style.display = 'block';
        inspectChip.style.left = e.clientX + 'px';
        inspectChip.style.top = e.clientY + 'px';
        return;
      }
    }
    inspectChip.style.display = 'none';
  });

  renderer.domElement.addEventListener('pointerleave', () => {
    inspectChip.style.display = 'none';
  });

  renderer.domElement.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - clickOrigin.x, e.clientY - clickOrigin.y) > 6) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(benchGroup.children, true);
    if (hits.length === 0) return;

    const part = identifyHitPart(hits[0].object);
    if (!part) return;
    if (part === 'aioScreen' || (part === 'cooler' && activeBuild.cooler && activeBuild.cooler.coolerType !== 'air')) {
      aioDisplayMetric = (aioDisplayMetric + 1) % 3;
      window.Models3D.updateAioLcdDisplay(meshNodes, getSceneThermalState());
      showToast('AIO OLED: ' + ['CPU Package Temp', 'Coolant Loop Temp', 'System Power Draw'][aioDisplayMetric]);
      return;
    }
    if (part === 'case') {
      toggleCaseMode();
      return;
    }
    const anchorKey = part === 'ram' ? 'ram' : part;
    const anc = labelAnchors.find((a) => a.id === anchorKey);
    if (anc) {
      focusOnAnchor(anc);
      showToast('Inspecting: ' + (activeBuild[anc.compKey] ? activeBuild[anc.compKey].name : anc.name));
    }
  });

  function getSceneThermalState() {
    return {
      cpuTemp: currentCpuTemp,
      gpuTemp: currentGpuTemp,
      peakWatts: lastPowerData.peakWatts,
      stressActive,
      fanProfile: selectedFanProfile,
      aioDisplayMetric,
    };
  }

  function update3DScene() {
    const M = window.Models3D;
    const disp = window.Scene3D.disposeObject3D;

    if (thermalMode) {
      window.Scene3D.applyThermalHeatmap(benchGroup, false, {}, meshNodes);
    }

    if (activeBuild.motherboard) M.buildMotherboardMesh(activeBuild.motherboard, benchGroup, meshNodes, disp);
    else if (meshNodes.motherboard) { benchGroup.remove(meshNodes.motherboard); disp(meshNodes.motherboard); meshNodes.motherboard = null; }

    if (activeBuild.cpu) M.buildCpuMesh(activeBuild.cpu, benchGroup, meshNodes, disp);
    else if (meshNodes.cpu) { benchGroup.remove(meshNodes.cpu); disp(meshNodes.cpu); meshNodes.cpu = null; }

    if (activeBuild.memory) M.buildRamMesh(activeBuild.memory, activeBuild.motherboard, benchGroup, meshNodes, disp);
    else if (meshNodes.ram) { benchGroup.remove(meshNodes.ram); disp(meshNodes.ram); meshNodes.ram = null; }

    if (activeBuild.gpu) M.buildGpuMesh(activeBuild.gpu, verticalGpu, benchGroup, meshNodes, disp);
    else if (meshNodes.gpu) { benchGroup.remove(meshNodes.gpu); disp(meshNodes.gpu); meshNodes.gpu = null; }

    if (activeBuild.cooler) M.buildCoolerMesh(activeBuild.cooler, getSceneThermalState(), benchGroup, meshNodes, disp);
    else if (meshNodes.cooler) { benchGroup.remove(meshNodes.cooler); disp(meshNodes.cooler); meshNodes.cooler = null; }

    if (activeBuild.psu) M.buildPsuMesh(activeBuild.psu, benchGroup, meshNodes, disp);
    else if (meshNodes.psu) { benchGroup.remove(meshNodes.psu); disp(meshNodes.psu); meshNodes.psu = null; }

    if (activeBuild.storage) M.buildStorageMesh(activeBuild.storage, benchGroup, meshNodes, disp);
    else if (meshNodes.storage) { benchGroup.remove(meshNodes.storage); disp(meshNodes.storage); meshNodes.storage = null; }

    M.buildCaseMesh(activeBuild.chassis, showCase, benchGroup, meshNodes, disp);
    window.Scene3D.setChassisFormFactor(sceneCtx, !!(showCase && activeBuild.chassis && activeBuild.chassis.id.includes('terra')));
    applyCurrentRgbColor();

    if (wireframeMode) {
      benchGroup.traverse((n) => {
        if (n.isMesh && !n.userData.isGlass && n !== meshNodes.aioScreenMesh) n.material.wireframe = true;
      });
    }
    if (thermalMode) {
      window.Scene3D.applyThermalHeatmap(benchGroup, true, { cpu: currentCpuTemp, gpu: currentGpuTemp }, meshNodes);
    }
  }

  function effectiveTempsFromPower(pData) {
    const profileDelta = selectedFanProfile === 'silent' ? 5 : selectedFanProfile === 'extreme' ? -5 : 0;
    const baseCpu = stressActive ? Math.min(100, pData.cpuLoadTempC + 14) : pData.cpuLoadTempC;
    const baseGpu = stressActive ? Math.min(89, pData.gpuLoadTempC + 11) : pData.gpuLoadTempC;
    return {
      cpu: Math.max(24, baseCpu + profileDelta),
      gpu: Math.max(24, baseGpu + Math.round(profileDelta * 0.7)),
      noise: Math.max(20, (stressActive ? pData.noiseDecibelsLoad + 6 : pData.noiseDecibelsLoad) + (selectedFanProfile === 'silent' ? -6 : selectedFanProfile === 'extreme' ? 5 : 0)),
    };
  }

  function renderCompatPopover() {
    const pop = document.getElementById('compat-popover');
    const list = document.getElementById('compat-pop-list');
    const title = document.getElementById('compat-pop-title');
    if (!pop || !list) return;

    const errs = lastVerifyData.errors || [];
    const warns = lastVerifyData.warnings || [];
    title.textContent = errs.length > 0
      ? errs.length + (errs.length === 1 ? ' Compatibility Issue' : ' Compatibility Issues')
      : warns.length > 0
      ? 'Verified With ' + warns.length + (warns.length === 1 ? ' Advisory' : ' Advisories')
      : 'All Clearances & Envelopes Verified';

    let html = '';
    errs.forEach((e) => {
      html += '<div class="compat-issue-row err"><strong>ERROR:</strong> ' + e + '</div>';
    });
    warns.forEach((w) => {
      html += '<div class="compat-issue-row warn"><strong>NOTICE:</strong> ' + w + '</div>';
    });
    if (errs.length === 0 && warns.length === 0) {
      html = '<div class="compat-issue-row">' + (lastVerifyData.statusSummary || '100% compatible.') + '</div>';
    }
    list.innerHTML = html;
  }

  async function syncBuildAnalysis() {
    const payload = {};
    for (const [k, v] of Object.entries(activeBuild)) {
      if (v) payload[k] = v.id;
    }
    payload.resolution = currentResolution;

    try {
      const [vRes, pRes, bRes] = await Promise.all([
        fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        fetch('/api/power', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        fetch('/api/benchmark', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
      ]);

      const vData = await vRes.json();
      const pData = await pRes.json();
      const bData = await bRes.json();

      lastVerifyData = vData;
      lastPowerData = pData;
      currentBenchmarkList = Array.isArray(bData) ? bData : [];

      let displayCost = vData.totalCostUsd || 0;
      if (applyRealMarketPrices) {
        let realTotal = 0;
        for (const v of Object.values(activeBuild)) {
          if (v) {
            const q = liveMarketQuotes[v.id];
            realTotal += q && q.realPrice ? q.realPrice : v.priceUsd;
          }
        }
        displayCost = realTotal;
      }

      const prevCost = window._currentDisplayCost !== undefined ? window._currentDisplayCost : displayCost;
      window._currentDisplayCost = displayCost;
      const costEl = document.getElementById('telem-cost');
      animateRollingNumber(costEl, prevCost, displayCost, 360, (v) =>
        applyRealMarketPrices
          ? '<span style="color:#10f06a;">$' + Math.round(v).toLocaleString() + '</span>'
          : '$' + Math.round(v).toLocaleString()
      );

      const prevW = window._currentDisplayWatts !== undefined ? window._currentDisplayWatts : vData.estimatedPeakWatts;
      window._currentDisplayWatts = vData.estimatedPeakWatts;
      animateRollingNumber(document.getElementById('telem-power'), prevW, vData.estimatedPeakWatts, 360, (v) => Math.round(v));

      const temps = effectiveTempsFromPower(pData);
      const prevC = currentCpuTemp;
      const prevG = currentGpuTemp;
      currentCpuTemp = temps.cpu;
      currentGpuTemp = temps.gpu;
      animateRollingNumber(document.getElementById('telem-thermal-cpu'), prevC, currentCpuTemp, 360, (v) => Math.round(v));
      animateRollingNumber(document.getElementById('telem-thermal-gpu'), prevG, currentGpuTemp, 360, (v) => Math.round(v));

      const noiseEl = document.getElementById('telem-noise');
      if (noiseEl) noiseEl.textContent = temps.noise;

      const badge = document.getElementById('compat-status-btn');
      const errCount = (vData.errors || []).length;
      const warnCount = (vData.warnings || []).length;
      if (errCount > 0) {
        badge.className = 'compat-badge incompatible';
        badge.textContent = errCount + (errCount === 1 ? ' ISSUE' : ' ISSUES');
      } else if (warnCount > 0) {
        badge.className = 'compat-badge warning';
        badge.textContent = warnCount + (warnCount === 1 ? ' NOTICE' : ' NOTICES');
      } else {
        badge.className = 'compat-badge';
        badge.textContent = 'VERIFIED';
      }

      renderCompatPopover();
      window.Models3D.updateAioLcdDisplay(meshNodes, getSceneThermalState());
      if (thermalMode) {
        window.Scene3D.applyThermalHeatmap(benchGroup, true, { cpu: currentCpuTemp, gpu: currentGpuTemp }, meshNodes);
      }

      renderBenchmarks();
      renderChosenRigView();
      renderBuildSpecView();
      renderThermalBenchView();
      renderCatalog();
    } catch (err) {
      console.warn('Sync error:', err);
    }
  }

  function refreshAllViews() {
    renderChosenRigView();
    renderCatalog();
    renderBuildSpecView();
    renderMarketDealsView();
    renderThermalBenchView();
  }

  function toggleInstall(comp) {
    const slotKey = slotKeyForComp(comp);
    if (activeBuild[slotKey] && activeBuild[slotKey].id === comp.id) {
      activeBuild[slotKey] = null;
      showToast('Removed ' + comp.name);
    } else {
      activeBuild[slotKey] = comp;
      showToast('Installed ' + comp.name);
    }
    update3DScene();
    syncBuildAnalysis();
  }

  function inspectComponent(comp) {
    const slotKey = slotKeyForComp(comp);
    const anc = labelAnchors.find((a) => a.compKey === slotKey);
    if (anc) focusOnAnchor(anc);
    showToast('Viewing ' + comp.name);
  }

  // Render View 0: My Rig
  function renderChosenRigView() {
    const container = document.getElementById('chosen-rig-container');
    if (!container) return;

    const slots = [
      { key: 'cpu', label: 'Processor (CPU)', cat: 'cpu' },
      { key: 'gpu', label: 'Graphics Card (GPU)', cat: 'gpu' },
      { key: 'motherboard', label: 'Motherboard', cat: 'mb' },
      { key: 'memory', label: 'Memory (RAM)', cat: 'ram' },
      { key: 'cooler', label: 'CPU Cooler', cat: 'cooler' },
      { key: 'storage', label: 'NVMe Storage', cat: 'storage' },
      { key: 'psu', label: 'Power Supply (PSU)', cat: 'psu' },
      { key: 'chassis', label: 'Chassis (Case)', cat: 'chassis' },
    ];

    let installedCount = 0;
    let totalCost = 0;
    let totalWatts = 0;
    let cardsHtml = '';

    slots.forEach((slot) => {
      const comp = activeBuild[slot.key];
      if (comp) {
        installedCount++;
        const q = liveMarketQuotes[comp.id];
        const partCost = applyRealMarketPrices && q && q.realPrice ? q.realPrice : comp.priceUsd;
        totalCost += partCost;
        totalWatts += comp.tdpWatts || 0;
        const imgUri = window.HardwareThumbs.getComponentThumbnail(comp);
        const subMeta = comp.tdpWatts
          ? comp.tdpWatts + 'W TDP'
          : comp.psuWattage
          ? comp.psuWattage + 'W Continuous'
          : comp.lengthMm
          ? 'Max GPU ' + comp.lengthMm + 'mm'
          : 'Configured';

        cardsHtml +=
          '<div class="chosen-slot-card">' +
            '<div class="part-img-box" style="width:48px;height:48px;border-radius:6px;">' +
              '<img src="' + imgUri + '" alt="' + comp.name + '" class="real-part-img" />' +
            '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div class="chosen-slot-label">' + slot.label + '</div>' +
              '<div class="chosen-slot-name" title="' + comp.brand + ' ' + comp.name + '">' + comp.brand + ' ' + comp.name + '</div>' +
              '<div class="chosen-slot-sub">' + subMeta + '</div>' +
            '</div>' +
            '<div class="chosen-slot-price tabular">$' + partCost + '</div>' +
            '<div class="chosen-btn-grp">' +
              '<button class="mini-icon-btn" onclick="inspectComponentById(\'' + comp.id + '\')">3D</button>' +
              '<button class="mini-icon-btn" onclick="openCatalogForCategory(\'' + slot.cat + '\')">SWAP</button>' +
              '<button class="mini-icon-btn remove" onclick="removeSlotPart(\'' + slot.key + '\')">✕</button>' +
            '</div>' +
          '</div>';
      } else {
        cardsHtml +=
          '<div class="chosen-slot-card empty-slot">' +
            '<div class="part-img-box" style="width:48px;height:48px;border-radius:6px;border-style:dashed;">' +
              '<span style="font-size:16px;color:var(--text-dim);">+</span>' +
            '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div class="chosen-slot-label" style="color:var(--text-muted);">' + slot.label + '</div>' +
              '<div class="chosen-slot-name" style="color:var(--text-dim);">Slot Empty</div>' +
              '<div class="chosen-slot-sub">Select compatible hardware</div>' +
            '</div>' +
            '<button class="mini-icon-btn" onclick="openCatalogForCategory(\'' + slot.cat + '\')" style="background:var(--accent-emerald);color:#040805;border-color:var(--accent-emerald);font-weight:800;">+ PICK</button>' +
          '</div>';
      }
    });

    const badgeNum = document.getElementById('badge-rig-count');
    const reopenNum = document.getElementById('reopen-badge-rig-count');
    if (badgeNum) badgeNum.textContent = installedCount;
    if (reopenNum) reopenNum.textContent = installedCount;

    const errs = lastVerifyData.errors || [];
    const warns = lastVerifyData.warnings || [];
    let alertHtml = '';
    if (errs.length > 0) {
      alertHtml = '<div class="chosen-alert-banner"><strong>' + errs.length + (errs.length === 1 ? ' Compatibility Conflict' : ' Compatibility Conflicts') + ':</strong><span>' + errs.join(' | ') + '</span></div>';
    } else if (warns.length > 0) {
      alertHtml = '<div class="chosen-alert-banner warn"><strong>Advisory:</strong><span>' + warns[0] + '</span></div>';
    }

    container.innerHTML =
      '<div class="chosen-summary-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">' +
          '<div>' +
            '<div style="font-family:var(--font-display);font-size:12px;font-weight:800;color:var(--accent-emerald);letter-spacing:0.6px;">ACTIVE HARDWARE RIG</div>' +
            '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim);margin-top:2px;">' + installedCount + ' of 8 Slots · Transient ' + (lastPowerData.transientSpikeWatts || 0) + 'W</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div class="tabular" style="font-family:var(--font-mono);font-size:18px;font-weight:800;color:#fff;">$' + totalCost.toLocaleString() + '</div>' +
            '<div class="tabular" style="font-family:var(--font-mono);font-size:10px;color:var(--accent-emerald);font-weight:700;">' + (lastVerifyData.estimatedPeakWatts || totalWatts) + 'W Peak</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button class="mini-icon-btn" onclick="loadHighEndPreset()" style="background:var(--accent-emerald);color:#040805;border-color:var(--accent-emerald);font-weight:800;padding:5px 9px;">FLAGSHIP 4090</button>' +
          '<button class="mini-icon-btn" onclick="loadSweetSpotPreset()" style="padding:5px 9px;">1440P SWEET SPOT</button>' +
          '<button class="mini-icon-btn" onclick="loadTerraSffPreset()" style="padding:5px 9px;">TERRA SFF</button>' +
          '<button class="mini-icon-btn remove" onclick="clearAllParts()" style="margin-left:auto;padding:5px 9px;">CLEAR</button>' +
        '</div>' +
      '</div>' +
      alertHtml +
      '<div style="display:flex;flex-direction:column;gap:7px;">' + cardsHtml + '</div>';
  }

  function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.tab-switch-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
    ['chosen', 'catalog', 'games', 'build', 'market', 'thermal'].forEach((v) => {
      const el = document.getElementById('view-' + v);
      if (!el) return;
      if (v === tabName) {
        el.style.display = 'flex';
        el.classList.remove('tab-entering');
        void el.offsetWidth;
        el.classList.add('tab-entering');
      } else {
        el.style.display = 'none';
      }
    });
    if (tabName === 'chosen') renderChosenRigView();
    if (tabName === 'catalog') renderCatalog();
    if (tabName === 'games') renderSidebarGamesView();
    if (tabName === 'build') renderBuildSpecView();
    if (tabName === 'market') renderMarketDealsView();
    if (tabName === 'thermal') renderThermalBenchView();
  }

  window.removeSlotPart = function (slotKey) {
    if (!activeBuild[slotKey]) return;
    const name = activeBuild[slotKey].name;
    activeBuild[slotKey] = null;
    update3DScene();
    syncBuildAnalysis();
    showToast('Removed ' + name);
  };

  window.openCatalogForCategory = function (cat) {
    activeCategory = cat;
    document.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b.dataset.cat === cat));
    switchTab('catalog');
  };

  window.inspectComponentById = function (id) {
    const comp = allComponents.find((c) => c.id === id);
    if (comp) inspectComponent(comp);
  };

  window.clearAllParts = function () {
    for (const k of Object.keys(activeBuild)) activeBuild[k] = null;
    update3DScene();
    syncBuildAnalysis();
    showToast('Cleared active build');
  };

  function applyPreset(ids, msg, enableCase) {
    const find = (id) => allComponents.find((c) => c.id === id) || null;
    activeBuild.cpu = find(ids.cpu);
    activeBuild.motherboard = find(ids.mb);
    activeBuild.gpu = find(ids.gpu);
    activeBuild.memory = find(ids.ram);
    activeBuild.cooler = find(ids.cooler);
    activeBuild.psu = find(ids.psu);
    activeBuild.storage = find(ids.ssd);
    activeBuild.chassis = find(ids.chassis);
    if (enableCase !== undefined) {
      showCase = enableCase;
      const btn = document.getElementById('btn-case');
      if (btn) {
        btn.classList.toggle('active', showCase);
        btn.textContent = showCase ? 'CASE: ON' : 'CASE: OFF';
      }
    }
    update3DScene();
    syncBuildAnalysis();
    showToast(msg);
  }

  window.loadHighEndPreset = function () {
    applyPreset({
      cpu: 'cpu_7800x3d',
      mb: 'mb_b650e',
      gpu: 'gpu_rtx_4090',
      ram: 'ram_dominator_titanium_64gb',
      cooler: 'cooler_icue_titan_360',
      psu: 'psu_rm1000x_shift',
      ssd: 'ssd_samsung_990pro',
      chassis: 'case_5000d_airflow',
    }, 'Loaded Flagship RTX 4090 + 7800X3D Preset');
  };

  window.loadSweetSpotPreset = function () {
    applyPreset({
      cpu: 'cpu_7600x',
      mb: 'mb_b650_tomahawk',
      gpu: 'gpu_rtx_4070s',
      ram: 'ram_vengeance_rgb_32gb',
      cooler: 'cooler_peerless_120',
      psu: 'psu_corsair_750w',
      ssd: 'ssd_sn850x',
      chassis: 'case_4000d_airflow',
    }, 'Loaded 1440p Sweet-Spot Preset');
  };

  window.loadTerraSffPreset = function () {
    applyPreset({
      cpu: 'cpu_7800x3d',
      mb: 'mb_b650i_itx',
      gpu: 'gpu_rtx_4070s',
      ram: 'ram_vengeance_32gb',
      cooler: 'cooler_nh_l12s',
      psu: 'psu_corsair_750w',
      ssd: 'ssd_samsung_990pro',
      chassis: 'case_terra',
    }, 'Loaded Fractal Terra Mini-ITX SFF Preset', true);
  };

  // Render View 1: Catalog
  function renderCatalog() {
    const feed = document.getElementById('component-feed');
    if (!feed) return;
    feed.innerHTML = '';

    const query = (document.getElementById('part-search-input')?.value || '').toLowerCase().trim();
    const sortBy = document.getElementById('part-sort-select')?.value || 'featured';
    const kindMap = {
      cpu: 'processor',
      gpu: 'graphics_card',
      mb: 'motherboard',
      ram: 'memory',
      storage: 'storage',
      psu: 'power_supply',
      cooler: 'cooler',
      chassis: 'chassis',
    };

    let filtered = allComponents.filter((c) => {
      const kStr = kindString(c);
      if (activeCategory !== 'all' && kStr !== kindMap[activeCategory]) return false;
      if (query) {
        const hay = ((c.name || '') + ' ' + (c.brand || '') + ' ' + (c.imageBadge || '') + ' ' + (c.socket || '') + ' ' + (c.memType || '')).toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (compatibleOnlyFilter && checkCandidateCompatibility(c).length > 0) return false;
      return true;
    });

    if (sortBy === 'price-asc') filtered.sort((a, b) => a.priceUsd - b.priceUsd);
    else if (sortBy === 'price-desc') filtered.sort((a, b) => b.priceUsd - a.priceUsd);
    else if (sortBy === 'power') filtered.sort((a, b) => (b.tdpWatts || b.psuWattage || 0) - (a.tdpWatts || a.psuWattage || 0));

    if (filtered.length === 0) {
      feed.innerHTML = '<div style="padding:26px;text-align:center;color:var(--text-muted);font-family:var(--font-mono);font-size:11.5px;">No matching parts found.</div>';
      return;
    }

    filtered.forEach((c) => {
      const slotKey = slotKeyForComp(c);
      const isInstalled = activeBuild[slotKey] && activeBuild[slotKey].id === c.id;
      const issues = isInstalled ? [] : checkCandidateCompatibility(c);

      const card = document.createElement('div');
      card.className = 'part-card' + (isInstalled ? ' installed' : '');

      const bLower = (c.brand || '').toLowerCase();
      let brandClass = 'part-brand-badge';
      if (bLower.includes('amd')) brandClass += ' brand-amd';
      else if (bLower.includes('intel')) brandClass += ' brand-intel';
      else if (bLower.includes('nvidia')) brandClass += ' brand-nvidia';
      else if (bLower.includes('corsair')) brandClass += ' brand-corsair';
      else if (bLower.includes('asus')) brandClass += ' brand-asus';

      const compatBadge = isInstalled
        ? '<span class="part-compat-pill ok">INSTALLED</span>'
        : issues.length === 0
        ? '<span class="part-compat-pill ok">COMPATIBLE</span>'
        : '<span class="part-compat-pill conflict" title="' + issues.join(', ') + '">' + issues[0] + '</span>';

      let specsHtml = '';
      if (c.socket && c.socket !== 'not_applicable') specsHtml += '<span class="spec-pill">' + c.socket.toUpperCase() + '</span>';
      if (c.memType && c.memType !== 'not_applicable') specsHtml += '<span class="spec-pill">' + c.memType.toUpperCase() + '</span>';
      if (c.formFactor && c.formFactor !== 'not_applicable') specsHtml += '<span class="spec-pill">' + c.formFactor.replace('_', '-').toUpperCase() + '</span>';
      if (c.coreCount && kindString(c) === 'processor') specsHtml += '<span class="spec-pill">' + c.coreCount + ' CORES</span>';
      if (c.boostClockMhz) specsHtml += '<span class="spec-pill">' + c.boostClockMhz + ' MHz</span>';
      if (c.vramGb) specsHtml += '<span class="spec-pill">' + c.vramGb + 'GB VRAM</span>';
      if (c.tdpWatts) specsHtml += '<span class="spec-pill">' + c.tdpWatts + 'W TDP</span>';
      if (c.psuWattage) specsHtml += '<span class="spec-pill">' + c.psuWattage + 'W</span>';
      if (c.lengthMm) specsHtml += '<span class="spec-pill">' + c.lengthMm + 'mm</span>';
      if (c.heightMm) specsHtml += '<span class="spec-pill">' + c.heightMm + 'mm H</span>';

      const imgUri = window.HardwareThumbs.getComponentThumbnail(c);
      const quote = liveMarketQuotes[c.id] || {};
      let priceHtml = '<span class="part-price-badge tabular">$' + c.priceUsd + '</span>';
      if (quote && quote.realPrice) {
        const deltaClass = quote.deltaUsd > 0 ? 'delta-scalp' : quote.deltaUsd < 0 ? 'delta-discount' : 'delta-neutral';
        const deltaSign = quote.deltaUsd > 0 ? '+' : '';
        priceHtml =
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">' +
            '<span class="part-price-badge tabular" style="' + (applyRealMarketPrices ? 'color:var(--accent-emerald);' : '') + '">$' + (applyRealMarketPrices ? quote.realPrice : c.priceUsd) + '</span>' +
            '<span class="market-delta-pill ' + deltaClass + '">MKT $' + quote.realPrice + ' (' + deltaSign + quote.deltaUsd + ')</span>' +
          '</div>';
      }

      card.innerHTML =
        '<div class="part-main-row">' +
          '<div class="part-img-box"><img src="' + imgUri + '" alt="' + c.name + '" class="real-part-img" /></div>' +
          '<div class="part-info-col">' +
            '<div class="part-top-row">' +
              '<div class="part-badges-left"><span class="' + brandClass + '">' + c.brand + '</span>' + compatBadge + '</div>' +
              priceHtml +
            '</div>' +
            '<div class="part-name-title">' + c.name + '</div>' +
            '<div class="part-tagline-text">' + (c.imageBadge || '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="part-specs-row">' + specsHtml + '</div>' +
        '<div class="part-actions-row">' +
          '<button class="action-btn primary btn-install ' + (isInstalled ? 'installed-btn' : '') + '">' + (isInstalled ? 'Remove' : 'Install Part') + '</button>' +
          '<button class="action-btn btn-inspect">Inspect 3D</button>' +
        '</div>';

      card.querySelector('.btn-install').onclick = () => toggleInstall(c);
      card.querySelector('.btn-inspect').onclick = () => {
        if (!isInstalled) {
          activeBuild[slotKey] = c;
          update3DScene();
          syncBuildAnalysis();
        }
        inspectComponent(c);
      };
      feed.appendChild(card);
    });
  }

  // Render View 2: Full System Spec & Verification Matrix
  function renderBuildSpecView() {
    const container = document.getElementById('spec-sheet-container');
    if (!container) return;

    const installedKeys = ['cpu', 'motherboard', 'memory', 'gpu', 'cooler', 'storage', 'psu', 'chassis'];
    let partsHtml = '';
    let totalCost = 0;

    installedKeys.forEach((k) => {
      const comp = activeBuild[k];
      if (comp) {
        const q = liveMarketQuotes[comp.id];
        const partCost = applyRealMarketPrices && q && q.realPrice ? q.realPrice : comp.priceUsd;
        totalCost += partCost;
        partsHtml +=
          '<div class="spec-row">' +
            '<span class="spec-key">' + k.toUpperCase() + ': ' + comp.brand + ' ' + comp.name + '</span>' +
            '<span class="spec-val tabular">$' + partCost + '</span>' +
          '</div>';
      } else {
        partsHtml +=
          '<div class="spec-row">' +
            '<span class="spec-key" style="color:var(--text-muted);">' + k.toUpperCase() + ': Empty</span>' +
            '<span class="spec-val" style="color:var(--text-muted);">-</span>' +
          '</div>';
      }
    });

    const gpuLen = activeBuild.gpu ? activeBuild.gpu.lengthMm : 0;
    const caseMaxGpu = activeBuild.chassis ? activeBuild.chassis.lengthMm : 420;
    const gpuPass = gpuLen <= caseMaxGpu;

    const coolerH = activeBuild.cooler ? activeBuild.cooler.heightMm : 0;
    const caseMaxCooler = activeBuild.chassis ? activeBuild.chassis.heightMm : 170;
    const isAir = activeBuild.cooler && activeBuild.cooler.coolerType === 'air';
    const isRadSffFail = activeBuild.chassis && activeBuild.chassis.formFactor === 'mini_itx' &&
      activeBuild.cooler && (activeBuild.cooler.coolerType === 'liquid_aio_360' || activeBuild.cooler.coolerType === 'liquid_aio_420');
    const coolerPass = isRadSffFail ? false : (!isAir || coolerH <= caseMaxCooler);

    const sockOk = !(activeBuild.cpu && activeBuild.motherboard && activeBuild.cpu.socket !== activeBuild.motherboard.socket);
    const ramOk = !(activeBuild.memory && activeBuild.motherboard && activeBuild.memory.memType !== activeBuild.motherboard.memType);
    const ffOk = !(activeBuild.chassis && activeBuild.motherboard && activeBuild.chassis.formFactor === 'mini_itx' && activeBuild.motherboard.formFactor !== 'mini_itx');
    const psuCap = activeBuild.psu ? activeBuild.psu.psuWattage : 0;
    const psuPass = psuCap >= (lastVerifyData.estimatedPeakWatts || 0);
    const psuHeadroom = psuPass && psuCap >= (lastVerifyData.recommendedPsuWatts || 0);

    container.innerHTML =
      '<div class="spec-section-card">' +
        '<div class="spec-section-header"><span>Mechanical & Electrical Matrix</span><span class="' + (lastVerifyData.isCompatible ? 'clearance-pass' : 'clearance-fail') + '">' + (lastVerifyData.isCompatible ? 'VERIFIED' : 'CONFLICT') + '</span></div>' +
        '<div class="spec-row"><span class="spec-key">CPU / Board Socket</span><span class="' + (sockOk ? 'clearance-pass' : 'clearance-fail') + '">' + (sockOk ? 'Aligned' : 'Socket Mismatch') + '</span></div>' +
        '<div class="spec-row"><span class="spec-key">Memory Standard</span><span class="' + (ramOk ? 'clearance-pass' : 'clearance-fail') + '">' + (ramOk ? 'Aligned' : 'DDR Protocol Mismatch') + '</span></div>' +
        '<div class="spec-row"><span class="spec-key">Case Form Factor</span><span class="' + (ffOk ? 'clearance-pass' : 'clearance-fail') + '">' + (ffOk ? 'Fits Chassis' : 'ITX Conflict') + '</span></div>' +
        '<div class="spec-row"><span class="spec-key">GPU Length (' + gpuLen + ' / ' + caseMaxGpu + 'mm)</span><span class="' + (gpuPass ? 'clearance-pass' : 'clearance-fail') + '">' + (gpuPass ? 'Cleared' : 'Length Violation') + '</span></div>' +
        '<div class="spec-row"><span class="spec-key">Cooler / Rad Envelope</span><span class="' + (coolerPass ? 'clearance-pass' : 'clearance-fail') + '">' + (coolerPass ? 'Cleared' : 'Clearance Alert') + '</span></div>' +
        '<div class="spec-row"><span class="spec-key">PSU Output (' + psuCap + 'W vs ' + (lastVerifyData.recommendedPsuWatts || 550) + 'W rec)</span><span class="' + (!psuPass ? 'clearance-fail' : psuHeadroom ? 'clearance-pass' : 'clearance-warn') + '">' + (!psuPass ? 'Insufficient' : psuHeadroom ? 'Optimal Headroom' : 'Marginal') + '</span></div>' +
      '</div>' +

      '<div class="spec-section-card">' +
        '<div class="spec-section-header"><span>ATX 3.0 Power Telemetry</span><span>' + (lastPowerData.efficiencyPct || 90) + '% EFF</span></div>' +
        '<div class="spec-row"><span class="spec-key">Desktop Idle</span><span class="spec-val tabular">' + (lastPowerData.idleWatts || 0) + ' W</span></div>' +
        '<div class="spec-row"><span class="spec-key">Gaming Load (Real-World)</span><span class="spec-val tabular">' + (lastPowerData.loadWatts || 0) + ' W</span></div>' +
        '<div class="spec-row"><span class="spec-key">100% Synthetic Stress</span><span class="spec-val tabular">' + (lastPowerData.peakWatts || 0) + ' W</span></div>' +
        '<div class="spec-row"><span class="spec-key">ATX 3.0 Excursion (135% GPU)</span><span class="spec-val tabular" style="color:var(--accent-amber);">' + (lastPowerData.transientSpikeWatts || 0) + ' W</span></div>' +
        '<div class="spec-row"><span class="spec-key">Est. Annual Energy (4h/day)</span><span class="spec-val tabular">$' + (lastPowerData.annualCostKwh || 0) + ' / yr</span></div>' +
      '</div>' +

      '<div class="spec-section-card">' +
        '<div class="spec-section-header"><span>Bill of Materials</span><span class="tabular">$' + totalCost.toLocaleString() + '</span></div>' +
        partsHtml +
      '</div>' +

      '<div style="display:flex;gap:7px;flex-wrap:wrap;">' +
        '<button class="action-btn" id="btn-export-spec">Copy Spec Sheet</button>' +
        '<button class="action-btn" id="btn-share-url">Copy Share Link</button>' +
        '<button class="action-btn primary" id="btn-export-json">Export JSON</button>' +
      '</div>';

    document.getElementById('btn-export-spec')?.addEventListener('click', () => {
      let text = 'PC HARDWARE ARCHITECT - BUILD SHEET\n===================================\n';
      installedKeys.forEach((k) => {
        const comp = activeBuild[k];
        if (comp) text += k.toUpperCase() + ': ' + comp.brand + ' ' + comp.name + ' ($' + comp.priceUsd + ')\n';
      });
      text += '\nTOTAL: $' + totalCost + '\nPEAK: ' + (lastPowerData.peakWatts || 0) + 'W | ATX 3.0 SPIKE: ' + (lastPowerData.transientSpikeWatts || 0) + 'W\n';
      navigator.clipboard?.writeText(text);
      showToast('Spec sheet copied to clipboard');
    });

    document.getElementById('btn-share-url')?.addEventListener('click', () => {
      const pairs = installedKeys
        .filter((k) => activeBuild[k])
        .map((k) => k + '=' + encodeURIComponent(activeBuild[k].id));
      const url = location.origin + location.pathname + '?rig=' + encodeURIComponent(pairs.join(','));
      try { window.history.replaceState(null, '', '?rig=' + encodeURIComponent(pairs.join(','))); } catch (e) {}
      navigator.clipboard?.writeText(url);
      showToast('Shareable build URL copied to clipboard');
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const out = {};
      installedKeys.forEach((k) => { if (activeBuild[k]) out[k] = activeBuild[k].id; });
      navigator.clipboard?.writeText(JSON.stringify(out, null, 2));
      showToast('Build JSON copied to clipboard');
    });
  }

  function epForKind(kind) {
    return {
      processor: 'cpu.json',
      graphics_card: 'video-card.json',
      motherboard: 'motherboard.json',
      memory: 'memory.json',
      storage: 'internal-hard-drive.json',
      power_supply: 'power-supply.json',
      cooler: 'cpu-cooler.json',
      chassis: 'case.json',
    }[kind] || 'cpu.json';
  }

  async function executeLiveBrowserCrawl() {
    if (isCrawlingLive) return;
    isCrawlingLive = true;
    crawlerTerminalLogs.push('[' + new Date().toLocaleTimeString() + '] Fetching GitHub docyx/pc-part-dataset...');
    renderMarketDealsView();

    const endpoints = [
      { kind: 'processor', name: 'cpu.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/cpu.json' },
      { kind: 'graphics_card', name: 'video-card.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/video-card.json' },
      { kind: 'motherboard', name: 'motherboard.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/motherboard.json' },
      { kind: 'memory', name: 'memory.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/memory.json' },
      { kind: 'storage', name: 'internal-hard-drive.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/internal-hard-drive.json' },
      { kind: 'power_supply', name: 'power-supply.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/power-supply.json' },
      { kind: 'cooler', name: 'cpu-cooler.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/cpu-cooler.json' },
      { kind: 'chassis', name: 'case.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/case.json' },
    ];

    const datasets = {};
    let total = 0;
    for (const ep of endpoints) {
      try {
        const t0 = performance.now();
        const res = await fetch(ep.url);
        const data = await res.json();
        datasets[ep.kind] = data;
        total += data.length;
        crawlerTerminalLogs.push('[HTTP ' + res.status + '] ' + ep.name + ': ' + data.length.toLocaleString() + ' rows (' + Math.round(performance.now() - t0) + 'ms)');
      } catch (err) {
        crawlerTerminalLogs.push('[WARN] ' + ep.name + ': ' + err.message);
      }
      renderMarketDealsView();
    }

    let matched = 0;
    allComponents.forEach((c) => {
      const list = datasets[c.kind] || [];
      const cleanName = c.name.toLowerCase();
      const brandLower = c.brand.toLowerCase();
      const idKey = c.id.replace(/^(cpu_|gpu_|mb_|ram_|ssd_|psu_|cooler_|case_)/, '').toLowerCase();
      const candidates = list.filter((item) => {
        if (!item.name || !item.price || item.price <= 0) return false;
        const itemName = item.name.toLowerCase();
        const chipset = (item.chipset || '').toLowerCase();
        const idTokens = idKey.split('_').filter((t) => t.length >= 2);
        if (idTokens.every((tok) => itemName.includes(tok) || chipset.includes(tok))) return true;
        const nameTokens = cleanName.split(/[\s-]+/).filter((t) => t.length >= 3 && !['edition', 'gaming', 'series', 'super', 'plus', 'pro'].includes(t));
        const modelNum = nameTokens.find((t) => /\d+/.test(t));
        if (modelNum && !(itemName.includes(modelNum) || chipset.includes(modelNum))) return false;
        return nameTokens.filter((t) => itemName.includes(t) || chipset.includes(t)).length >= 2;
      });
      const best = candidates.find((item) => item.name.toLowerCase().includes(brandLower)) || candidates[0];
      if (best) {
        matched++;
        const scrapedPrice = Math.round(typeof best.price === 'number' ? best.price : parseFloat(best.price));
        const delta = scrapedPrice - c.priceUsd;
        liveMarketQuotes[c.id] = {
          id: c.id,
          matchedName: best.name,
          realPrice: scrapedPrice,
          basePrice: c.priceUsd,
          deltaUsd: delta,
          deltaPct: parseFloat(((delta / c.priceUsd) * 100).toFixed(1)),
          retailerSource: 'PCPartPicker Live Scraped Index',
          datasetUrl: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/' + epForKind(c.kind),
          rawMatch: best,
        };
      }
    });

    crawlerTerminalLogs.push('[DONE] Processed ' + total.toLocaleString() + ' records, matched ' + matched + ' parts.');
    isCrawlingLive = false;
    renderMarketDealsView();
    syncBuildAnalysis();
  }

  // Render View 3: Live Market Deals
  function renderMarketDealsView() {
    const container = document.getElementById('market-view-container');
    if (!container) return;

    const installed = Object.values(activeBuild).filter(Boolean);
    const items = installed.length > 0 ? installed : allComponents.slice(0, 10);
    let quotesHtml = '';

    items.forEach((c) => {
      const q = liveMarketQuotes[c.id] || {
        realPrice: c.priceUsd,
        deltaUsd: 0,
        deltaPct: 0,
        retailerSource: 'MSRP Reference',
        matchedName: c.name,
        datasetUrl: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/' + epForKind(c.kind),
      };
      const deltaClass = q.deltaUsd > 0 ? 'delta-scalp' : q.deltaUsd < 0 ? 'delta-discount' : 'delta-neutral';
      const deltaLabel = q.deltaUsd > 0
        ? '+$' + q.deltaUsd + ' (+' + q.deltaPct + '%) Above MSRP'
        : q.deltaUsd < 0
        ? '-$' + Math.abs(q.deltaUsd) + ' (' + q.deltaPct + '%) Discount'
        : 'At MSRP';

      const rawBlock = rawJsonExpanded[c.id]
        ? '<pre class="crawler-raw-json">' + JSON.stringify(q.rawMatch || q, null, 2) + '</pre>'
        : '';

      quotesHtml +=
        '<div class="part-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
            '<div style="min-width:0;">' +
              '<span class="part-brand-badge">' + c.brand + '</span>' +
              '<div style="font-size:12.5px;font-weight:700;color:#fff;margin-top:4px;">' + c.name + '</div>' +
              '<div style="font-family:var(--font-mono);font-size:9.5px;color:var(--accent-lime);margin-top:2px;">MATCHED: ' + (q.matchedName || c.name) + '</div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0;">' +
              '<span style="font-family:var(--font-mono);font-size:9.5px;color:var(--text-muted);text-decoration:line-through;">MSRP $' + c.priceUsd + '</span>' +
              '<span class="tabular" style="font-family:var(--font-mono);font-size:14.5px;font-weight:800;color:#34d399;">$' + (q.realPrice || c.priceUsd) + '</span>' +
              '<span class="market-delta-pill ' + deltaClass + '">' + deltaLabel + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:7px;gap:8px;">' +
            '<span style="font-family:var(--font-mono);font-size:9px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (q.retailerSource || 'PCPartPicker Index') + '</span>' +
            '<div style="display:flex;gap:5px;flex-shrink:0;">' +
              '<button class="mini-icon-btn btn-inspect-raw" data-id="' + c.id + '">' + (rawJsonExpanded[c.id] ? 'HIDE JSON' : 'RAW JSON') + '</button>' +
              '<a href="' + (q.datasetUrl || '#') + '" target="_blank" rel="noopener" class="mini-icon-btn" style="text-decoration:none;">DATASET</a>' +
            '</div>' +
          '</div>' +
          rawBlock +
        '</div>';
    });

    container.innerHTML =
      '<div class="crawler-status-box">' +
        '<div class="crawler-header-row">' +
          '<div class="crawler-info">' +
            '<span class="crawler-title">Live Hardware Price Tracker</span>' +
            '<span class="crawler-sub">Open Dataset: docyx/pc-part-dataset (45,951 Records)</span>' +
          '</div>' +
          '<span class="market-delta-pill delta-discount">' + (isCrawlingLive ? 'Crawling...' : 'Feed Ready') + '</span>' +
        '</div>' +
        '<div class="crawler-btn-group">' +
          '<button class="crawler-action-btn ' + (isCrawlingLive ? '' : 'active-green') + '" id="btn-live-browser-crawl">' + (isCrawlingLive ? 'Downloading...' : 'Fetch Live Prices') + '</button>' +
          '<button class="crawler-action-btn" id="btn-sync-backend-prices">Sync API Cache</button>' +
          '<button class="crawler-action-btn ' + (applyRealMarketPrices ? 'active-green' : '') + '" id="btn-toggle-apply-market">' + (applyRealMarketPrices ? 'Pricing: Live Market' : 'Use Live Prices') + '</button>' +
        '</div>' +
        '<div class="crawler-log-box" id="crawler-log-box">' + crawlerTerminalLogs.slice(-12).join('\n') + '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' + quotesHtml + '</div>';

    const logBox = document.getElementById('crawler-log-box');
    if (logBox) logBox.scrollTop = logBox.scrollHeight;

    document.getElementById('btn-live-browser-crawl')?.addEventListener('click', executeLiveBrowserCrawl);
    document.getElementById('btn-sync-backend-prices')?.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/live-prices');
        const data = await res.json();
        liveMarketQuotes = data.quotes || {};
        crawlerTerminalLogs.push('[' + new Date().toLocaleTimeString() + '] Synced ' + Object.keys(liveMarketQuotes).length + ' quotes from backend.');
        renderMarketDealsView();
        syncBuildAnalysis();
      } catch (e) {
        showToast('API price sync failed');
      }
    });
    document.getElementById('btn-toggle-apply-market')?.addEventListener('click', () => {
      applyRealMarketPrices = !applyRealMarketPrices;
      renderMarketDealsView();
      syncBuildAnalysis();
    });
    container.querySelectorAll('.btn-inspect-raw').forEach((btn) => {
      btn.addEventListener('click', () => {
        rawJsonExpanded[btn.dataset.id] = !rawJsonExpanded[btn.dataset.id];
        renderMarketDealsView();
      });
    });
  }

  // Render View 4: Real Cooler-Aware Thermals & Acoustics
  function renderThermalBenchView() {
    const container = document.getElementById('thermal-bench-container');
    if (!container) return;

    const p = lastPowerData;
    const temps = effectiveTempsFromPower(p);
    const hasCooler = !!activeBuild.cooler;
    const isAir = activeBuild.cooler && activeBuild.cooler.coolerType === 'air';
    const isThrottling = p.thermalThrottling || temps.cpu >= 95;

    const cpuColor = temps.cpu >= 88 ? '#ef4444' : temps.cpu >= 72 ? '#f59e0b' : '#10f06a';
    const gpuColor = temps.gpu >= 80 ? '#ef4444' : temps.gpu >= 70 ? '#f59e0b' : '#38bdf8';
    const coolantTemp = Math.round(24 + temps.cpu * 0.22);
    const vrmTemp = Math.round(32 + (activeBuild.cpu ? activeBuild.cpu.tdpWatts * 0.11 : 8) + (stressActive ? 10 : 0));

    const coolerRows = !hasCooler
      ? '<div class="spec-row"><span class="spec-key">Cooler Status</span><span class="clearance-fail">NO COOLER INSTALLED (THROTTLING)</span></div>'
      : isAir
      ? '<div class="spec-row"><span class="spec-key">Heatpipe Fin Stack Delta</span><span class="spec-val tabular">+' + Math.max(8, Math.round((temps.cpu - 24) * 0.35)) + '°C</span></div>' +
        '<div class="spec-row"><span class="spec-key">Tower Fan Speed</span><span class="spec-val tabular">' + (selectedFanProfile === 'silent' ? '780' : selectedFanProfile === 'extreme' ? '1,950' : '1,240') + ' RPM</span></div>'
      : '<div class="spec-row"><span class="spec-key">Liquid Coolant Loop</span><span class="spec-val tabular">' + coolantTemp + '°C</span></div>' +
        '<div class="spec-row"><span class="spec-key">AIO Pump Tachometer</span><span class="spec-val tabular">' + (stressActive || selectedFanProfile === 'extreme' ? '2,750' : selectedFanProfile === 'silent' ? '1,650' : '2,250') + ' RPM</span></div>';

    container.innerHTML =
      '<div class="spec-section-card">' +
        '<div class="spec-section-header"><span>Fan & Pump Acoustic Curve</span><span>' + selectedFanProfile.toUpperCase() + '</span></div>' +
        '<div style="display:flex;gap:6px;">' +
          '<button class="action-btn ' + (selectedFanProfile === 'silent' ? 'primary' : '') + '" data-fan="silent">Silent</button>' +
          '<button class="action-btn ' + (selectedFanProfile === 'balanced' ? 'primary' : '') + '" data-fan="balanced">Balanced</button>' +
          '<button class="action-btn ' + (selectedFanProfile === 'extreme' ? 'primary' : '') + '" data-fan="extreme">Extreme</button>' +
        '</div>' +
        '<div class="spec-row" style="margin-top:6px;"><span class="spec-key">Idle Sound Pressure</span><span class="spec-val tabular">' + (p.noiseDecibelsIdle || 24) + ' dBA</span></div>' +
        '<div class="spec-row"><span class="spec-key">Active Load Acoustics</span><span class="spec-val tabular">' + temps.noise + ' dBA</span></div>' +
      '</div>' +

      '<div class="spec-section-card">' +
        '<div class="spec-section-header"><span>Die & Loop Telemetry</span><span class="' + (isThrottling ? 'clearance-fail' : 'clearance-pass') + '">' + (isThrottling ? 'THROTTLING' : stressActive ? '100% STRESS' : 'NOMINAL') + '</span></div>' +
        '<div class="thermal-meter-wrap">' +
          '<div class="spec-row" style="border:none;padding:0;"><span class="spec-key">CPU Tdie Package</span><span class="spec-val tabular" style="color:' + cpuColor + ';">' + temps.cpu + '°C (Idle ' + (p.cpuIdleTempC || 32) + '°C)</span></div>' +
          '<div class="thermal-meter-track"><div class="thermal-meter-fill" style="width:' + Math.min(100, temps.cpu) + '%;background:' + cpuColor + ';"></div></div>' +
        '</div>' +
        '<div class="thermal-meter-wrap">' +
          '<div class="spec-row" style="border:none;padding:0;"><span class="spec-key">GPU Core Junction</span><span class="spec-val tabular" style="color:' + gpuColor + ';">' + temps.gpu + '°C (Hotspot ' + (temps.gpu + 11) + '°C)</span></div>' +
          '<div class="thermal-meter-track"><div class="thermal-meter-fill" style="width:' + Math.min(100, temps.gpu) + '%;background:' + gpuColor + ';"></div></div>' +
        '</div>' +
        '<div class="spec-row"><span class="spec-key">VRM Power Stages</span><span class="spec-val tabular">' + vrmTemp + '°C</span></div>' +
        coolerRows +
      '</div>';

    container.querySelectorAll('[data-fan]').forEach((btn) => {
      btn.onclick = () => {
        selectedFanProfile = btn.dataset.fan;
        const nextTemps = effectiveTempsFromPower(lastPowerData);
        currentCpuTemp = nextTemps.cpu;
        currentGpuTemp = nextTemps.gpu;
        document.getElementById('telem-thermal-cpu').textContent = currentCpuTemp;
        document.getElementById('telem-thermal-gpu').textContent = currentGpuTemp;
        document.getElementById('telem-noise').textContent = nextTemps.noise;
        window.Models3D.updateAioLcdDisplay(meshNodes, getSceneThermalState());
        renderThermalBenchView();
      };
    });
  }

  // Benchmarks & Steam Store Search
  let onlineSearchDebounce = null;

  function shortPresetTag(raw) {
    const s = (raw || 'Ultra').replace(/Preset/i, '').replace(/Ray Tracing/i, 'RT').replace(/Competitive/i, 'COMP').trim();
    return s.length > 14 ? s.slice(0, 14) : s;
  }

  function renderGameCards(gamesList) {
    const grid = document.getElementById('game-grid');
    if (!grid) return;
    grid.innerHTML = '';

    gamesList.forEach((g) => {
      const headerImg = g.header || STEAM_GAME_ASSETS[g.gameName] || window.HardwareThumbs.getGameBannerFallback(g.gameName);
      const low1 = g.low1pctFps ?? g.low1PctFps ?? Math.round(g.avgFps * 0.74);
      const card = document.createElement('div');
      card.className = 'game-card';

      card.innerHTML =
        '<div class="game-banner-box">' +
          '<img src="' + headerImg + '" alt="' + g.gameName + '" />' +
          '<span class="game-preset-tag">' + shortPresetTag(g.qualityPreset) + '</span>' +
        '</div>' +
        '<div class="game-meta-box">' +
          '<div class="game-title" title="' + g.gameName + '">' + g.gameName + '</div>' +
          '<div class="game-fps-row">' +
            '<div class="game-fps tabular"><span>' + g.avgFps + '</span><span class="game-fps-unit">FPS</span></div>' +
            '<span class="game-badge-load tabular">' + g.gpuBottleneckPct + '% GPU</span>' +
          '</div>' +
          '<div class="game-sub">' +
            '<div class="bench-sub-stat"><span class="stat-lbl">1% LOW</span><span class="stat-val tabular">' + low1 + '</span></div>' +
            '<div class="bench-sub-stat"><span class="stat-lbl">FT</span><span class="stat-val tabular">' + (1000 / Math.max(1, g.avgFps)).toFixed(1) + 'ms</span></div>' +
          '</div>' +
          '<div class="bottle-bar"><div class="bottle-fill" style="width:' + g.gpuBottleneckPct + '%"></div></div>' +
        '</div>';

      const img = card.querySelector('img');
      if (img) {
        img.onerror = function () {
          this.onerror = null;
          this.src = window.HardwareThumbs.getGameBannerFallback(g.gameName);
        };
      }
      grid.appendChild(card);
    });
  }

  function renderSidebarGamesView(gamesList) {
    const feed = document.getElementById('sidebar-game-list');
    if (!feed) return;
    const games = gamesList || currentBenchmarkList;
    if (!games || games.length === 0) {
      feed.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;">No benchmarks found.</div>';
      return;
    }

    const avgFps = Math.round(games.reduce((a, g) => a + (g.avgFps || 0), 0) / games.length);
    const avgGpu = Math.round(games.reduce((a, g) => a + (g.gpuBottleneckPct || 0), 0) / games.length);
    document.getElementById('bench-kpi-tier').textContent = currentResolution.toUpperCase() + ' ULTRA';
    document.getElementById('bench-kpi-avg').textContent = avgFps + ' FPS';
    document.getElementById('bench-kpi-headroom').textContent = avgGpu + '% GPU / ' + (100 - avgGpu) + '% CPU';

    feed.innerHTML = '';
    games.forEach((g) => {
      const headerImg = g.header || STEAM_GAME_ASSETS[g.gameName] || window.HardwareThumbs.getGameBannerFallback(g.gameName);
      const low1 = g.low1pctFps ?? g.low1PctFps ?? Math.round(g.avgFps * 0.74);
      const card = document.createElement('div');
      card.className = 'sidebar-game-card';
      card.innerHTML =
        '<div class="sidebar-game-banner">' +
          '<img src="' + headerImg + '" alt="' + g.gameName + '" />' +
          '<div class="sidebar-game-banner-overlay">' +
            '<div class="sidebar-game-title">' + g.gameName + '</div>' +
            '<span class="sidebar-game-preset">' + (g.qualityPreset || 'Ultra') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="sidebar-game-body">' +
          '<div class="sidebar-game-metrics">' +
            '<div class="sidebar-game-fps-badge tabular"><span>' + g.avgFps + '</span><span class="sidebar-game-fps-unit">FPS</span></div>' +
            '<div class="sidebar-game-submetrics tabular"><span>1% LOW: <b>' + low1 + '</b></span><span>FT: <b>' + (1000 / Math.max(1, g.avgFps)).toFixed(1) + 'ms</b></span><span>GPU: <b>' + g.gpuBottleneckPct + '%</b></span></div>' +
          '</div>' +
          '<div class="sidebar-game-bar"><div class="sidebar-game-bar-fill" style="width:' + g.gpuBottleneckPct + '%;"></div></div>' +
        '</div>';

      const img = card.querySelector('img');
      if (img) {
        img.onerror = function () {
          this.onerror = null;
          this.src = window.HardwareThumbs.getGameBannerFallback(g.gameName);
        };
      }
      feed.appendChild(card);
    });
  }

  function triggerOnlineSteamSearch(query) {
    if (!query || query.length < 2) return;
    if (onlineSearchDebounce) clearTimeout(onlineSearchDebounce);
    onlineSearchDebounce = setTimeout(async () => {
      try {
        const gpuId = activeBuild.gpu ? activeBuild.gpu.id : '';
        const res = await fetch('/api/games/online?query=' + encodeURIComponent(query) + '&resolution=' + encodeURIComponent(currentResolution) + '&gpu=' + encodeURIComponent(gpuId));
        if (!res.ok) return;
        const onlineGames = await res.json();
        if (!Array.isArray(onlineGames) || onlineGames.length === 0) return;
        const currentQ = (document.getElementById('game-search-input')?.value || document.getElementById('sidebar-game-search')?.value || '').toLowerCase().trim();
        if (currentQ !== query) return;
        renderGameCards(onlineGames);
        renderSidebarGamesView(onlineGames);
      } catch (e) {
        console.warn('Steam online search skipped:', e);
      }
    }, 260);
  }

  function renderBenchmarks() {
    const grid = document.getElementById('game-grid');
    const query = (document.getElementById('game-search-input')?.value || document.getElementById('sidebar-game-search')?.value || '').toLowerCase().trim();
    let filtered = currentBenchmarkList;
    if (query) {
      const tokens = query.split(/\s+/).filter((t) => t.length >= 2);
      filtered = currentBenchmarkList.filter((g) => {
        const name = (g.gameName || '').toLowerCase();
        const preset = (g.qualityPreset || '').toLowerCase();
        return name.includes(query) || preset.includes(query) || (tokens.length > 0 && tokens.every((tok) => name.includes(tok)));
      });
      triggerOnlineSteamSearch(query);
    }

    renderSidebarGamesView(filtered);
    if (!grid) return;
    if (filtered.length === 0) {
      grid.innerHTML = '<div style="padding:14px;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;">Searching Steam Store for "' + query + '"...</div>';
      return;
    }
    renderGameCards(filtered);
  }

  // Smooth Tray Dragging & Wheel
  const gameGrid = document.getElementById('game-grid');
  let isDown = false, startX = 0, scrollLeft = 0;
  if (gameGrid) {
    gameGrid.addEventListener('mousedown', (e) => {
      isDown = true;
      gameGrid.classList.add('grabbing');
      startX = e.pageX - gameGrid.offsetLeft;
      scrollLeft = gameGrid.scrollLeft;
    });
    window.addEventListener('mouseup', () => { isDown = false; gameGrid.classList.remove('grabbing'); });
    gameGrid.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      gameGrid.scrollLeft = scrollLeft - (e.pageX - gameGrid.offsetLeft - startX) * 1.5;
    });
    gameGrid.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        gameGrid.scrollLeft += e.deltaY * 1.3;
      }
    }, { passive: false });
  }
  document.getElementById('tray-nav-left')?.addEventListener('click', () => gameGrid?.scrollBy({ left: -380, behavior: 'smooth' }));
  document.getElementById('tray-nav-right')?.addEventListener('click', () => gameGrid?.scrollBy({ left: 380, behavior: 'smooth' }));

  // Panels Collapse & Reopen
  const sidebar = document.getElementById('workstation-sidebar');
  const benchTray = document.getElementById('benchmark-tray');
  const reopenSidebarBtn = document.getElementById('btn-reopen-sidebar');
  const reopenBenchBtn = document.getElementById('btn-reopen-bench');
  const spatialHud = document.getElementById('spatial-hud');
  const viewportTools = document.getElementById('viewport-tools');

  document.getElementById('btn-close-sidebar')?.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    reopenSidebarBtn.style.display = 'flex';
    spatialHud.classList.add('expanded');
    benchTray.classList.add('expanded');
    viewportTools.classList.add('full-width');
    refreshCameraFraming(activeCamPreset);
  });
  reopenSidebarBtn?.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    reopenSidebarBtn.style.display = 'none';
    spatialHud.classList.remove('expanded');
    benchTray.classList.remove('expanded');
    viewportTools.classList.remove('full-width');
    refreshCameraFraming(activeCamPreset);
  });

  document.getElementById('btn-close-bench')?.addEventListener('click', () => {
    benchTray.classList.add('collapsed');
    reopenBenchBtn.style.display = 'flex';
    refreshCameraFraming(activeCamPreset);
  });
  reopenBenchBtn?.addEventListener('click', () => {
    benchTray.classList.remove('collapsed');
    reopenBenchBtn.style.display = 'none';
    refreshCameraFraming(activeCamPreset);
  });

  document.getElementById('btn-quick-bench')?.addEventListener('click', () => {
    if (benchTray.classList.contains('collapsed')) {
      benchTray.classList.remove('collapsed');
      reopenBenchBtn.style.display = 'none';
    } else {
      benchTray.classList.add('collapsed');
      reopenBenchBtn.style.display = 'flex';
    }
    refreshCameraFraming(activeCamPreset);
  });

  // Compatibility Popover Toggle
  const compatBtn = document.getElementById('compat-status-btn');
  const compatPop = document.getElementById('compat-popover');
  compatBtn?.addEventListener('click', () => {
    compatPop?.classList.toggle('open');
  });
  document.getElementById('btn-close-compat-pop')?.addEventListener('click', () => {
    compatPop?.classList.remove('open');
  });

  // Tab, Search, Filter & Resolution Bindings
  document.querySelectorAll('.tab-switch-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.getElementById('part-search-input')?.addEventListener('input', renderCatalog);
  document.getElementById('part-sort-select')?.addEventListener('change', renderCatalog);
  document.getElementById('btn-filter-compat')?.addEventListener('click', (e) => {
    compatibleOnlyFilter = !compatibleOnlyFilter;
    e.currentTarget.classList.toggle('active', compatibleOnlyFilter);
    renderCatalog();
  });
  document.querySelectorAll('.cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      renderCatalog();
    });
  });

  const btmSearch = document.getElementById('game-search-input');
  const sideSearch = document.getElementById('sidebar-game-search');
  btmSearch?.addEventListener('input', () => {
    if (sideSearch) sideSearch.value = btmSearch.value;
    renderBenchmarks();
  });
  sideSearch?.addEventListener('input', () => {
    if (btmSearch) btmSearch.value = sideSearch.value;
    renderBenchmarks();
  });

  function setResolution(res) {
    currentResolution = res;
    document.querySelectorAll('.res-btn, .sidebar-res-btn').forEach((b) => b.classList.toggle('active', b.dataset.res === res));
    syncBuildAnalysis();
  }
  document.querySelectorAll('.res-btn, .sidebar-res-btn').forEach((btn) => {
    btn.addEventListener('click', () => setResolution(btn.dataset.res));
  });

  // Camera Presets & Zoom (Viewport-Aware Dynamic Framing)
  function setCamPreset(presetName, activeId) {
    activeCamPreset = presetName;
    document.querySelectorAll('#cam-preset-group .tool-btn').forEach((b) => b.classList.remove('active'));
    document.getElementById(activeId)?.classList.add('active');
    controls.autoRotate = false;
    document.getElementById('btn-auto-rotate')?.classList.remove('active');
    const frame = window.Scene3D.getFramingPreset(presetName, getLayoutState());
    smoothTransitionCamera(frame.pos, frame.target);
  }
  document.getElementById('btn-cam-iso')?.addEventListener('click', () => setCamPreset('iso', 'btn-cam-iso'));
  document.getElementById('btn-cam-front')?.addEventListener('click', () => setCamPreset('front', 'btn-cam-front'));
  document.getElementById('btn-cam-top')?.addEventListener('click', () => setCamPreset('top', 'btn-cam-top'));
  document.getElementById('btn-cam-side')?.addEventListener('click', () => setCamPreset('side', 'btn-cam-side'));
  document.getElementById('btn-reset-cam')?.addEventListener('click', () => setCamPreset('iso', 'btn-cam-iso'));
  document.getElementById('btn-auto-rotate')?.addEventListener('click', (e) => {
    controls.autoRotate = !controls.autoRotate;
    controls.autoRotateSpeed = 1.6;
    e.currentTarget.classList.toggle('active', controls.autoRotate);
  });

  const zoomSlider = document.getElementById('cam-zoom-slider');
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    const dist = Math.max(controls.minDistance, camera.position.distanceTo(controls.target) * 0.78);
    const dir = camera.position.clone().sub(controls.target).normalize();
    smoothTransitionCamera(controls.target.clone().addScaledVector(dir, dist), controls.target);
  });
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    const dist = Math.min(controls.maxDistance, camera.position.distanceTo(controls.target) * 1.28);
    const dir = camera.position.clone().sub(controls.target).normalize();
    smoothTransitionCamera(controls.target.clone().addScaledVector(dir, dist), controls.target);
  });
  zoomSlider?.addEventListener('input', () => {
    const dist = parseFloat(zoomSlider.value);
    const dir = camera.position.clone().sub(controls.target).normalize();
    smoothTransitionCamera(controls.target.clone().addScaledVector(dir, dist), controls.target);
  });

  // 3D Inspection Modes
  function toggleLabelsState() {
    showLabels = !showLabels;
    const btn = document.getElementById('btn-toggle-labels');
    btn.textContent = showLabels ? 'LABELS: ON' : 'LABELS: OFF';
    btn.classList.toggle('active-cyan', showLabels);
  }
  document.getElementById('btn-toggle-labels')?.addEventListener('click', toggleLabelsState);

  function toggleCaseMode() {
    showCase = !showCase;
    const btn = document.getElementById('btn-case');
    btn.classList.toggle('active', showCase);
    btn.textContent = showCase ? 'CASE: ON' : 'CASE: OFF';
    window.Models3D.buildCaseMesh(activeBuild.chassis, showCase, benchGroup, meshNodes, window.Scene3D.disposeObject3D);
    window.Scene3D.setChassisFormFactor(sceneCtx, !!(showCase && activeBuild.chassis && activeBuild.chassis.id.includes('terra')));
    applyCurrentRgbColor();
    if (thermalMode) {
      window.Scene3D.applyThermalHeatmap(benchGroup, true, { cpu: currentCpuTemp, gpu: currentGpuTemp }, meshNodes);
    }
    showToast(showCase ? 'Mounted ' + (activeBuild.chassis ? activeBuild.chassis.name : 'PC Case') : 'Open Architectural Test Bench');
  }
  document.getElementById('btn-case')?.addEventListener('click', toggleCaseMode);

  document.getElementById('btn-gpu-mount')?.addEventListener('click', (e) => {
    verticalGpu = !verticalGpu;
    e.currentTarget.classList.toggle('active-cyan', verticalGpu);
    e.currentTarget.textContent = verticalGpu ? 'GPU: VERT' : 'GPU: HORIZ';
    if (activeBuild.gpu) {
      window.Models3D.buildGpuMesh(activeBuild.gpu, verticalGpu, benchGroup, meshNodes, window.Scene3D.disposeObject3D);
      applyCurrentRgbColor();
      if (thermalMode) window.Scene3D.applyThermalHeatmap(benchGroup, true, { cpu: currentCpuTemp, gpu: currentGpuTemp }, meshNodes);
    }
    showToast(verticalGpu ? 'GPU Vertical Riser Mount' : 'GPU Horizontal PCIe 5.0 SafeSlot');
  });

  document.getElementById('btn-explode')?.addEventListener('click', (e) => {
    exploded = !exploded;
    e.currentTarget.classList.toggle('active', exploded);
  });

  document.getElementById('btn-wireframe')?.addEventListener('click', (e) => {
    wireframeMode = !wireframeMode;
    e.currentTarget.classList.toggle('active', wireframeMode);
    benchGroup.traverse((n) => {
      if (n.isMesh && !n.userData.isGlass && n !== meshNodes.aioScreenMesh) {
        n.material.wireframe = wireframeMode;
      }
    });
  });

  document.getElementById('btn-thermal')?.addEventListener('click', (e) => {
    thermalMode = !thermalMode;
    e.currentTarget.classList.toggle('active', thermalMode);
    window.Scene3D.applyThermalHeatmap(benchGroup, thermalMode, { cpu: currentCpuTemp, gpu: currentGpuTemp }, meshNodes);
  });

  document.getElementById('btn-stress')?.addEventListener('click', (e) => {
    stressActive = !stressActive;
    e.currentTarget.classList.toggle('active', stressActive);
    e.currentTarget.textContent = stressActive ? 'STRESSING' : 'STRESS 100%';
    const temps = effectiveTempsFromPower(lastPowerData);
    currentCpuTemp = temps.cpu;
    currentGpuTemp = temps.gpu;
    document.getElementById('telem-thermal-cpu').textContent = currentCpuTemp;
    document.getElementById('telem-thermal-gpu').textContent = currentGpuTemp;
    document.getElementById('telem-noise').textContent = temps.noise;
    if (meshNodes.gpuLogoMat && !thermalMode) {
      const col = stressActive ? '#ef4444' : activeRgbTheme === 'rainbow' ? '#10f06a' : activeRgbTheme;
      meshNodes.gpuLogoMat.color.set(col);
      meshNodes.gpuLogoMat.emissive.set(col);
    }
    if (thermalMode) {
      window.Scene3D.applyThermalHeatmap(benchGroup, true, { cpu: currentCpuTemp, gpu: currentGpuTemp }, meshNodes);
    }
    window.Models3D.updateAioLcdDisplay(meshNodes, getSceneThermalState());
    renderThermalBenchView();
  });

  document.querySelectorAll('[data-light]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-light]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeLightMode = btn.dataset.light;
      window.Scene3D.applyLightingProfile(sceneCtx, activeLightMode);
    });
  });

  document.querySelectorAll('#rgb-sync-group .rgb-swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#rgb-sync-group .rgb-swatch').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeRgbTheme = btn.dataset.rgb;
      if (activeRgbTheme !== 'rainbow') {
        applyCurrentRgbColor();
        showToast('RGB Sync Lighting Updated');
      } else {
        showToast('RGB Sync: Spectral Cycle');
      }
    });
  });

  document.getElementById('btn-help-shortcuts')?.addEventListener('click', toggleHelpOverlay);

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'l' || e.key === 'L') toggleLabelsState();
    if (e.key === 'e' || e.key === 'E') document.getElementById('btn-explode')?.click();
    if (e.key === 'c' || e.key === 'C') toggleCaseMode();
    if (e.key === 'w' || e.key === 'W') document.getElementById('btn-wireframe')?.click();
    if (e.key === 't' || e.key === 'T') document.getElementById('btn-thermal')?.click();
    if (e.key === 's' || e.key === 'S') document.getElementById('btn-stress')?.click();
    if (e.key === 'v' || e.key === 'V') document.getElementById('btn-gpu-mount')?.click();
    if (e.key === 'r' || e.key === 'R') document.getElementById('btn-auto-rotate')?.click();
    if (e.key === 'h' || e.key === 'H' || e.key === '?') toggleHelpOverlay();
    if (e.key === 'Escape' && helpVisible) toggleHelpOverlay();
    if (e.key === '1') setCamPreset('iso', 'btn-cam-iso');
    if (e.key === '2') setCamPreset('front', 'btn-cam-front');
    if (e.key === '3') setCamPreset('top', 'btn-cam-top');
    if (e.key === '4') setCamPreset('side', 'btn-cam-side');
  });

  // Keyboard Shortcut Help Overlay
  let helpVisible = false;
  function toggleHelpOverlay() {
    let overlay = document.getElementById('help-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'help-overlay';
      overlay.style.cssText = 'position:absolute;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(4,6,10,0.88);backdrop-filter:blur(16px);pointer-events:auto;';
      overlay.innerHTML =
        '<div style="position:relative;background:rgba(10,15,23,0.98);border:1px solid rgba(16,240,106,0.4);border-radius:14px;padding:28px 36px;max-width:520px;width:90%;box-shadow:0 24px 56px rgba(0,0,0,0.75);">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
            '<div style="font-family:var(--font-display);font-size:14px;font-weight:800;color:var(--accent-emerald);letter-spacing:1px;text-transform:uppercase;">KEYBOARD SHORTCUTS</div>' +
            '<button id="btn-close-help" class="panel-close-btn" aria-label="Close Help">✕</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:72px 1fr;gap:6px 14px;font-family:var(--font-mono);font-size:11px;">' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">H / ?</span><span style="color:#e2e8f0;">Toggle this help panel</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">E</span><span style="color:#e2e8f0;">Explode / Collapse components</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">L</span><span style="color:#e2e8f0;">Toggle 3D part labels</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">C</span><span style="color:#e2e8f0;">Toggle PC case enclosure</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">W</span><span style="color:#e2e8f0;">Wireframe render mode</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">T</span><span style="color:#e2e8f0;">Thermal heatmap overlay</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">S</span><span style="color:#e2e8f0;">Stress test toggle</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">V</span><span style="color:#e2e8f0;">GPU mount: Vertical / Horizontal</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">R</span><span style="color:#e2e8f0;">Auto-rotate camera</span>' +
            '<span style="color:var(--accent-emerald);font-weight:800;text-align:right;">1-4</span><span style="color:#e2e8f0;">Camera presets: ISO / Front / Top / Side</span>' +
          '</div>' +
          '<div style="margin-top:16px;font-family:var(--font-mono);font-size:9px;color:var(--text-muted);text-align:center;">Press H, Esc, or click backdrop to close</div>' +
        '</div>';
      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay || ev.target.id === 'btn-close-help') toggleHelpOverlay();
      });
      document.body.appendChild(overlay);
    }
    helpVisible = !helpVisible;
    overlay.style.display = helpVisible ? 'flex' : 'none';
  }

  // Render Loop (Delta-Time Normalized for 60fps & Software WebGL Consistency)
  let lastFrameTime = performance.now();
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const rawDt = Math.max(0.001, (now - lastFrameTime) / 1000);
    const dt = Math.min(rawDt, 0.25);
    lastFrameTime = now;

    const camAlpha = 1 - Math.exp(-8.5 * dt);
    if (isCameraTransitioning) {
      camera.position.lerp(targetCameraPos, camAlpha);
      controls.target.lerp(targetCameraTarget, camAlpha);
      controls.update();
      if (camera.position.distanceTo(targetCameraPos) < 0.7 && controls.target.distanceTo(targetCameraTarget) < 0.7) {
        camera.position.copy(targetCameraPos);
        controls.target.copy(targetCameraTarget);
        isCameraTransitioning = false;
      }
    } else {
      controls.update();
    }

    if (zoomSlider) {
      const curDist = camera.position.distanceTo(controls.target);
      if (Math.abs(parseFloat(zoomSlider.value) - curDist) > 3) zoomSlider.value = Math.round(curDist);
    }

    const targetExplode = exploded ? 1 : 0;
    const expAlpha = 1 - Math.exp(-10 * dt);
    explodeProgress += (targetExplode - explodeProgress) * expAlpha;

    if (meshNodes.gpu) meshNodes.gpu.position.z = 75 * explodeProgress;
    if (meshNodes.cooler) meshNodes.cooler.position.z = 52 * explodeProgress;
    if (meshNodes.ram) meshNodes.ram.position.z = 42 * explodeProgress;
    if (meshNodes.storage) meshNodes.storage.position.z = 28 * explodeProgress;
    if (meshNodes.psu) meshNodes.psu.position.set(-62 - 48 * explodeProgress, 30, 12 + 32 * explodeProgress);

    const isTerraCase = !!(activeBuild.chassis && activeBuild.chassis.id.includes('terra'));
    if (meshNodes.caseLeftDoor) meshNodes.caseLeftDoor.position.z = (isTerraCase ? 50 : 84) + 76 * explodeProgress;
    if (meshNodes.caseFront) meshNodes.caseFront.position.x = (isTerraCase ? 98 : 121) + 72 * explodeProgress;
    if (meshNodes.caseTop) meshNodes.caseTop.position.y = (isTerraCase ? 226 : 252) + 52 * explodeProgress;
    if (meshNodes.caseRight) meshNodes.caseRight.position.z = -86 - 52 * explodeProgress;

    if (activeRgbTheme === 'rainbow' && !thermalMode) {
      const hueColor = new THREE.Color().setHSL((now * 0.00018) % 1, 0.9, 0.55);
      window.Scene3D.applyRgbSyncColor(sceneCtx, '#' + hueColor.getHexString());
    }

    const spinRate = (stressActive ? 14 : selectedFanProfile === 'silent' ? 2.4 : selectedFanProfile === 'extreme' ? 11 : 5.2) * Math.min(dt, 0.1);
    meshNodes.gpuFanList.forEach((f) => {
      f.rotation.z += f.userData.isCenterFan ? -spinRate * 1.08 : spinRate;
    });
    meshNodes.chassisFanList.forEach((f) => { if (f) f.rotation.z += spinRate; });
    meshNodes.caseFanList.forEach((f) => { if (f) f.rotation.z += spinRate; });
    meshNodes.coolerFanList.forEach((f) => { if (f) f.rotation.z += spinRate * 1.15; });

    updateSpatialLabels();
    renderer.render(scene, camera);
  }
  animate();

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', handleResize);

  // Bootstrap Catalog, Default Showcase Build & Shareable URL (?rig=...)
  async function loadCatalog() {
    try {
      const cRes = await fetch('/api/components');
      if (cRes.ok) allComponents = await cRes.json();
    } catch (err) {
      console.warn('Components fetch error:', err);
    }
    try {
      const pRes = await fetch('/api/live-prices');
      if (pRes.ok) {
        const pData = await pRes.json();
        liveMarketQuotes = pData.quotes || {};
      }
    } catch (e) {}

    if (allComponents.length > 0) {
      const find = (id) => allComponents.find((c) => c.id === id);
      activeBuild.cpu = find('cpu_7800x3d') || allComponents[0];
      activeBuild.motherboard = find('mb_b650e');
      activeBuild.gpu = find('gpu_rtx_4080s') || find('gpu_rtx_4090');
      activeBuild.memory = find('ram_dominator_titanium_64gb');
      activeBuild.cooler = find('cooler_icue_titan_360');
      activeBuild.psu = find('psu_rm1000x_shift');
      activeBuild.storage = find('ssd_samsung_990pro');
      activeBuild.chassis = find('case_5000d_airflow');

      const params = new URLSearchParams(window.location.search);
      const rigParam = params.get('rig');
      if (rigParam) {
        rigParam.split(',').forEach((pair) => {
          const [k, v] = pair.split('=');
          if (k && v && Object.prototype.hasOwnProperty.call(activeBuild, k)) {
            const match = find(decodeURIComponent(v));
            if (match) activeBuild[k] = match;
          }
        });
      }
    }

    update3DScene();
    refreshAllViews();
    syncBuildAnalysis();
  }
  loadCatalog();
})();
