// Spatial 3D Studio Environment, Lighting, Architectural Chassis Frame, Rear I/O Spine, and Thermal Heatmap
(function (global) {
  function disposeObject3D(root) {
    if (!root) return;
    root.traverse((obj) => {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          if (m.roughnessMap) m.roughnessMap.dispose();
          if (m.bumpMap) m.bumpMap.dispose();
          m.dispose();
        });
      }
    });
  }

  function createStudioEnvironment(renderer) {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0b1019);

    // Overhead main diffused softbox strip (creates crisp specular reflections on brushed metal)
    const topStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(190, 74),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    topStrip.position.set(0, 88, 12);
    topStrip.rotation.x = Math.PI / 2;
    envScene.add(topStrip);

    // Secondary overhead cool accent rim strip
    const rimStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 30),
      new THREE.MeshBasicMaterial({ color: 0xbae6fd, side: THREE.DoubleSide })
    );
    rimStrip.position.set(0, 72, -72);
    rimStrip.rotation.x = Math.PI / 3;
    envScene.add(rimStrip);

    // Warm key bounce panel on right-front
    const keyPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 120),
      new THREE.MeshBasicMaterial({ color: 0xfef3c7, side: THREE.DoubleSide })
    );
    keyPanel.position.set(88, 36, 48);
    keyPanel.lookAt(0, 20, 0);
    envScene.add(keyPanel);

    // Cool slate fill panel on left
    const fillPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(130, 100),
      new THREE.MeshBasicMaterial({ color: 0x64748b, side: THREE.DoubleSide })
    );
    fillPanel.position.set(-88, 32, 22);
    fillPanel.lookAt(0, 20, 0);
    envScene.add(fillPanel);

    // Subtle emerald studio floor accent bounce
    const floorBounce = new THREE.Mesh(
      new THREE.CircleGeometry(95, 32),
      new THREE.MeshBasicMaterial({ color: 0x102a22, side: THREE.DoubleSide })
    );
    floorBounce.position.set(0, -40, 0);
    floorBounce.rotation.x = -Math.PI / 2;
    envScene.add(floorBounce);

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envMap = pmrem.fromScene(envScene, 0.035).texture;
    pmrem.dispose();
    return envMap;
  }

  function getFramingPreset(preset, layout) {
    const L = layout || { sidebarOpen: true, trayOpen: true, viewportWidth: window.innerWidth };
    const compact = L.viewportWidth <= 1380;
    // Offset camera target right (+X/-Z in ISO view) & slightly lower in Y so rig sits cleanly in the free viewport left of sidebar and above benchmark tray
    const xShift = L.sidebarOpen ? (compact ? 42 : 46) : 0;
    const zShift = L.sidebarOpen ? (compact ? -14 : -18) : 0;
    const yShift = L.trayOpen ? -24 : 0;

    if (preset === 'front') {
      return {
        pos: new THREE.Vector3(365, 132 + yShift * 0.4, (L.sidebarOpen ? -48 : 0)),
        target: new THREE.Vector3(0, 118 + yShift, (L.sidebarOpen ? -48 : 0)),
      };
    }
    if (preset === 'top') {
      return {
        pos: new THREE.Vector3(xShift * 0.8, 435, 78 + (L.trayOpen ? 30 : 0)),
        target: new THREE.Vector3(xShift * 0.8, 112, (L.trayOpen ? 28 : 0)),
      };
    }
    if (preset === 'side') {
      return {
        pos: new THREE.Vector3(L.sidebarOpen ? 56 : 0, 128 + yShift * 0.6, 395),
        target: new THREE.Vector3(L.sidebarOpen ? 56 : 0, 118 + yShift, 0),
      };
    }
    // Default ISO
    return {
      pos: new THREE.Vector3(295 + xShift * 0.55, 198 + yShift * 0.35, 395 + zShift * 0.45),
      target: new THREE.Vector3(xShift, 114 + yShift, zShift),
    };
  }

  function initScene(container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.00068);

    const initCam = getFramingPreset('iso', {
      sidebarOpen: true,
      trayOpen: true,
      viewportWidth: window.innerWidth,
    });
    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 1, 2400);
    camera.position.copy(initCam.pos);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    const studioEnv = createStudioEnvironment(renderer);
    scene.environment = studioEnv;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minPolarAngle = 0.08;
    controls.minDistance = 60;
    controls.maxDistance = 880;
    controls.screenSpacePanning = true;
    controls.target.copy(initCam.target);

    // Calibrated 4-Point Architectural Rig Lighting
    const ambientLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.78);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    keyLight.position.set(220, 320, 240);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 60;
    keyLight.shadow.camera.far = 720;
    keyLight.shadow.camera.left = -200;
    keyLight.shadow.camera.right = 200;
    keyLight.shadow.camera.top = 250;
    keyLight.shadow.camera.bottom = -140;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.radius = 2;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.56);
    fillLight.position.set(-220, 155, 175);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.68);
    rimLight.position.set(-60, 230, -260);
    scene.add(rimLight);

    const interiorLight = new THREE.PointLight(0xe2e8f0, 0.36, 320, 1.5);
    interiorLight.position.set(14, 155, 95);
    scene.add(interiorLight);

    // Workbench Studio Turntable Pedestal
    const benchGroup = new THREE.Group();
    scene.add(benchGroup);

    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f17,
      metalness: 0.86,
      roughness: 0.32,
    });
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(236, 246, 10, 72), pedestalMat);
    pedestal.position.y = -5;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const pedestalRim = new THREE.Mesh(
      new THREE.TorusGeometry(236, 1.1, 12, 96),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.94, roughness: 0.2 })
    );
    pedestalRim.rotation.x = Math.PI / 2;
    pedestalRim.position.y = 0.2;
    scene.add(pedestalRim);

    const accentRingMat = new THREE.MeshStandardMaterial({
      color: 0x10f06a,
      emissive: 0x10f06a,
      emissiveIntensity: 0.22,
      roughness: 0.18,
      metalness: 0.5,
    });
    const accentRing = new THREE.Mesh(new THREE.TorusGeometry(233, 0.75, 10, 96), accentRingMat);
    accentRing.rotation.x = Math.PI / 2;
    accentRing.position.y = 0.45;
    accentRing.userData.isRgbTarget = true;
    scene.add(accentRing);

    const gridCircle = new THREE.PolarGridHelper(226, 16, 8, 64, 0x263244, 0x151c28);
    gridCircle.position.y = 0.3;
    scene.add(gridCircle);

    // Architectural Open-Bench Showcase Spine (Upright Workstation Frame)
    const rigChassis = new THREE.Group();
    benchGroup.add(rigChassis);

    const chassisMetal = new THREE.MeshStandardMaterial({ color: 0x131822, metalness: 0.52, roughness: 0.52 });
    const chassisAccent = new THREE.MeshStandardMaterial({ color: 0x1f2635, metalness: 0.72, roughness: 0.36 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x080a0f, roughness: 0.88, metalness: 0.05 });

    // Full-ATX Outer Frame group (adaptable when Terra Mini-ITX SFF case is mounted)
    const atxBenchExtras = new THREE.Group();
    rigChassis.add(atxBenchExtras);

    // 4 Machined Anti-Vibration Aluminum Feet (Y = 0..5)
    [[-104, -74], [104, -74], [-104, 74], [104, 74]].forEach(([fx, fz]) => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9.5, 4, 24), chassisAccent);
      foot.position.set(fx, 3, fz);
      foot.castShadow = true;
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 1.2, 24), rubberMat);
      pad.position.set(fx, 0.6, fz);
      atxBenchExtras.add(foot, pad);
    });

    // Lower Basement Floor Plate (Y = 5..9)
    const lowerFloor = new THREE.Mesh(new THREE.BoxGeometry(246, 4, 174), chassisMetal);
    lowerFloor.position.set(0, 7, 0);
    lowerFloor.receiveShadow = true;
    lowerFloor.castShadow = true;
    lowerFloor.userData.partType = 'chassis';
    atxBenchExtras.add(lowerFloor);

    // Partial PSU Shroud / Main Chamber Floor (Y = 54)
    const mainDeck = new THREE.Mesh(new THREE.BoxGeometry(244, 3, 172), chassisMetal);
    mainDeck.position.set(0, 54, 0);
    mainDeck.receiveShadow = true;
    mainDeck.castShadow = true;
    mainDeck.userData.partType = 'chassis';
    atxBenchExtras.add(mainDeck);

    // Right-Half PSU Shroud Fascia (Leaves PSU showcase open on left)
    const shroudFascia = new THREE.Mesh(new THREE.BoxGeometry(134, 44, 1.8), chassisAccent);
    shroudFascia.position.set(55, 31, 84);
    shroudFascia.receiveShadow = true;
    shroudFascia.userData.partType = 'chassis';
    atxBenchExtras.add(shroudFascia);

    // Rubber Cable Pass-Through Grommets on Shroud Top Deck
    [[44, 55.6, -12], [38, 55.6, 22], [-18, 55.6, 18]].forEach(([gx, gy, gz]) => {
      const dg = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 12), rubberMat);
      dg.position.set(gx, gy, gz);
      atxBenchExtras.add(dg);
    });

    // Vertical Motherboard Spine Tray (Z = -48, Y = 55..244)
    const mbTray = new THREE.Mesh(new THREE.BoxGeometry(212, 189, 3.2), chassisMetal);
    mbTray.position.set(0, 149.5, -48);
    mbTray.receiveShadow = true;
    mbTray.castShadow = true;
    mbTray.userData.partType = 'chassis';
    atxBenchExtras.add(mbTray);

    // Tray Cable Grommets (Right vertical channel)
    [[68, 118], [68, 172]].forEach(([gx, gy]) => {
      const gr = new THREE.Mesh(new THREE.BoxGeometry(10, 32, 4.0), rubberMat);
      gr.position.set(gx, gy, -48);
      atxBenchExtras.add(gr);
    });

    // Vertical Rear Corner Spine Pillars
    [[-114, -48], [114, -48]].forEach(([cx, cz]) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(8, 240, 10), chassisAccent);
      pillar.position.set(cx, 128, cz);
      pillar.castShadow = true;
      pillar.userData.partType = 'chassis';
      atxBenchExtras.add(pillar);
    });

    // Top Open-Bench Radiator Support Frame (Y = 247, Z = -12)
    const topBridge = new THREE.Mesh(new THREE.BoxGeometry(236, 4.5, 76), chassisAccent);
    topBridge.position.set(0, 248, -12);
    topBridge.castShadow = true;
    topBridge.userData.partType = 'chassis';
    atxBenchExtras.add(topBridge);

    // Brass Motherboard Standoffs protruding to Z = -40 (Core ITX keep always, outer ATX in extras)
    const standoffMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.16 });
    [[-80, 212], [22, 212], [-80, 118], [22, 118]].forEach(([sx, sy]) => {
      const so = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 6.5, 12), standoffMat);
      so.rotation.x = Math.PI / 2;
      so.position.set(sx, sy, -43.2);
      rigChassis.add(so);
    });
    [[44, 212], [44, 120], [-80, 64], [44, 64]].forEach(([sx, sy]) => {
      const so = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 6.5, 12), standoffMat);
      so.rotation.x = Math.PI / 2;
      so.position.set(sx, sy, -43.2);
      atxBenchExtras.add(so);
    });

    // Rear 7x PCIe Vented Expansion Slot Brackets (at -X rear spine Y=65..112)
    const pcieBracketMat = new THREE.MeshStandardMaterial({ color: 0x1e2532, metalness: 0.9, roughness: 0.25 });
    const thumbScrewMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.96, roughness: 0.15 });
    for (let slot = 0; slot < 6; slot++) {
      const sy = 64 + slot * 7.8;
      const br = new THREE.Mesh(new THREE.BoxGeometry(2.5, 5.5, 44), pcieBracketMat);
      br.position.set(-108, sy, -14);
      atxBenchExtras.add(br);
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.2, 10), thumbScrewMat);
      screw.rotation.z = Math.PI / 2;
      screw.position.set(-106.5, sy, -38);
      atxBenchExtras.add(screw);
    }

    // Rear 120mm Chassis Exhaust Fan with Open Stator & Protective Guard Ring
    const rearFanGroup = new THREE.Group();
    rearFanGroup.position.set(-106, 178, -16);
    rearFanGroup.rotation.y = Math.PI / 2;

    const rearOuterRing = new THREE.Mesh(
      new THREE.TorusGeometry(20.5, 2.4, 12, 36),
      chassisMetal
    );
    rearFanGroup.add(rearOuterRing);

    const rearHaloMat = new THREE.MeshStandardMaterial({
      color: 0x10f06a,
      emissive: 0x10f06a,
      emissiveIntensity: 0.55,
      roughness: 0.18,
    });
    const rearHalo = new THREE.Mesh(new THREE.TorusGeometry(19, 0.85, 10, 36), rearHaloMat);
    rearHalo.position.z = 2.6;
    rearHalo.userData.isRgbTarget = true;
    rearFanGroup.add(rearHalo);

    const rearBladesGroup = new THREE.Group();
    const rearHub = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 5.8, 4.5, 24), chassisAccent);
    rearHub.rotation.x = Math.PI / 2;
    rearBladesGroup.add(rearHub);
    const rearCap = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.6, 24), thumbScrewMat);
    rearCap.rotation.x = Math.PI / 2;
    rearCap.position.z = 2.4;
    rearBladesGroup.add(rearCap);

    const rearBladeMat = new THREE.MeshStandardMaterial({ color: 0x1e2636, metalness: 0.85, roughness: 0.22, side: THREE.DoubleSide });
    for (let rb = 0; rb < 9; rb++) {
      const arm = new THREE.Group();
      arm.rotation.z = (rb * Math.PI * 2) / 9;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.8, 6.2), rearBladeMat);
      blade.position.set(11.6, 0, 0);
      blade.rotation.x = 0.55;
      arm.add(blade);
      rearBladesGroup.add(arm);
    }
    rearFanGroup.add(rearBladesGroup);
    atxBenchExtras.add(rearFanGroup);

    // Expose globally for debugging & Playwright verification
    Object.assign(window, { renderer, scene });

    return {
      scene,
      camera,
      renderer,
      controls,
      benchGroup,
      rigChassis,
      atxBenchExtras,
      lowerFloor,
      mainDeck,
      rearBladesGroup,
      accentRingMat,
      lights: { ambientLight, keyLight, fillLight, rimLight, interiorLight },
    };
  }

  function setChassisFormFactor(sceneCtx, isSffEnclosed) {
    if (!sceneCtx || !sceneCtx.atxBenchExtras) return;
    sceneCtx.atxBenchExtras.visible = !isSffEnclosed;
  }

  function applyLightingProfile(sceneCtx, mode) {
    const { ambientLight, keyLight, fillLight, rimLight, interiorLight } = sceneCtx.lights;
    const bg = sceneCtx.scene.background;
    if (mode === 'studio') {
      ambientLight.color.setHex(0xdbeafe);
      ambientLight.intensity = 0.78;
      keyLight.color.setHex(0xfffbeb);
      keyLight.intensity = 1.5;
      fillLight.color.setHex(0x94a3b8);
      fillLight.intensity = 0.56;
      rimLight.color.setHex(0x38bdf8);
      rimLight.intensity = 0.68;
      interiorLight.color.setHex(0xe2e8f0);
      interiorLight.intensity = 0.52;
      bg.setHex(0x06090e);
    } else if (mode === 'ice') {
      ambientLight.color.setHex(0xcffafe);
      ambientLight.intensity = 0.72;
      keyLight.color.setHex(0xf0f9ff);
      keyLight.intensity = 1.38;
      fillLight.color.setHex(0x64748b);
      fillLight.intensity = 0.52;
      rimLight.color.setHex(0x38bdf8);
      rimLight.intensity = 0.98;
      interiorLight.color.setHex(0x7dd3fc);
      interiorLight.intensity = 0.65;
      bg.setHex(0x040914);
    } else if (mode === 'stealth') {
      ambientLight.color.setHex(0x475569);
      ambientLight.intensity = 0.45;
      keyLight.color.setHex(0xcbd5e1);
      keyLight.intensity = 0.98;
      fillLight.color.setHex(0x334155);
      fillLight.intensity = 0.38;
      rimLight.color.setHex(0x10f06a);
      rimLight.intensity = 0.58;
      interiorLight.color.setHex(0x10f06a);
      interiorLight.intensity = 0.38;
      bg.setHex(0x030508);
    }
  }

  function applyRgbSyncColor(sceneCtx, hexColor) {
    if (!sceneCtx || !sceneCtx.scene) return;
    const c = new THREE.Color(hexColor);
    sceneCtx.scene.traverse((node) => {
      if (node.isMesh && node.userData && node.userData.isRgbTarget && node.material) {
        if (!node.userData.fixedHue) {
          node.material.color.copy(c);
          if (node.material.emissive) {
            node.material.emissive.copy(c);
          }
        }
      }
    });
  }

  // Per-component realistic thermal heatmap (preserves 3D shading!)
  function applyThermalHeatmap(benchGroup, enabled, temps, meshNodes) {
    function colorForPart(partKey) {
      const cpuT = temps.cpu || 45;
      const gpuT = temps.gpu || 42;
      let t = 28;
      if (partKey === 'cpu') t = cpuT;
      else if (partKey === 'gpu') t = gpuT;
      else if (partKey === 'cooler') t = 28 + (cpuT - 25) * 0.52;
      else if (partKey === 'motherboard') t = 34 + (cpuT - 25) * 0.35;
      else if (partKey === 'storage') t = 42 + (gpuT - 30) * 0.25;
      else if (partKey === 'ram') t = 36 + (cpuT - 30) * 0.15;
      else if (partKey === 'psu') t = 35 + (gpuT - 30) * 0.18;
      else t = 25;

      const norm = Math.max(0, Math.min(1, (t - 24) / 62));
      const c = new THREE.Color();
      if (norm < 0.33) {
        c.lerpColors(new THREE.Color(0x1d4ed8), new THREE.Color(0x06b6d4), norm / 0.33);
      } else if (norm < 0.66) {
        c.lerpColors(new THREE.Color(0x06b6d4), new THREE.Color(0xf59e0b), (norm - 0.33) / 0.33);
      } else {
        c.lerpColors(new THREE.Color(0xf59e0b), new THREE.Color(0xef4444), (norm - 0.66) / 0.34);
      }
      return c;
    }

    function detectPartKey(node) {
      let cur = node;
      while (cur) {
        if (cur === meshNodes.cpu) return 'cpu';
        if (cur === meshNodes.gpu) return 'gpu';
        if (cur === meshNodes.cooler) return 'cooler';
        if (cur === meshNodes.motherboard) return 'motherboard';
        if (cur === meshNodes.ram) return 'ram';
        if (cur === meshNodes.storage) return 'storage';
        if (cur === meshNodes.psu) return 'psu';
        cur = cur.parent;
      }
      return 'chassis';
    }

    benchGroup.traverse((node) => {
      if (!node.isMesh || node.userData.isGlass || node === meshNodes.aioScreenMesh) return;
      if (enabled) {
        if (!node.userData.originalMat) {
          node.userData.originalMat = node.material;
        }
        const key = detectPartKey(node);
        const col = colorForPart(key);
        node.material = new THREE.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: key === 'cpu' || key === 'gpu' ? 0.38 : 0.14,
          roughness: 0.45,
          metalness: 0.25,
          wireframe: node.userData.originalMat.wireframe || false,
        });
      } else if (node.userData.originalMat) {
        if (node.material && node.material !== node.userData.originalMat) {
          node.material.dispose();
        }
        node.material = node.userData.originalMat;
        delete node.userData.originalMat;
      }
    });
  }

  global.Scene3D = {
    disposeObject3D,
    initScene,
    getFramingPreset,
    setChassisFormFactor,
    applyLightingProfile,
    applyRgbSyncColor,
    applyThermalHeatmap,
  };
})(window);
