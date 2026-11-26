// High-Realism Procedural Textures & Architectural 3D Hardware Models
(function (global) {
  function srgbTex(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 8;
    return tex;
  }

  function createMotherboardPcbTexture(mb) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext('2d');

    const isSilver = mb && (mb.colorway || '').includes('silver');
    const isObsidian = mb && (mb.colorway || '').includes('obsidian');
    ctx.fillStyle = isSilver ? '#141b28' : isObsidian ? '#070a10' : '#0b0f18';
    ctx.fillRect(0, 0, 1024, 1024);

    // Micro PCB matte weave grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.028)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, 1024);
      ctx.moveTo(0, x); ctx.lineTo(1024, x);
      ctx.stroke();
    }

    // Copper/gold high-speed PCIe & DDR5 memory traces
    ctx.strokeStyle = isSilver ? '#94a3b8' : '#b8942e';
    ctx.lineWidth = 1.6;
    for (let t = 0; t < 28; t++) {
      ctx.beginPath();
      const sx = 390 + (t % 7) * 26;
      const sy = 360 + Math.floor(t / 7) * 14;
      ctx.moveTo(sx, sy);
      const mx = sx + (t > 14 ? 140 : -110);
      const my = sy + (t > 14 ? 110 : 180);
      ctx.lineTo(mx, my);
      ctx.lineTo(mx + (t > 14 ? 160 : -80), my + 80);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Audio isolation trace
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(65, 560);
    ctx.lineTo(175, 560);
    ctx.lineTo(175, 960);
    ctx.stroke();

    // Silkscreen typography
    const mbTitle = mb ? (mb.name || 'ARCHITECT PRO').toUpperCase().slice(0, 28) : 'ARCHITECT PRO';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(mbTitle, 240, 120);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('PCIEX16_1 GEN5 SAFESLOT // DUAL CHANNEL DDR5 / M.2 ARMOR', 240, 144);
    ctx.fillText('SUPREMEFX AUDIO ISOLATION', 72, 920);

    return srgbTex(c);
  }

  function createCpuIhsTexture(cpu) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#9aa4b2');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#7c8694');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(512, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 476, 476);

    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(32, 32); ctx.lineTo(64, 32); ctx.lineTo(32, 64);
    ctx.closePath();
    ctx.fill();

    const isAmd = !cpu || cpu.socket === 'am5' || cpu.socket === 'am4' || (cpu.brand || '').toLowerCase() === 'amd';
    const cpuName = cpu ? (cpu.name || 'Ryzen 7 7800X3D') : 'Ryzen 7 7800X3D';

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    if (isAmd) {
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('AMD', 256, 128);
      ctx.font = '600 44px sans-serif';
      ctx.fillText('RYZEN', 256, 180);
      ctx.font = 'bold 46px monospace';
      ctx.fillText(cpuName.replace(/AMD\s*Ryzen\s*/i, '').trim(), 256, 250);
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('DIFFUSED IN TAIWAN · MADE IN MALAYSIA', 256, 315);
      ctx.fillText((cpu && cpu.socket === 'am4' ? 'AM4 PGA-1331' : 'AM5 LGA-1718') + ' DESKTOP', 256, 344);
    } else {
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('intel', 256, 130);
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('CORE', 256, 182);
      ctx.font = 'bold 46px monospace';
      ctx.fillText(cpuName.replace(/Intel\s*Core\s*/i, '').trim(), 256, 252);
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('LGA1700 PERFORMANCE ARCHITECTURE', 256, 318);
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(376, 376, 80, 80);
    ctx.fillStyle = '#cbd5e1';
    for (let r = 0; r < 5; r++) {
      for (let col = 0; col < 5; col++) {
        if ((r + col) % 2 === 0 || (r === 2 && col === 2)) {
          ctx.fillRect(384 + col * 13, 384 + r * 13, 10, 10);
        }
      }
    }
    return srgbTex(c);
  }

  function createRadiatorFinTexture(dark) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = dark ? '#0b0e15' : '#1b2230';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = dark ? '#263042' : '#64748b';
    ctx.lineWidth = 1.6;
    for (let x = 2; x < 512; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 4);
      ctx.lineTo(x + 1.5, 64);
      ctx.lineTo(x, 124);
      ctx.stroke();
    }
    ctx.fillStyle = dark ? '#141925' : '#334155';
    ctx.fillRect(0, 26, 512, 5);
    ctx.fillRect(0, 62, 512, 5);
    ctx.fillRect(0, 98, 512, 5);
    const tex = srgbTex(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    return tex;
  }

  function createMeshPerforationTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#121822';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#04060a';
    for (let y = 8; y < 256; y += 16) {
      const off = ((y / 16) % 2) * 8;
      for (let x = 8; x < 256; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x + off, y - 5);
        ctx.lineTo(x + off + 5, y + 4);
        ctx.lineTo(x + off - 5, y + 4);
        ctx.closePath();
        ctx.fill();
      }
    }
    const tex = srgbTex(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 8);
    return tex;
  }

  function createCoolerBadgeTexture(cooler) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const ctx = c.getContext('2d');
    const isDark = (cooler.colorway || '').includes('black') || (cooler.colorway || '').includes('stealth');
    ctx.fillStyle = isDark ? '#0e121b' : '#293446';
    ctx.fillRect(0, 0, 256, 512);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 240, 496);
    ctx.save();
    ctx.translate(128, 256);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '900 26px sans-serif';
    ctx.fillText((cooler.brand || 'NOCTUA').toUpperCase(), 0, -14);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText((cooler.name || 'TWIN TOWER').toUpperCase().slice(0, 20), 0, 16);
    ctx.restore();
    return srgbTex(c);
  }

  function createRamBadgeTexture(ram) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    const isSilver = ram && (ram.colorway || '').includes('silver');
    const bg = ctx.createLinearGradient(0, 0, 512, 128);
    bg.addColorStop(0, isSilver ? '#1e293b' : '#0b0f17');
    bg.addColorStop(0.5, isSilver ? '#475569' : '#1a2232');
    bg.addColorStop(1, '#090d14');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText((ram ? ram.brand : 'CORSAIR').toUpperCase() + ' // ' + (ram && ram.name.includes('Dominator') ? 'DOMINATOR' : ram && ram.name.includes('Trident') ? 'TRIDENT Z5' : 'VENGEANCE'), 256, 46);
    ctx.fillStyle = '#10f06a';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(((ram && ram.memType) || 'ddr5').toUpperCase() + '-' + (ram ? ram.memorySpeedMhz : 6000) + ' ' + (ram ? ram.capacityGb : 64) + 'GB', 256, 82);
    return srgbTex(c);
  }

  function createSsdTexture(ssd) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0c1018';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = ssd && ssd.id.includes('samsung') ? '#38bdf8' : ssd && ssd.id.includes('sn850') ? '#f59e0b' : '#10f06a';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 23px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText((ssd ? ssd.name : '990 PRO NVMe M.2').toUpperCase().slice(0, 30), 22, 50);
    ctx.fillStyle = '#10f06a';
    ctx.font = 'bold 16px monospace';
    ctx.fillText((ssd ? ssd.memorySpeedMhz.toLocaleString() : '7,450') + ' MB/s NVMe // ' + (ssd ? ssd.capacityGb : 2000) + 'GB', 22, 86);
    return srgbTex(c);
  }

  function createDebugCodeTexture(code) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#05080d';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#10f06a';
    ctx.font = 'bold 42px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, 64, 34);
    return srgbTex(c);
  }

  function createPsuSpecTexture(psu) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, 512, 256);
    bg.addColorStop(0, '#0c1018');
    bg.addColorStop(0.5, '#171f2e');
    bg.addColorStop(1, '#090c12');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 492, 236);

    const brand = psu ? (psu.brand || 'CORSAIR').toUpperCase() : 'CORSAIR';
    const name = psu ? (psu.name || 'RM1000X SHIFT').toUpperCase().slice(0, 26) : 'RM1000X SHIFT';
    const watts = psu ? (psu.psuWattage || 1000) : 1000;
    const isPlat = name.includes('PLATINUM') || watts >= 1200;

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(brand, 24, 44);
    ctx.fillStyle = '#10f06a';
    ctx.font = '900 22px monospace';
    ctx.fillText(name, 24, 74);

    ctx.fillStyle = isPlat ? '#cbd5e1' : '#d4af37';
    ctx.fillRect(390, 22, 96, 72);
    ctx.fillStyle = '#090b10';
    ctx.fillRect(393, 25, 90, 66);
    ctx.fillStyle = isPlat ? '#f8fafc' : '#fef08a';
    ctx.textAlign = 'center';
    ctx.font = '900 18px sans-serif';
    ctx.fillText('80', 438, 48);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('PLUS', 438, 64);
    ctx.font = '900 11px sans-serif';
    ctx.fillText(isPlat ? 'PLATINUM' : 'GOLD', 438, 82);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.fillRect(24, 108, 464, 22);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('DC OUTPUT   +3.3V     +5V      +12V SINGLE RAIL    +5Vsb', 30, 123);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px monospace';
    ctx.fillText('MAX AMPS     20A      20A      ' + (watts / 12).toFixed(1) + 'A (' + watts + 'W)      3.0A', 30, 152);
    ctx.fillStyle = '#10f06a';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('ATX 3.0 & PCIe 5.0 12V-2x6 // CONTINUOUS: ' + watts + 'W', 24, 196);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CE  UL  TUV  RoHS  OVP/OCP/SCP PROTECTED', 24, 228);

    return srgbTex(c);
  }

  function createGpuBackplateTexture(gpu) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 256;
    const ctx = c.getContext('2d');
    const style = gpu ? gpu.visualStyle : '';
    const isFe = style === 'founders_hourglass';
    const isRed = style === 'radeon_reference';
    const isSilver = style === 'triple_axial_rgb';

    const bg = ctx.createLinearGradient(0, 0, 1024, 256);
    bg.addColorStop(0, isSilver ? '#475569' : isFe ? '#1a1f29' : '#10151f');
    bg.addColorStop(0.5, isSilver ? '#64748b' : isFe ? '#272f3e' : '#18202e');
    bg.addColorStop(1, isSilver ? '#334155' : '#0d121b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 3) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    ctx.strokeStyle = isRed ? '#ef4444' : isFe ? '#64748b' : '#10f06a';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 1000, 232);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'left';
    const label = gpu ? gpu.name.toUpperCase().slice(0, 32) : 'GEFORCE RTX 4080 SUPER';
    ctx.fillText(label, 44, 118);

    ctx.fillStyle = isRed ? '#f87171' : '#94a3b8';
    ctx.font = 'bold 18px monospace';
    const sub = (gpu ? gpu.vramGb : 16) + 'GB GDDR6X // ' + (gpu ? gpu.tdpWatts : 320) + 'W TDP // ' + (gpu ? gpu.lengthMm : 304) + 'mm';
    ctx.fillText(sub, 44, 158);
    return srgbTex(c);
  }

  function createGpuSideLogoTexture(gpu) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#070a10';
    ctx.fillRect(0, 0, 512, 64);
    const isRed = gpu && gpu.visualStyle === 'radeon_reference';
    const isBlue = gpu && gpu.visualStyle === 'triple_fan_translucent';
    const isFe = gpu && gpu.visualStyle === 'founders_hourglass';
    ctx.fillStyle = isRed ? '#ef4444' : isBlue ? '#38bdf8' : isFe ? '#f8fafc' : '#10f06a';
    ctx.font = '900 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = isRed ? 'RADEON RX' : gpu && gpu.visualStyle === 'rog_strix_triple' ? 'ROG STRIX RTX' : 'GEFORCE RTX';
    ctx.fillText(text, 256, 34);
    return srgbTex(c);
  }

  function createWalnutWoodTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#5e3a21';
    ctx.fillRect(0, 0, 256, 512);
    for (let x = 0; x < 256; x += 3) {
      ctx.fillStyle = (x % 9 === 0) ? 'rgba(30, 15, 6, 0.36)' : 'rgba(145, 92, 52, 0.22)';
      ctx.fillRect(x, 0, 1.8, 512);
    }
    return srgbTex(c);
  }

  function createAioLcdTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const tex = srgbTex(c);
    return { canvas: c, texture: tex };
  }

  function updateAioLcdDisplay(meshNodes, state) {
    if (!meshNodes.aioCanvas) return;
    const c = meshNodes.aioCanvas;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.stroke();

    const tempNorm = Math.min(Math.max((state.cpuTemp - 20) / 75, 0), 1);
    const arcColor = state.cpuTemp > 80 ? '#ef4444' : state.cpuTemp > 65 ? '#f59e0b' : '#10f06a';
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(128, 128, 110, -Math.PI / 2, -Math.PI / 2 + tempNorm * Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px monospace';

    if (state.aioDisplayMetric === 0) {
      ctx.fillText('CPU PACKAGE', 128, 76);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 64px monospace';
      ctx.fillText(Math.round(state.cpuTemp) + '°C', 128, 142);
      ctx.fillStyle = arcColor;
      ctx.font = 'bold 15px monospace';
      const rpm = state.stressActive ? '2750 RPM' : (state.fanProfile === 'silent' ? '820 RPM' : '1420 RPM');
      ctx.fillText(rpm, 128, 184);
    } else if (state.aioDisplayMetric === 1) {
      ctx.fillText('COOLANT TEMP', 128, 76);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 64px monospace';
      const coolant = Math.round(24 + state.cpuTemp * 0.22);
      ctx.fillText(coolant + '°C', 128, 142);
      ctx.fillStyle = '#10f06a';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('FLOW 2.4 L/M', 128, 184);
    } else {
      ctx.fillText('SYSTEM DRAW', 128, 76);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 58px monospace';
      ctx.fillText(Math.round(state.peakWatts || 580) + 'W', 128, 142);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('GPU ' + Math.round(state.gpuTemp) + '°C', 128, 184);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText('CLICK TO CYCLE', 128, 218);

    if (meshNodes.aioTexture) meshNodes.aioTexture.needsUpdate = true;
  }

  // Helper: Extruded Chamfered Rect Plate with Circular/Rect Holes (Zero Z-fighting!)
  function createPunchedPlateGeometry(w, h, thickness, holesSpec, bevel) {
    const hw = w / 2;
    const hh = h / 2;
    const ch = Math.min(3.5, Math.min(hw, hh) * 0.12);
    const shape = new THREE.Shape();
    shape.moveTo(-hw + ch, -hh);
    shape.lineTo(hw - ch, -hh);
    shape.lineTo(hw, -hh + ch);
    shape.lineTo(hw, hh - ch);
    shape.lineTo(hw - ch, hh);
    shape.lineTo(-hw + ch, hh);
    shape.lineTo(-hw, hh - ch);
    shape.lineTo(-hw, -hh + ch);
    shape.closePath();

    (holesSpec || []).forEach((hole) => {
      const p = new THREE.Path();
      if (hole.type === 'circle') {
        p.absarc(hole.x, hole.y, hole.r, 0, Math.PI * 2, true);
      } else if (hole.type === 'rect') {
        const rx = hole.x - hole.w / 2;
        const ry = hole.y - hole.h / 2;
        p.moveTo(rx, ry);
        p.lineTo(rx, ry + hole.h);
        p.lineTo(rx + hole.w, ry + hole.h);
        p.lineTo(rx + hole.w, ry);
        p.closePath();
      }
      shape.holes.push(p);
    });

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: bevel !== false,
      bevelThickness: bevel !== false ? 0.65 : 0,
      bevelSize: bevel !== false ? 0.55 : 0,
      bevelSegments: 2,
      curveSegments: 28,
    });
    // Normalize UVs cleanly into [0..1] across width & height so procedural CanvasTextures map razor-sharp
    const posAttr = geo.attributes.position;
    const uvAttr = geo.attributes.uv;
    if (posAttr && uvAttr) {
      for (let i = 0; i < posAttr.count; i++) {
        const px = posAttr.getX(i);
        const py = posAttr.getY(i);
        uvAttr.setXY(i, (px + hw) / w, (py + hh) / h);
      }
      uvAttr.needsUpdate = true;
    }
    geo.translate(0, 0, -thickness / 2);
    return geo;
  }

  // Reusable Sculpted Axial Fan Assembly (with Open-Bore Square Frame option!)
  function createAxialFan(radius, bladeCount, opts) {
    const o = opts || {};
    const frameDepth = o.depth || 6.5;
    const axis = o.axis || 'z';
    const bladeColor = o.bladeColor || 0x161d29;
    const emissiveBlade = o.emissiveBlade || 0x000000;
    const haloColor = o.haloColor || null;
    const isReverse = !!o.reverse;
    const squareFrame = !!o.squareFrame;
    const padColor = o.padColor || 0x0a0d14;
    const frameColor = o.frameColor || 0x131823;

    const fanOuter = new THREE.Group();

    // Open-bore chamfered square outer housing (eliminates ugly solid boxes hiding fan blades!)
    if (squareFrame) {
      const boxSpan = o.boxSize || radius * 2.38;
      const boreGeo = createPunchedPlateGeometry(boxSpan, boxSpan, frameDepth, [
        { type: 'circle', x: 0, y: 0, r: radius * 1.03 },
      ]);
      const housingMat = new THREE.MeshStandardMaterial({
        color: frameColor,
        metalness: 0.78,
        roughness: 0.34,
      });
      const housing = new THREE.Mesh(boreGeo, housingMat);
      fanOuter.add(housing);

      // 4 anti-vibration rubber corner pads
      const padOff = boxSpan / 2 - 2.6;
      const padMat = new THREE.MeshStandardMaterial({ color: padColor, roughness: 0.85, metalness: 0.05 });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.5, frameDepth + 1.2), padMat);
        pad.position.set(sx * padOff, sy * padOff, 0);
        fanOuter.add(pad);
      });
    }

    const rotor = new THREE.Group();
    rotor.userData.isCenterFan = isReverse;
    rotor.userData.spinAxis = axis;

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.31, radius * 0.32, frameDepth * 0.68, 28),
      new THREE.MeshStandardMaterial({ color: 0x0d1119, metalness: 0.92, roughness: 0.16 })
    );
    hub.rotation.x = Math.PI / 2;
    rotor.add(hub);

    const emblem = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.21, radius * 0.21, 0.7, 28),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.96, roughness: 0.12 })
    );
    emblem.rotation.x = Math.PI / 2;
    emblem.position.z = frameDepth * 0.36;
    rotor.add(emblem);

    // Swept Wide Airfoil Blades
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(radius * 0.26, -radius * 0.14);
    bladeShape.quadraticCurveTo(radius * 0.58, -radius * 0.26, radius * 0.95, -radius * 0.09);
    bladeShape.lineTo(radius * 0.95, radius * 0.17);
    bladeShape.quadraticCurveTo(radius * 0.56, radius * 0.27, radius * 0.26, radius * 0.16);
    bladeShape.closePath();

    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.45,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.14,
      bevelSegments: 1,
    });
    const bladeMat = new THREE.MeshStandardMaterial({
      color: bladeColor,
      emissive: emissiveBlade,
      emissiveIntensity: emissiveBlade ? 0.58 : 0,
      metalness: emissiveBlade ? 0.2 : 0.84,
      roughness: emissiveBlade ? 0.22 : 0.22,
      transparent: !!emissiveBlade,
      opacity: emissiveBlade ? 0.88 : 1,
      side: THREE.DoubleSide,
    });

    for (let b = 0; b < bladeCount; b++) {
      const arm = new THREE.Group();
      arm.rotation.z = (b * Math.PI * 2) / bladeCount;
      const bm = new THREE.Mesh(bladeGeo, bladeMat);
      bm.rotation.x = isReverse ? -0.58 : 0.58;
      bm.position.z = -0.2;
      arm.add(bm);
      rotor.add(arm);
    }

    if (o.outerRing) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 0.95, 0.72, 10, 36),
        new THREE.MeshStandardMaterial({ color: 0x1a2232, metalness: 0.88, roughness: 0.22 })
      );
      rotor.add(ring);
    }

    if (haloColor) {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 1.02, 0.85, 10, 36),
        new THREE.MeshStandardMaterial({
          color: haloColor,
          emissive: haloColor,
          emissiveIntensity: 0.72,
          roughness: 0.15,
        })
      );
      halo.position.z = frameDepth * 0.42;
      halo.userData.isRgbTarget = true;
      fanOuter.add(halo);
    }

    fanOuter.add(rotor);
    if (axis === 'y') fanOuter.rotation.x = Math.PI / 2;
    else if (axis === 'x') fanOuter.rotation.y = Math.PI / 2;

    return { group: fanOuter, rotor };
  }

  function buildMotherboardMesh(mb, benchGroup, meshNodes, disposeFn) {
    if (meshNodes.motherboard) {
      benchGroup.remove(meshNodes.motherboard);
      disposeFn(meshNodes.motherboard);
    }
    const group = new THREE.Group();
    const ff = mb.formFactor || 'atx';
    const isITX = ff === 'mini_itx' || ff === 2;
    const isMatx = ff === 'micro_atx' || ff === 1;
    const isEatx = ff === 'e_atx' || ff === 3;

    const sizeX = isITX ? 110 : isEatx ? 152 : 136;
    const sizeY = isITX ? 110 : isMatx ? 128 : isEatx ? 162 : 160;
    const xLeft = -84;
    const yTop = 217;
    const cx = xLeft + sizeX / 2;
    const cy = yTop - sizeY / 2;
    const pcbZ = -38.5;

    const isSilver = (mb.colorway || '').includes('silver');
    const armorColor = isSilver ? 0xcbd5e1 : 0x1d2432;
    const accentArmor = isSilver ? 0x94a3b8 : 0x334155;

    // 1. Multi-layer PCB Board
    const pcbTex = createMotherboardPcbTexture(mb);
    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(sizeX, sizeY, 3.0),
      new THREE.MeshStandardMaterial({ map: pcbTex, roughness: 0.44, metalness: 0.35 })
    );
    pcb.position.set(cx, cy, pcbZ);
    pcb.receiveShadow = true;
    pcb.castShadow = true;
    group.add(pcb);

    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(sizeX + 0.6, sizeY + 0.6, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xb8942e, metalness: 0.92, roughness: 0.22 })
    );
    edge.position.set(cx, cy, pcbZ - 0.8);
    group.add(edge);

    // 2. CPU Socket at (-30, 170, -37)
    const sockX = -30, sockY = 170;
    const sockBase = new THREE.Mesh(
      new THREE.BoxGeometry(40, 40, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x10141d, metalness: 0.65, roughness: 0.38 })
    );
    sockBase.position.set(sockX, sockY, -36.0);

    const ilm = new THREE.Mesh(
      new THREE.BoxGeometry(42, 42, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.16 })
    );
    ilm.position.set(sockX, sockY, -35.2);

    const lever = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 38, 10),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.12 })
    );
    lever.position.set(sockX + 22, sockY, -34.5);
    group.add(sockBase, ilm, lever);

    // 3. Multi-Fin CNC VRM Heatsinks + Rear I/O Armor + Capacitors + Heatpipe
    const vrmMat = new THREE.MeshStandardMaterial({ color: armorColor, metalness: 0.9, roughness: 0.22 });
    const finMat = new THREE.MeshStandardMaterial({ color: accentArmor, metalness: 0.92, roughness: 0.18 });

    const vrmTop = new THREE.Mesh(new THREE.BoxGeometry(58, 15, 16), vrmMat);
    vrmTop.position.set(-30, 206, -30);
    vrmTop.castShadow = true;
    group.add(vrmTop);
    for (let f = -2; f <= 2; f++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(56, 1.6, 17), finMat);
      fin.position.set(-30, 206 + f * 2.5, -30);
      group.add(fin);
    }

    const ioArmor = new THREE.Mesh(new THREE.BoxGeometry(20, 74, 24), vrmMat);
    ioArmor.position.set(-73, 175, -26);
    ioArmor.castShadow = true;
    group.add(ioArmor);
    for (let gf = -3; gf <= 3; gf++) {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(21, 1.4, 25), finMat);
      groove.position.set(-73, 175 + gf * 8, -26);
      group.add(groove);
    }

    if (mb.rgbLighting) {
      const ioGlow = new THREE.Mesh(
        new THREE.BoxGeometry(10, 24, 1.5),
        new THREE.MeshStandardMaterial({
          color: 0x10f06a,
          emissive: 0x10f06a,
          emissiveIntensity: 0.78,
          roughness: 0.15,
        })
      );
      ioGlow.position.set(-73, 176, -13.2);
      ioGlow.userData.isRgbTarget = true;
      group.add(ioGlow);
    }

    // Nickel-plated heatpipe
    const vrmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 206, -24),
      new THREE.Vector3(-56, 206, -24),
      new THREE.Vector3(-64, 198, -24),
      new THREE.Vector3(-64, 155, -24),
    ]);
    const vrmPipe = new THREE.Mesh(
      new THREE.TubeGeometry(vrmCurve, 20, 1.8, 12, false),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.12 })
    );
    group.add(vrmPipe);

    // VRM Power Chokes & Cylindrical Polymer Capacitors
    const chokeMat = new THREE.MeshStandardMaterial({ color: 0x181d26, metalness: 0.9, roughness: 0.25 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.15 });
    for (let c = -3; c <= 3; c++) {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.8, 4.2), chokeMat);
      ch.position.set(-30 + c * 7.2, 194, -35.2);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 4.8, 12), capMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.set(-30 + c * 7.2, 189, -35.0);
      group.add(ch, cap);
    }

    // Rear USB Ports & Gold WiFi Coax Pegs on left edge (-84)
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.2 });
    for (let p = 0; p < 4; p++) {
      const usb = new THREE.Mesh(new THREE.BoxGeometry(2.5, 7.5, 4.5), usbMat);
      usb.position.set(-84.5, 152 + p * 11, -28);
      group.add(usb);
    }
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.12 });
    [198, 207].forEach((wy) => {
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4.5, 12), goldMat);
      peg.rotation.z = Math.PI / 2;
      peg.position.set(-84.5, wy, -25);
      group.add(peg);
    });

    // 4. DIMM Slots (2 on Mini-ITX, 4 on ATX)
    const dimmCount = isITX ? 2 : 4;
    const slotMat = new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.6 });
    const latchMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2 });
    for (let d = 0; d < dimmCount; d++) {
      const dx = 6 + d * 6.5;
      const slot = new THREE.Mesh(new THREE.BoxGeometry(4.2, 74, 4.5), slotMat);
      slot.position.set(dx, 170, -35.0);
      group.add(slot);
      [-39, 39].forEach((ly) => {
        const latch = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.2, 6.2), latchMat);
        latch.position.set(dx, 170 + ly, -34.2);
        group.add(latch);
      });
    }

    // 5. PCIe 5.0 Stainless Steel SafeSlot at (-40, 114, -34.5)
    const pcieW = isITX ? 66 : 78;
    const pcieSlot = new THREE.Mesh(
      new THREE.BoxGeometry(pcieW, 6.5, 6.5),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.14 })
    );
    pcieSlot.position.set(-40, 114, -34.5);
    const pcieLatch = new THREE.Mesh(new THREE.BoxGeometry(6, 7.5, 7), latchMat);
    pcieLatch.position.set(-40 + pcieW / 2 + 2, 114, -34.2);
    group.add(pcieSlot, pcieLatch);

    // 6. M.2 Thermal Shield Plate & Stainless Mounting Screws
    const m2Armor = new THREE.Mesh(
      new THREE.BoxGeometry(56, 15, 3.5),
      new THREE.MeshStandardMaterial({ color: armorColor, metalness: 0.92, roughness: 0.22 })
    );
    m2Armor.position.set(-28, 134, -35.2);
    group.add(m2Armor);
    [-53, -3].forEach((mx) => {
      const m2Screw = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 1.2, 12), latchMat);
      m2Screw.rotation.x = Math.PI / 2;
      m2Screw.position.set(mx, 134, -33.2);
      group.add(m2Screw);
    });

    // 7. Southbridge Chipset Armor & CMOS Battery & Q-Code (non-ITX)
    if (!isITX) {
      const chipBlock = new THREE.Mesh(
        new THREE.BoxGeometry(42, 42, 8.5),
        new THREE.MeshStandardMaterial({ color: armorColor, metalness: 0.94, roughness: 0.2 })
      );
      chipBlock.position.set(22, 88, -33.2);
      const chipBadge = new THREE.Mesh(
        new THREE.BoxGeometry(28, 28, 1.2),
        new THREE.MeshStandardMaterial({ color: accentArmor, metalness: 0.96, roughness: 0.14 })
      );
      chipBadge.position.set(22, 88, -28.6);
      group.add(chipBlock, chipBadge);

      const cmos = new THREE.Mesh(
        new THREE.CylinderGeometry(6.2, 6.2, 2.2, 24),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 })
      );
      cmos.rotation.x = Math.PI / 2;
      cmos.position.set(-18, 90, -35.8);
      group.add(cmos);

      const qTex = createDebugCodeTexture('A0');
      const qLed = new THREE.Mesh(new THREE.PlaneGeometry(11, 7), new THREE.MeshBasicMaterial({ map: qTex }));
      qLed.position.set(xLeft + sizeX - 14, 198, -35.8);
      group.add(qLed);
    }

    // 8. 24-Pin ATX Power Socket & 3 Combed Individually-Sleeved Parallel Braided Strands
    const atxX = xLeft + sizeX - 7;
    const atxSock = new THREE.Mesh(
      new THREE.BoxGeometry(7, 36, 8),
      new THREE.MeshStandardMaterial({ color: 0x0b0f17, roughness: 0.65 })
    );
    atxSock.position.set(atxX, 154, -34);
    group.add(atxSock);

    const braidMat = new THREE.MeshStandardMaterial({ color: 0x161c28, roughness: 0.78, metalness: 0.2 });
    const combMat = new THREE.MeshStandardMaterial({ color: 0x263042, metalness: 0.94, roughness: 0.18 });
    [-6, 0, 6].forEach((sy) => {
      const strandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(atxX, 154 + sy * 1.4, -30),
        new THREE.Vector3(atxX + 14, 154 + sy * 1.2, -22),
        new THREE.Vector3(68, 154 + sy * 0.9, -34),
        new THREE.Vector3(68, 154 + sy * 0.7, -48),
      ]);
      const strand = new THREE.Mesh(new THREE.TubeGeometry(strandCurve, 22, 1.9, 8, false), braidMat);
      strand.castShadow = true;
      group.add(strand);
    });

    [0.25, 0.55].forEach((tVal) => {
      const refCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(atxX, 154, -30),
        new THREE.Vector3(atxX + 14, 154, -22),
        new THREE.Vector3(68, 154, -34),
        new THREE.Vector3(68, 154, -48),
      ]);
      const comb = new THREE.Mesh(new THREE.BoxGeometry(3.2, 22, 5.5), combMat);
      comb.position.copy(refCurve.getPoint(tVal));
      group.add(comb);
    });

    // Dual 8-Pin EPS CPU Cables
    [-68, -54].forEach((epx) => {
      const epsCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(epx, 212, -34),
        new THREE.Vector3(epx, 220, -36),
        new THREE.Vector3(epx, 224, -48),
      ]);
      const epsCable = new THREE.Mesh(new THREE.TubeGeometry(epsCurve, 12, 2.2, 8, false), braidMat);
      group.add(epsCable);
    });

    benchGroup.add(group);
    meshNodes.motherboard = group;
  }

  function buildCpuMesh(cpu, benchGroup, meshNodes, disposeFn) {
    if (meshNodes.cpu) {
      benchGroup.remove(meshNodes.cpu);
      disposeFn(meshNodes.cpu);
    }
    const group = new THREE.Group();
    const isAm5 = !cpu || cpu.socket === 'am5';
    const isAm4 = cpu && cpu.socket === 'am4';
    const cx = -30, cy = 170, cz = -34.2;

    const subMat = new THREE.MeshStandardMaterial({
      color: isAm5 || isAm4 ? 0x064e3b : 0x1e3a8a,
      roughness: 0.45,
      metalness: 0.22,
    });
    const subW = isAm5 || isAm4 ? 34 : 32;
    const subH = isAm5 || isAm4 ? 34 : 38;
    const sub = new THREE.Mesh(new THREE.BoxGeometry(subW, subH, 1.5), subMat);
    sub.position.set(cx, cy, cz);
    sub.castShadow = true;
    group.add(sub);

    const ihsBase = new THREE.Mesh(
      new THREE.BoxGeometry(subW - 4, subH - 4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x9aa4b2, metalness: 0.85, roughness: 0.3 })
    );
    ihsBase.position.set(cx, cy, cz + 1.2);
    group.add(ihsBase);

    const ihsTex = createCpuIhsTexture(cpu);
    const ihsFace = new THREE.Mesh(
      new THREE.PlaneGeometry(subW - 6, subH - 6),
      new THREE.MeshStandardMaterial({ map: ihsTex, metalness: 0.78, roughness: 0.32 })
    );
    ihsFace.position.set(cx, cy, cz + 2.0);
    group.add(ihsFace);

    if (isAm5) {
      const capMat = new THREE.MeshStandardMaterial({ color: 0xc49758, metalness: 0.65, roughness: 0.35 });
      [[-10, 15.5], [0, 15.5], [10, 15.5], [-10, -15.5], [0, -15.5], [10, -15.5], [-15.5, 5], [15.5, -5]].forEach(([dx, dy]) => {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.9), capMat);
        cap.position.set(cx + dx, cy + dy, cz + 0.9);
        group.add(cap);
      });
    }

    benchGroup.add(group);
    meshNodes.cpu = group;
  }

  function buildRamMesh(ram, mb, benchGroup, meshNodes, disposeFn) {
    if (meshNodes.ram) {
      benchGroup.remove(meshNodes.ram);
      disposeFn(meshNodes.ram);
    }
    const group = new THREE.Group();
    const isITX = mb && (mb.formFactor === 'mini_itx' || mb.formFactor === 2);
    const style = ram.visualStyle || '';
    const isTitanium = style === 'dominator_titanium_fins';
    const isCapellix = style === 'capellix_grid';
    const isTrident = style === 'trident_streamline';
    const isLowProf = style === 'low_profile_aluminum';
    const heightZ = isLowProf ? 18 : isTitanium || isCapellix ? 29 : 25;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: isTrident ? 0x94a3b8 : isTitanium ? 0x1c2434 : 0x131823,
      metalness: 0.94,
      roughness: 0.18,
    });
    const badgeTex = createRamBadgeTexture(ram);
    const badgeMat = new THREE.MeshStandardMaterial({ map: badgeTex, metalness: 0.78, roughness: 0.24 });
    const xPositions = isITX ? [6, 12.5] : [12.5, 25.5];

    xPositions.forEach((rx) => {
      const stick = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 70, heightZ), bodyMat);
      body.position.set(rx, 170, -34 + heightZ / 2);
      body.castShadow = true;
      stick.add(body);

      const badge = new THREE.Mesh(new THREE.PlaneGeometry(36, 9), badgeMat);
      badge.rotation.y = Math.PI / 2;
      badge.rotation.z = Math.PI / 2;
      badge.position.set(rx + 2.0, 170, -34 + heightZ * 0.54);
      stick.add(badge);

      const pins = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 66, 2.5),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.12 })
      );
      pins.position.set(rx, 170, -34.2);
      stick.add(pins);

      if (ram.rgbLighting) {
        if (isTitanium || isCapellix) {
          // Segmented 11-LED DHX forged aluminum top bar
          const topBar = new THREE.Mesh(
            new THREE.BoxGeometry(4.4, 71, 4.6),
            new THREE.MeshStandardMaterial({ color: 0x0c1018, metalness: 0.92, roughness: 0.2 })
          );
          topBar.position.set(rx, 170, -34 + heightZ + 1.5);
          stick.add(topBar);
          for (let seg = 0; seg < 11; seg++) {
            const sy = 170 - 30 + seg * 6.0;
            const win = new THREE.Mesh(
              new THREE.BoxGeometry(4.7, 3.8, 3.0),
              new THREE.MeshStandardMaterial({
                color: 0x10f06a,
                emissive: 0x10f06a,
                emissiveIntensity: 0.85,
                roughness: 0.1,
              })
            );
            win.position.set(rx, sy, -34 + heightZ + 2.6);
            win.userData.isRgbTarget = true;
            stick.add(win);
          }
        } else {
          // Continuous sleek crystal lightbar (Trident Z5 / Vengeance RGB)
          const crown = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 70.5, 4.0),
            new THREE.MeshStandardMaterial({
              color: isTrident ? 0x38bdf8 : 0x10f06a,
              emissive: isTrident ? 0x38bdf8 : 0x10f06a,
              emissiveIntensity: 0.78,
              roughness: 0.1,
            })
          );
          crown.position.set(rx, 170, -34 + heightZ + 1.4);
          crown.userData.isRgbTarget = true;
          stick.add(crown);
        }
      }
      group.add(stick);
    });

    benchGroup.add(group);
    meshNodes.ram = group;
  }

  function buildStorageMesh(ssd, benchGroup, meshNodes, disposeFn) {
    if (meshNodes.storage) {
      benchGroup.remove(meshNodes.storage);
      disposeFn(meshNodes.storage);
    }
    const group = new THREE.Group();
    const isActiveTower = ssd.visualStyle === 'active_fin_cooler';
    const sx = -28, sy = 134, sz = -32.2;

    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(52, 13, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x090c12, roughness: 0.55 })
    );
    pcb.position.set(sx, sy, sz);
    group.add(pcb);

    const goldKey = new THREE.Mesh(
      new THREE.BoxGeometry(4, 11, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.12 })
    );
    goldKey.position.set(sx - 24, sy, sz);
    group.add(goldKey);

    const ssdTex = createSsdTexture(ssd);
    const sinkH = isActiveTower ? 11 : 4.4;
    const sink = new THREE.Mesh(
      new THREE.BoxGeometry(44, 13, sinkH),
      new THREE.MeshStandardMaterial({ color: 0x1e2533, metalness: 0.92, roughness: 0.2 })
    );
    sink.position.set(sx + 1, sy, sz + sinkH / 2 + 0.5);
    sink.castShadow = true;
    group.add(sink);

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 11),
      new THREE.MeshStandardMaterial({ map: ssdTex, metalness: 0.7, roughness: 0.3 })
    );
    face.position.set(sx + 1, sy, sz + sinkH + 0.65);
    group.add(face);

    if (ssd.rgbLighting) {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(28, 1.6, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x10f06a, emissive: 0x10f06a, emissiveIntensity: 0.85 })
      );
      led.position.set(sx + 1, sy + 6.6, sz + sinkH * 0.6);
      led.userData.isRgbTarget = true;
      group.add(led);
    }

    benchGroup.add(group);
    meshNodes.storage = group;
  }

  function buildGpuMesh(gpu, verticalMount, benchGroup, meshNodes, disposeFn) {
    if (meshNodes.gpu) {
      benchGroup.remove(meshNodes.gpu);
      disposeFn(meshNodes.gpu);
    }
    meshNodes.gpuFanList = [];
    meshNodes.gpuHeatpipes = [];

    const group = new THREE.Group();
    const style = gpu.visualStyle || 'founders_hourglass';
    const isFe = style === 'founders_hourglass';
    const isStrix = style === 'rog_strix_triple';
    const isRadeon = style === 'radeon_reference';
    const isSilver = style === 'triple_axial_rgb';
    const isSlim = style === 'triple_fan_slim';
    const isIce = style === 'triple_fan_translucent';
    const isDual = style === 'dual_fan_compact' || isFe;

    const length = Math.max(122, Math.min(198, (gpu.lengthMm || 304) * 0.55));
    const depth = isStrix ? 68 : isFe ? 64 : isDual ? 54 : 62;
    const thick = isSlim ? 22 : isStrix ? 34 : isFe ? 28 : 28;
    const xStart = -84;
    const cx = xStart + length / 2;

    // Local GPU assembly: top backplate +Y, sculpted fan shroud -Y, side lightbar +Z, I/O bracket -X
    const cardRoot = new THREE.Group();

    const shroudColor = isSilver ? 0x64748b : isFe ? 0x202632 : 0x131823;
    const accentColor = isRadeon ? 0xef4444 : isIce ? 0x38bdf8 : isFe ? 0xcbd5e1 : 0x10f06a;

    // 1. Stainless Steel I/O Bracket at xStart + Gold-Contact DisplayPort / HDMI ports
    const ioBracket = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, thick + 3, depth + 2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.14 })
    );
    ioBracket.position.set(xStart - 0.5, 0, 0);
    cardRoot.add(ioBracket);

    const portSlotMat = new THREE.MeshStandardMaterial({ color: 0x060a10, roughness: 0.75, metalness: 0.3 });
    const contactMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.12 });
    const dpCount = isFe ? 3 : 4;
    for (let dp = 0; dp < dpCount; dp++) {
      const pz = -depth * 0.3 + dp * 9;
      const port = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4.5, 6.2), portSlotMat);
      port.position.set(xStart - 1.4, thick * 0.08, pz);
      const contact = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.0, 4.6), contactMat);
      contact.position.set(xStart - 2.0, thick * 0.08, pz);
      cardRoot.add(port, contact);
    }

    // 2. GPU PCB & Gold PCIe x16 Finger Blade
    const gpuPcbLen = isFe ? length * 0.62 : length - 10;
    const gpuPcb = new THREE.Mesh(
      new THREE.BoxGeometry(gpuPcbLen, 2.2, depth - 6),
      new THREE.MeshStandardMaterial({ color: 0x0c1018, roughness: 0.55 })
    );
    gpuPcb.position.set(xStart + gpuPcbLen / 2 + 2, thick * 0.33, -2);
    cardRoot.add(gpuPcb);

    const pcieBlade = new THREE.Mesh(
      new THREE.BoxGeometry(72, 3.2, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.12 })
    );
    pcieBlade.position.set(-40, thick * 0.38, -depth * 0.48);
    cardRoot.add(pcieBlade);

    // 3. Enclosed Aluminum Heatsink Fin Core & Contained Copper Heatpipes
    const finMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.92, roughness: 0.24 });
    const finCount = 26;
    for (let f = 0; f < finCount; f++) {
      const fx = xStart + 7 + f * ((length - 16) / finCount);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(1.2, thick * 0.44, depth - 10), finMat);
      plate.position.set(fx, thick * 0.06, 0);
      cardRoot.add(plate);
    }

    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.96, roughness: 0.14 });
    [-depth * 0.24, depth * 0.24].forEach((hz) => {
      const pipeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xStart + 12, 0, hz),
        new THREE.Vector3(xStart + length - 14, 0, hz),
        new THREE.Vector3(xStart + length - 8, 0, hz * 0.45),
      ]);
      const pipe = new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 16, 1.6, 10, false), copperMat);
      cardRoot.add(pipe);
      meshNodes.gpuHeatpipes.push(pipe);
    });

    // 4. Sculpted Perimeter Frame (Front, Rear & End-Cap Shroud Closure — no open pipe ends!)
    const shroudMat = new THREE.MeshStandardMaterial({ color: shroudColor, metalness: 0.88, roughness: 0.22 });
    const trimMat = new THREE.MeshStandardMaterial({
      color: isFe ? 0x64748b : 0x263042,
      metalness: 0.94,
      roughness: 0.18,
    });

    const sideRailFront = new THREE.Mesh(new THREE.BoxGeometry(length, thick * 0.84, 4.2), shroudMat);
    sideRailFront.position.set(cx, 0, depth / 2 - 2.0);
    sideRailFront.castShadow = true;

    const sideRailRear = new THREE.Mesh(new THREE.BoxGeometry(length, thick * 0.84, 3.6), shroudMat);
    sideRailRear.position.set(cx, 0, -depth / 2 + 1.8);

    const endCap = new THREE.Mesh(new THREE.BoxGeometry(5.5, thick * 0.88, depth), trimMat);
    endCap.position.set(xStart + length - 2.5, 0, 0);
    cardRoot.add(sideRailFront, sideRailRear, endCap);

    // Radeon triple crimson fin inlays
    if (isRadeon) {
      for (let rs = 0; rs < 3; rs++) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, thick * 0.72, 4.6),
          new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.85, roughness: 0.25 })
        );
        stripe.position.set(cx + 12 + rs * 7, 0, depth / 2 - 1.8);
        cardRoot.add(stripe);
      }
    }

    // Side Lightbar & Recessed Logo Plate (+Z edge face)
    const logoTex = createGpuSideLogoTexture(gpu);
    const logoPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(52, 7.5),
      new THREE.MeshBasicMaterial({ map: logoTex })
    );
    logoPlate.position.set(cx - 22, thick * 0.06, depth / 2 + 0.35);
    cardRoot.add(logoPlate);

    if (gpu.rgbLighting || isFe) {
      const barLen = isStrix ? length * 0.72 : isSilver ? length * 0.76 : length * 0.48;
      const lightBar = new THREE.Mesh(
        new THREE.BoxGeometry(barLen, 2.8, 1.4),
        new THREE.MeshStandardMaterial({
          color: accentColor,
          emissive: accentColor,
          emissiveIntensity: isFe ? 0.42 : 0.82,
          roughness: 0.12,
        })
      );
      lightBar.position.set(cx - 8, thick * 0.35, depth / 2 + 0.3);
      if (!isFe && !isRadeon) lightBar.userData.isRgbTarget = true;
      cardRoot.add(lightBar);
      meshNodes.gpuLogoMat = lightBar.material;
    }

    // 5. Brushed Titanium Top Backplate (+Y face) with Real Punched Flow-Through Window!
    const bpTex = createGpuBackplateTexture(gpu);
    const topFlowX = xStart + length - 30;
    const topFlowHoles = isFe
      ? [{ type: 'circle', x: topFlowX - cx, y: 0, r: 19.5 }]
      : [];
    const bpGeo = createPunchedPlateGeometry(length, depth, 2.4, topFlowHoles);
    const backplate = new THREE.Mesh(
      bpGeo,
      new THREE.MeshStandardMaterial({ map: bpTex, metalness: 0.86, roughness: 0.24 })
    );
    backplate.rotation.x = Math.PI / 2;
    backplate.position.set(cx, thick * 0.45, 0);
    backplate.castShadow = true;
    backplate.receiveShadow = true;
    cardRoot.add(backplate);

    // Die Core X-Clamp on backplate
    const xClamp = new THREE.Mesh(
      new THREE.BoxGeometry(16, 1.0, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.16 })
    );
    xClamp.position.set(xStart + length * 0.34, thick * 0.51, -4);
    cardRoot.add(xClamp);

    // 6. Sculpted Bottom Fan Shroud Plate (-Y face — HERO SURFACE FOR VERTICAL GPU MOUNT!)
    const fanBladeColor = isIce ? 0x38bdf8 : 0x161d29;
    const fanEmissive = isIce ? 0x0ea5e9 : 0x000000;
    const fanSpecs = [];
    if (isFe) {
      // Iconic FE Hourglass exoskeleton trim on Top + Bottom + 1 Bottom Intake Fan + 1 Top Flow-Through Fan
      fanSpecs.push({ x: xStart + 38, r: 18.5, topFlow: false });

      // Top & Bottom Hourglass Silver Titanium X-Frame
      [thick * 0.48, -thick * 0.44].forEach((hy) => {
        const hg1 = new THREE.Mesh(new THREE.BoxGeometry(length * 0.46, 2.2, 4.4), trimMat);
        hg1.position.set(cx - 4, hy, 0);
        hg1.rotation.y = 0.28;
        const hg2 = hg1.clone();
        hg2.rotation.y = -0.28;
        cardRoot.add(hg1, hg2);
      });

      // Top flow-through exhaust fan cleanly framed inside top backplate hole
      const topFlowFan = createAxialFan(18, 9, { axis: 'y', outerRing: true, bladeColor: 0x11151e });
      topFlowFan.group.position.set(topFlowX, thick * 0.36, 0);
      cardRoot.add(topFlowFan.group);
      meshNodes.gpuFanList.push(topFlowFan.rotor);

      const flowRing = new THREE.Mesh(new THREE.TorusGeometry(19.5, 1.3, 12, 36), trimMat);
      flowRing.rotation.x = Math.PI / 2;
      flowRing.position.set(topFlowX, thick * 0.46, 0);
      cardRoot.add(flowRing);
    } else {
      const fanCount = isDual ? 2 : 3;
      const fanR = isDual ? 16 : 15;
      const span = length - 22;
      for (let i = 0; i < fanCount; i++) {
        fanSpecs.push({
          x: xStart + 11 + (span / fanCount) * (i + 0.5),
          r: fanR,
          reverse: i === 1 && fanCount === 3,
        });
      }
    }

    // Bottom Sculpted Shroud with Punched Circular Fan Cutouts!
    const botHoles = fanSpecs.map((fs) => ({ type: 'circle', x: fs.x - cx, y: 0, r: fs.r + 1.2 }));
    if (isFe) {
      // Exposed louvered intake grille window on FE underside right side
      botHoles.push({ type: 'rect', x: topFlowX - cx, y: 0, w: 42, h: depth * 0.68 });
    }
    const botShroudGeo = createPunchedPlateGeometry(length, depth, 2.8, botHoles);
    const botShroud = new THREE.Mesh(botShroudGeo, shroudMat);
    botShroud.rotation.x = Math.PI / 2;
    botShroud.position.set(cx, -thick * 0.42, 0);
    cardRoot.add(botShroud);

    // Recessed dark acoustic cavity & chrome chamfer rings inside every fan well!
    fanSpecs.forEach((fs) => {
      const wellBack = new THREE.Mesh(
        new THREE.CircleGeometry(fs.r + 1.5, 32),
        new THREE.MeshStandardMaterial({ color: 0x05070b, roughness: 0.9 })
      );
      wellBack.rotation.x = Math.PI / 2;
      wellBack.position.set(fs.x, -thick * 0.28, 0);
      cardRoot.add(wellBack);

      const bezelRing = new THREE.Mesh(new THREE.TorusGeometry(fs.r + 1.2, 1.25, 12, 36), trimMat);
      bezelRing.rotation.x = Math.PI / 2;
      bezelRing.position.set(fs.x, -thick * 0.45, 0);
      cardRoot.add(bezelRing);

      const fan = createAxialFan(fs.r, 9, {
        axis: 'y',
        outerRing: true,
        reverse: fs.reverse,
        bladeColor: fanBladeColor,
        emissiveBlade: fanEmissive,
      });
      fan.group.rotation.x = -Math.PI / 2;
      fan.group.position.set(fs.x, -thick * 0.37, 0);
      cardRoot.add(fan.group);
      meshNodes.gpuFanList.push(fan.rotor);
    });

    // 7. Position Horizontal or Vertical Showcase + Combed 3-Strand 12V-2x6 Cable + Anti-Sag Support
    const braidMat = new THREE.MeshStandardMaterial({ color: 0x161b26, roughness: 0.74, metalness: 0.22 });
    const pwrX = xStart + length * (isFe ? 0.62 : 0.76);

    if (verticalMount) {
      cardRoot.rotation.x = -Math.PI / 2;
      cardRoot.position.set(0, 102, 16);
      group.add(cardRoot);

      // Vertical PCIe Riser Dock + Ribbon
      const riserBase = new THREE.Mesh(
        new THREE.BoxGeometry(82, 18, 12),
        new THREE.MeshStandardMaterial({ color: 0x141822, metalness: 0.9, roughness: 0.25 })
      );
      riserBase.position.set(-40, 65, 14);
      group.add(riserBase);

      const riserCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-40, 114, -34),
        new THREE.Vector3(-40, 100, -18),
        new THREE.Vector3(-40, 80, 6),
        new THREE.Vector3(-40, 68, 14),
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(riserCurve, 18, 3.6, 4, false), braidMat));

      // Combed 12V-2x6 cables sweeping cleanly from top back to shroud grommet
      [-3, 0, 3].forEach((ox) => {
        const cCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(pwrX + ox, 134, 16),
          new THREE.Vector3(pwrX + ox, 118, 2),
          new THREE.Vector3(Math.min(54, pwrX) + ox, 78, 10),
          new THREE.Vector3(38 + ox * 0.8, 56, 22),
        ]);
        group.add(new THREE.Mesh(new THREE.TubeGeometry(cCurve, 22, 1.35, 8, false), braidMat));
      });
    } else {
      cardRoot.position.set(0, 103, -6);
      group.add(cardRoot);

      const pwrZ = depth / 2 - 6;
      const pwrSock = new THREE.Mesh(
        new THREE.BoxGeometry(14, 5.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x090b10, roughness: 0.5 })
      );
      pwrSock.position.set(pwrX, 108, pwrZ);
      group.add(pwrSock);

      // 3 combed 12V-2x6 strands + CNC aluminum comb
      [-3.2, 0, 3.2].forEach((ox) => {
        const cCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(pwrX + ox, 108, pwrZ + 2),
          new THREE.Vector3(pwrX + ox, 94, pwrZ + 12),
          new THREE.Vector3(Math.min(48, pwrX - 8) + ox, 72, pwrZ + 6),
          new THREE.Vector3(38 + ox * 0.7, 56, 22),
        ]);
        const strand = new THREE.Mesh(new THREE.TubeGeometry(cCurve, 24, 1.4, 8, false), braidMat);
        strand.castShadow = true;
        group.add(strand);
      });
      const gpuComb = new THREE.Mesh(new THREE.BoxGeometry(11, 4.2, 4.2), trimMat);
      gpuComb.position.set(pwrX, 94, pwrZ + 12);
      group.add(gpuComb);

      if (!isDual || isFe) {
        const pilX = xStart + length - 10;
        const pilZ = depth / 2 - 10;
        const bottomGpuY = 103 - thick * 0.45;
        const pilH = Math.max(10, bottomGpuY - 56);
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(2.6, 3.2, pilH, 16),
          new THREE.MeshStandardMaterial({ color: 0x263042, metalness: 0.94, roughness: 0.18 })
        );
        pillar.position.set(pilX, 56 + pilH / 2, pilZ);
        const thumbRing = new THREE.Mesh(
          new THREE.CylinderGeometry(3.8, 3.8, 2.0, 18),
          new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.14 })
        );
        thumbRing.position.set(pilX, 56 + pilH - 2, pilZ);
        group.add(pillar, thumbRing);
      }
    }

    benchGroup.add(group);
    meshNodes.gpu = group;
  }

  function buildCoolerMesh(cooler, state, benchGroup, meshNodes, disposeFn) {
    if (meshNodes.cooler) {
      benchGroup.remove(meshNodes.cooler);
      disposeFn(meshNodes.cooler);
    }
    meshNodes.coolerFanList = [];
    const group = new THREE.Group();
    const isAir = cooler.coolerType === 'air' || cooler.coolerType === 0;
    const cx = -30, cy = 170, cz = -33.5;

    if (isAir) {
      const isLowSff = cooler.visualStyle === 'low_profile_sff_downdraft' || (cooler.heightMm && cooler.heightMm <= 85);
      const isDark = (cooler.colorway || '').includes('black') || (cooler.colorway || '').includes('stealth');
      const finColor = isDark ? 0x263040 : 0xa1aebf;
      const capColor = isDark ? 0x0e131c : 0x334155;
      const finMat = new THREE.MeshStandardMaterial({ color: finColor, metalness: 0.9, roughness: 0.25 });
      const capMat = new THREE.MeshStandardMaterial({
        map: createCoolerBadgeTexture(cooler),
        metalness: 0.85,
        roughness: 0.24,
      });
      const pipeMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0xd1d5db : 0xd97706,
        metalness: 0.96,
        roughness: 0.12,
      });

      const coldplate = new THREE.Mesh(
        new THREE.BoxGeometry(30, 30, 3.5),
        new THREE.MeshStandardMaterial({ color: 0xc27838, metalness: 0.95, roughness: 0.14 })
      );
      coldplate.position.set(cx, cy, cz + 1.5);
      group.add(coldplate);

      if (isLowSff) {
        // Low-profile horizontal downdraft SFF cooler (Noctua NH-L12S)
        for (let f = 0; f < 22; f++) {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.95, 46, 10), finMat);
          fin.position.set(cx - 22 + f * 2.1, cy, cz + 15);
          fin.castShadow = true;
          group.add(fin);
        }
        const fan = createAxialFan(20, 7, {
          axis: 'z',
          squareFrame: true,
          boxSize: 44,
          frameColor: 0xcbb799,
          padColor: 0x5c3a21,
          bladeColor: 0x5c3a21,
        });
        fan.group.position.set(cx, cy, cz + 25);
        group.add(fan.group);
        meshNodes.coolerFanList.push(fan.rotor);
        for (let p = -1; p <= 1; p++) {
          const hpCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(cx - 20, cy + p * 9, cz + 15),
            new THREE.Vector3(cx, cy + p * 9, cz + 3.0),
            new THREE.Vector3(cx + 20, cy + p * 9, cz + 15),
          ]);
          group.add(new THREE.Mesh(new THREE.TubeGeometry(hpCurve, 18, 1.5, 10, false), pipeMat));
        }
      } else {
        // Twin Stacked Fin Towers (fins stacked vertically along Y so dense aluminum fin layers gleam from BOTH front & side!)
        [-17, 17].forEach((tx) => {
          for (let f = 0; f < 24; f++) {
            const fy = cy - 24 + f * 2.1;
            const fin = new THREE.Mesh(new THREE.BoxGeometry(22, 0.72, 46), finMat);
            fin.position.set(cx + tx, fy, 6.5);
            fin.castShadow = true;
            group.add(fin);
          }

          // Brushed Anodized Top Cover Plate (+Z tip face)
          const cap = new THREE.Mesh(new THREE.BoxGeometry(22.5, 51, 2.2), capMat);
          cap.position.set(cx + tx, cy, 30.2);
          group.add(cap);

          // 6 Gleaming Domed Heatpipe Tip Caps protruding symmetrically through top cover!
          for (let h = -2; h <= 2; h++) {
            const tip = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 3.2, 12), pipeMat);
            tip.rotation.x = Math.PI / 2;
            tip.position.set(cx + tx + (h % 2 === 0 ? -4 : 4), cy + h * 9, 31.4);
            group.add(tip);
          }
        });

        // 5 U-Shaped Heatpipes arcing from coldplate into both fin stacks
        for (let p = -2; p <= 2; p++) {
          const py = cy + p * 9;
          const hpCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(cx - 17, py, 29.5),
            new THREE.Vector3(cx - 17, py, -18),
            new THREE.Vector3(cx, py, cz + 3.2),
            new THREE.Vector3(cx + 17, py, -18),
            new THREE.Vector3(cx + 17, py, 29.5),
          ]);
          group.add(new THREE.Mesh(new THREE.TubeGeometry(hpCurve, 28, 1.5, 10, false), pipeMat));
        }

        // Dual Chamfered Square Open-Bore Tower Fans + Spring Retention Wire Clips
        const isNoctua = (cooler.brand || '').toLowerCase() === 'noctua';
        const wireMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.14 });
        [2, 31.5].forEach((fx) => {
          const fan = createAxialFan(19, 9, {
            axis: 'x',
            squareFrame: true,
            boxSize: 45,
            depth: 5.8,
            frameColor: 0x131822,
            padColor: isNoctua ? 0x1e2532 : 0x0a0d14,
            bladeColor: 0x1c2330,
          });
          fan.group.position.set(cx + fx, cy, 6.5);
          group.add(fan.group);
          meshNodes.coolerFanList.push(fan.rotor);

          // Upper & lower steel retention wire clips
          [-21, 21].forEach((wy) => {
            const clip = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.75, 44), wireMat);
            clip.position.set(cx + fx - 2.5, cy + wy, 6.5);
            group.add(clip);
          });
        });
      }
    } else {
      // 360mm AIO Liquid Cooler
      const isArctic = cooler.visualStyle === 'thick_rad_vrm_fan';
      const radThick = isArctic ? 18 : 14;
      const radY = 236;
      const radZ = -12;

      const radCore = new THREE.Mesh(
        new THREE.BoxGeometry(162, radThick, 54),
        new THREE.MeshStandardMaterial({ map: createRadiatorFinTexture(true), metalness: 0.85, roughness: 0.28 })
      );
      radCore.position.set(-4, radY, radZ);
      radCore.castShadow = true;
      group.add(radCore);

      const tankMat = new THREE.MeshStandardMaterial({ color: 0x141924, metalness: 0.9, roughness: 0.22 });
      const leftTank = new THREE.Mesh(new THREE.BoxGeometry(12, radThick + 3, 55), tankMat);
      leftTank.position.set(-90, radY, radZ);
      const rightTank = new THREE.Mesh(new THREE.BoxGeometry(16, radThick + 3, 55), tankMat);
      rightTank.position.set(84, radY, radZ);
      group.add(leftTank, rightTank);

      // 3x 120mm Open-Bore Chamfered Square Radiator Fans underneath (spinning blades fully visible!)
      const fanY = radY - radThick / 2 - 4.8;
      for (let i = -1; i <= 1; i++) {
        const fx = -4 + i * 54;
        const fan = createAxialFan(21.5, 9, {
          axis: 'y',
          squareFrame: true,
          boxSize: 52,
          depth: 7.5,
          frameColor: 0x131823,
          haloColor: cooler.rgbLighting ? 0x10f06a : null,
        });
        fan.group.position.set(fx, fanY, radZ);
        group.add(fan.group);
        meshNodes.coolerFanList.push(fan.rotor);
      }

      // Pump Block & IPS OLED Screen on CPU
      const coldPlate = new THREE.Mesh(
        new THREE.BoxGeometry(32, 32, 3.0),
        new THREE.MeshStandardMaterial({ color: 0xc27838, metalness: 0.95, roughness: 0.14 })
      );
      coldPlate.position.set(cx, cy, cz + 1.0);
      group.add(coldPlate);

      const pumpBody = new THREE.Mesh(
        new THREE.CylinderGeometry(18, 18, 16, 40),
        new THREE.MeshStandardMaterial({ color: 0x141924, metalness: 0.9, roughness: 0.24 })
      );
      pumpBody.rotation.x = Math.PI / 2;
      pumpBody.position.set(cx, cy, cz + 10);
      pumpBody.castShadow = true;
      group.add(pumpBody);

      const lcd = createAioLcdTexture();
      meshNodes.aioCanvas = lcd.canvas;
      meshNodes.aioTexture = lcd.texture;
      updateAioLcdDisplay(meshNodes, state);

      const screenMesh = new THREE.Mesh(
        new THREE.CircleGeometry(14.5, 40),
        new THREE.MeshBasicMaterial({ map: lcd.texture })
      );
      screenMesh.position.set(cx, cy, cz + 18.2);
      group.add(screenMesh);
      meshNodes.aioScreenMesh = screenMesh;

      const bezel = new THREE.Mesh(
        new THREE.TorusGeometry(16, 1.5, 14, 40),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.12 })
      );
      bezel.position.set(cx, cy, cz + 18.0);
      group.add(bezel);

      if (cooler.rgbLighting) {
        const pumpHalo = new THREE.Mesh(
          new THREE.TorusGeometry(17.8, 0.9, 10, 40),
          new THREE.MeshStandardMaterial({
            color: 0x10f06a,
            emissive: 0x10f06a,
            emissiveIntensity: 0.78,
            roughness: 0.12,
          })
        );
        pumpHalo.position.set(cx, cy, cz + 17.5);
        pumpHalo.userData.isRgbTarget = true;
        group.add(pumpHalo);
      }

      // Knurled Metallic Swivel Fittings & Dual Braided Coolant Tubes
      const fitMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.96, roughness: 0.14 });
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x161c28, roughness: 0.72, metalness: 0.25 });
      [-5, 5].forEach((oz) => {
        const fitting = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 5, 16), fitMat);
        fitting.rotation.z = Math.PI / 2;
        fitting.position.set(cx + 19, cy + oz, cz + 10);
        const radFit = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 5.5, 16), fitMat);
        radFit.position.set(82, radY - 10, radZ + oz);
        group.add(fitting, radFit);

        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(cx + 21, cy + oz, cz + 10),
          new THREE.Vector3(cx + 58, cy + oz + 12, -10),
          new THREE.Vector3(64, 200 + oz * 0.5, -6),
          new THREE.Vector3(82, radY - 12, radZ + oz),
        ]);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 3.2, 12, false), tubeMat);
        tube.castShadow = true;
        group.add(tube);
      });
    }

    benchGroup.add(group);
    meshNodes.cooler = group;
  }

  function buildPsuMesh(psu, benchGroup, meshNodes, disposeFn) {
    if (meshNodes.psu) {
      benchGroup.remove(meshNodes.psu);
      disposeFn(meshNodes.psu);
    }
    const group = new THREE.Group();
    group.position.set(-62, 30, 12);

    const psuBox = new THREE.Mesh(
      new THREE.BoxGeometry(74, 42, 64),
      new THREE.MeshStandardMaterial({ color: 0x141824, metalness: 0.9, roughness: 0.24 })
    );
    psuBox.castShadow = true;
    psuBox.receiveShadow = true;
    group.add(psuBox);

    const specFace = new THREE.Mesh(
      new THREE.PlaneGeometry(66, 34),
      new THREE.MeshStandardMaterial({ map: createPsuSpecTexture(psu), metalness: 0.65, roughness: 0.35 })
    );
    specFace.position.set(0, 0, 32.3);
    group.add(specFace);

    const fanWell = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 24, 2.0, 32),
      new THREE.MeshStandardMaterial({ color: 0x06080d, roughness: 0.85 })
    );
    fanWell.position.set(0, 20.4, 0);
    group.add(fanWell);

    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.14 });
    [8, 15, 21].forEach((r) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.65, 8, 32), grilleMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 21.4, 0);
      group.add(ring);
    });

    const acInlet = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 10, 16),
      new THREE.MeshStandardMaterial({ color: 0x06080d, metalness: 0.8 })
    );
    acInlet.position.set(-37.2, -2, 10);
    const rocker = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 8, 5.5),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 })
    );
    rocker.position.set(-37.2, -2, -10);
    group.add(acInlet, rocker);

    const harnessMat = new THREE.MeshStandardMaterial({ color: 0x151a25, roughness: 0.75 });
    [-12, 0, 12].forEach((cz) => {
      const sock = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 8, 10),
        new THREE.MeshStandardMaterial({ color: 0x070a10, roughness: 0.6 })
      );
      sock.position.set(37.2, 4, cz);
      group.add(sock);

      const cCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(38, 4, cz),
        new THREE.Vector3(52, 2, cz - 8),
        new THREE.Vector3(64, -8, -14),
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(cCurve, 12, 2.8, 8, false), harnessMat));
    });

    benchGroup.add(group);
    meshNodes.psu = group;
  }

  function buildCaseMesh(chassis, showCase, benchGroup, meshNodes, disposeFn) {
    if (meshNodes.caseEnclosure) {
      benchGroup.remove(meshNodes.caseEnclosure);
      disposeFn(meshNodes.caseEnclosure);
      meshNodes.caseEnclosure = null;
      meshNodes.caseLeftDoor = null;
      meshNodes.caseFront = null;
      meshNodes.caseTop = null;
      meshNodes.caseRight = null;
    }
    meshNodes.caseFanList = [];
    if (!showCase) return;

    const cid = chassis ? chassis.id : 'case_5000d_airflow';
    const isTerra = cid.includes('terra');
    const isNorth = cid.includes('north');
    const isO11 = cid.includes('o11');
    const group = new THREE.Group();

    // Rich dark smoked tempered glass (high clarity so interior parts shine without fog washout!)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c1320,
      transparent: true,
      opacity: 0.11,
      roughness: 0.05,
      metalness: 0.08,
      reflectivity: 0.92,
      depthWrite: false,
    });
    const frameColor = isTerra ? 0x3b5c4f : 0x121722;
    const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.88, roughness: 0.28 });
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x05070b, roughness: 0.55 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.96, roughness: 0.14 });

    if (isTerra) {
      // Standalone 10.4L SFF Jade Billet Aluminum Enclosure wrapping entire Mini-ITX + SFX + GPU envelope cleanly
      const terraX = -4;
      const terraY = 120;
      const terraZ = -2;
      const sffBase = new THREE.Mesh(new THREE.BoxGeometry(206, 5, 108), frameMat);
      sffBase.position.set(terraX, 11, terraZ);
      sffBase.receiveShadow = true;
      sffBase.castShadow = true;
      group.add(sffBase);

      [[-94, -44], [86, -44], [-94, 40], [86, 40]].forEach(([fx, fz]) => {
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 8, 20), silverMat);
        foot.position.set(fx, 4, fz);
        group.add(foot);
      });

      // Hinged Gull-Wing Left Side Door (+Z) with TRUE Punched Gill Slots!
      const gillHoles = [];
      for (let v = 0; v < 9; v++) {
        gillHoles.push({ type: 'rect', x: 0, y: -56 + v * 14, w: 160, h: 5.5 });
      }
      const terraDoor = new THREE.Group();
      terraDoor.position.set(terraX, terraY, 50);
      const terraWingGeo = createPunchedPlateGeometry(204, 210, 3.0, gillHoles);
      const terraWing = new THREE.Mesh(terraWingGeo, frameMat);
      terraWing.castShadow = true;
      terraDoor.add(terraWing);
      group.add(terraDoor);
      meshNodes.caseLeftDoor = terraDoor;

      // Sculpted Front Panel (+X): Solid American Walnut Lower Slab + Jade Upper Plate + Chrome Power Button
      const terraFront = new THREE.Group();
      terraFront.position.set(terraX + 102, terraY, terraZ);
      const walnutFascia = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 68, 108),
        new THREE.MeshStandardMaterial({ map: createWalnutWoodTexture(), roughness: 0.52, metalness: 0.08 })
      );
      walnutFascia.position.y = -72;
      const jadeFront = new THREE.Mesh(new THREE.BoxGeometry(4.5, 142, 108), frameMat);
      jadeFront.position.y = 33;
      const pwrBtn = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 2.5, 20), silverMat);
      pwrBtn.rotation.z = Math.PI / 2;
      pwrBtn.position.set(4.0, -58, 32);
      terraFront.add(walnutFascia, jadeFront, pwrBtn);
      group.add(terraFront);
      meshNodes.caseFront = terraFront;

      // Top Perforated Sliding Lid
      const terraTop = new THREE.Group();
      terraTop.position.set(terraX, 226, terraZ);
      const topMeshGeo = createPunchedPlateGeometry(206, 108, 3.2, [
        { type: 'rect', x: 0, y: 0, w: 164, h: 68 },
      ]);
      const topLid = new THREE.Mesh(topMeshGeo, frameMat);
      topLid.rotation.x = Math.PI / 2;
      terraTop.add(topLid);
      group.add(terraTop);
      meshNodes.caseTop = terraTop;

      // Rear Aluminum Spine
      const rearSpine = new THREE.Mesh(new THREE.BoxGeometry(3.5, 214, 108), frameMat);
      rearSpine.position.set(terraX - 102, terraY, terraZ);
      group.add(rearSpine);
    } else {
      // Mid-Tower / Panoramic Cases
      if (!isO11) {
        const frontPost = new THREE.Mesh(new THREE.BoxGeometry(8, 246, 8), frameMat);
        frontPost.position.set(118, 128, 82);
        frontPost.castShadow = true;
        group.add(frontPost);
      }
      const rearFrontPost = new THREE.Mesh(new THREE.BoxGeometry(8, 246, 8), frameMat);
      rearFrontPost.position.set(118, 128, -82);
      group.add(rearFrontPost);

      // Smoked Tempered Glass Side Door (+Z = +84) + Knurled Corner Thumbscrews
      const glassDoor = new THREE.Group();
      glassDoor.position.set(0, 128, 84);
      const glassPane = new THREE.Mesh(new THREE.BoxGeometry(236, 240, 2.2), glassMat);
      glassPane.userData.isGlass = true;
      const glassEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(236, 240, 2.2)),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 })
      );
      glassDoor.add(glassPane, glassEdges);

      const topB = new THREE.Mesh(new THREE.BoxGeometry(236, 6.5, 2.5), borderMat);
      topB.position.set(0, 117, 0);
      const btmB = new THREE.Mesh(new THREE.BoxGeometry(236, 6.5, 2.5), borderMat);
      btmB.position.set(0, -117, 0);
      const leftB = new THREE.Mesh(new THREE.BoxGeometry(6.5, 240, 2.5), borderMat);
      leftB.position.set(-115, 0, 0);
      glassDoor.add(topB, btmB, leftB);
      if (!isO11) {
        const rightB = new THREE.Mesh(new THREE.BoxGeometry(6.5, 240, 2.5), borderMat);
        rightB.position.set(115, 0, 0);
        glassDoor.add(rightB);
      }
      [[-108, 110], [108, 110], [-108, -110], [108, -110]].forEach(([tx, ty]) => {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 3.4, 16), silverMat);
        screw.rotation.x = Math.PI / 2;
        screw.position.set(tx, ty, 0.8);
        glassDoor.add(screw);
      });
      group.add(glassDoor);
      meshNodes.caseLeftDoor = glassDoor;

      // Differentiated Front Panel (+X = +121)
      const frontGroup = new THREE.Group();
      frontGroup.position.set(121, 128, 0);

      if (isO11) {
        // Lian Li O11 Dynamic EVO Panoramic Pillarless Front Glass + Side Intake Fan Trio!
        const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(2.2, 240, 166), glassMat);
        frontGlass.userData.isGlass = true;
        const frontEdges = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, 240, 166)),
          new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 })
        );
        const fTop = new THREE.Mesh(new THREE.BoxGeometry(3, 6.5, 168), borderMat);
        fTop.position.y = 117;
        const fBtm = new THREE.Mesh(new THREE.BoxGeometry(3, 6.5, 168), borderMat);
        fBtm.position.y = -117;
        frontGroup.add(frontGlass, frontEdges, fTop, fBtm);

        // 3x Side-Intake Reverse ARGB Fans mounted cleanly in right showcase bay beside motherboard!
        for (let fi = -1; fi <= 1; fi++) {
          const sFan = createAxialFan(19, 9, {
            axis: 'z',
            squareFrame: true,
            boxSize: 46,
            reverse: true,
            haloColor: 0x10f06a,
            bladeColor: 0x18202c,
          });
          sFan.group.position.set(92, 152 + fi * 48, -42);
          group.add(sFan.group);
          meshNodes.caseFanList.push(sFan.rotor);
        }
      } else if (isNorth) {
        // Fractal Design North Walnut Slats + Brass Trim + Dual 140mm Front Aspect Fans + Leather Roof Tab
        const walnutMat = new THREE.MeshStandardMaterial({
          map: createWalnutWoodTexture(),
          roughness: 0.52,
          metalness: 0.08,
        });
        const backing = new THREE.Mesh(
          new THREE.BoxGeometry(2, 224, 152),
          new THREE.MeshStandardMaterial({ map: createMeshPerforationTexture(), roughness: 0.78 })
        );
        frontGroup.add(backing);
        for (let s = -4; s <= 4; s++) {
          const slat = new THREE.Mesh(new THREE.BoxGeometry(5.5, 224, 9.5), walnutMat);
          slat.position.set(3.0, 0, s * 16.5);
          slat.castShadow = true;
          frontGroup.add(slat);
        }
        const brassBar = new THREE.Mesh(
          new THREE.BoxGeometry(4, 5, 156),
          new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.94, roughness: 0.18 })
        );
        brassBar.position.set(1.5, 118, 0);
        frontGroup.add(brassBar);

        [-38, 38].forEach((fy) => {
          const nFan = createAxialFan(23, 9, {
            axis: 'x',
            squareFrame: true,
            boxSize: 54,
            bladeColor: 0x161b26,
          });
          nFan.group.position.set(-10, fy, 0);
          frontGroup.add(nFan.group);
          meshNodes.caseFanList.push(nFan.rotor);
        });
      } else {
        // Corsair 5000D / 4000D Geometric Mesh Front + 3 Front Intake RGB Fans
        const meshBacking = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 232, 160),
          new THREE.MeshStandardMaterial({
            map: createMeshPerforationTexture(),
            roughness: 0.7,
            metalness: 0.55,
            transparent: true,
            opacity: 0.85,
          })
        );
        frontGroup.add(meshBacking);
        for (let fi = -1; fi <= 1; fi++) {
          const intakeFan = createAxialFan(21, 9, {
            axis: 'x',
            squareFrame: true,
            boxSize: 50,
            haloColor: 0x10f06a,
            bladeColor: 0x18202c,
          });
          intakeFan.group.position.set(-10, fi * 54, 0);
          frontGroup.add(intakeFan.group);
          meshNodes.caseFanList.push(intakeFan.rotor);
        }
      }
      group.add(frontGroup);
      meshNodes.caseFront = frontGroup;

      // Top Roof Mesh + Power LED Button
      const topGroup = new THREE.Group();
      topGroup.position.set(0, 252, 0);
      const topRoof = new THREE.Mesh(new THREE.BoxGeometry(244, 4, 174), frameMat);
      topRoof.castShadow = true;
      const meshFilter = new THREE.Mesh(
        new THREE.BoxGeometry(196, 1.5, 118),
        new THREE.MeshStandardMaterial({ map: createMeshPerforationTexture(), roughness: 0.8 })
      );
      meshFilter.position.set(-10, 2.2, -10);
      const pwrLed = new THREE.Mesh(
        new THREE.CylinderGeometry(3.5, 3.5, 1.5, 18),
        new THREE.MeshStandardMaterial({ color: 0x10f06a, emissive: 0x10f06a, emissiveIntensity: 0.85 })
      );
      pwrLed.position.set(104, 2.5, 60);
      pwrLed.userData.isRgbTarget = true;
      topGroup.add(topRoof, meshFilter, pwrLed);
      group.add(topGroup);
      meshNodes.caseTop = topGroup;

      // Rear Panel Steel Surround + Bottom Dust Filter + Right-Side Panel
      const rearPanel = new THREE.Mesh(new THREE.BoxGeometry(3, 242, 170), frameMat);
      rearPanel.position.set(-121, 128, 0);
      group.add(rearPanel);

      const dustFilter = new THREE.Mesh(
        new THREE.BoxGeometry(230, 1.5, 162),
        new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: 0.92, metalness: 0.15, transparent: true, opacity: 0.78 })
      );
      dustFilter.position.set(0, 7, 0);
      group.add(dustFilter);

      const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(240, 244, 2.5), frameMat);
      rightPanel.position.set(0, 128, -86);
      rightPanel.receiveShadow = true;
      group.add(rightPanel);
      meshNodes.caseRight = rightPanel;
    }

    benchGroup.add(group);
    meshNodes.caseEnclosure = group;
  }

  global.Models3D = {
    buildMotherboardMesh,
    buildCpuMesh,
    buildRamMesh,
    buildStorageMesh,
    buildGpuMesh,
    buildCoolerMesh,
    buildPsuMesh,
    buildCaseMesh,
    updateAioLcdDisplay,
  };
})(window);
