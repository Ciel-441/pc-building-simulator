import { BuildConfiguration, GameBenchmark } from './types.js';

export function simulateBenchmarks(build: BuildConfiguration, resolution: string): GameBenchmark[] {
  const benchmarks: GameBenchmark[] = [];

  // 1. GPU Compute Index (Base 100 = RTX 4070 Super)
  let gpuIndex = 8; // Integrated fallback
  if (build.gpu) {
    switch (build.gpu.id) {
      case 'gpu_rtx_4090':
      case 'gpu_rtx_4090_fe':
        gpuIndex = 200;
        break;
      case 'gpu_rtx_4080s':
        gpuIndex = 148;
        break;
      case 'gpu_rx_7900xtx':
        gpuIndex = 140;
        break;
      case 'gpu_rtx_4070_ti_s':
        gpuIndex = 125;
        break;
      case 'gpu_rx_7900xt':
        gpuIndex = 122;
        break;
      case 'gpu_rx_7800xt':
        gpuIndex = 102;
        break;
      case 'gpu_rtx_4070s':
        gpuIndex = 100;
        break;
      case 'gpu_rtx_4060':
        gpuIndex = 52;
        break;
      default:
        gpuIndex = 80;
        break;
    }
  }

  // 2. CPU IPC & Gaming Index (Base 100 = 7600X)
  let cpuIndex = 25;
  let has3dVcache = false;
  if (build.cpu) {
    switch (build.cpu.id) {
      case 'cpu_7950x3d':
        cpuIndex = 135;
        has3dVcache = true;
        break;
      case 'cpu_7800x3d':
        cpuIndex = 128;
        has3dVcache = true;
        break;
      case 'cpu_14900ks':
        cpuIndex = 130;
        break;
      case 'cpu_14900k':
        cpuIndex = 124;
        break;
      case 'cpu_14700k':
        cpuIndex = 116;
        break;
      case 'cpu_14600k':
        cpuIndex = 108;
        break;
      case 'cpu_7600x':
        cpuIndex = 100;
        break;
      case 'cpu_5800x3d':
        cpuIndex = 102;
        has3dVcache = true;
        break;
      default:
        cpuIndex = 90;
        break;
    }
  }

  // 3. Resolution scaling factors
  const resNorm = resolution.toLowerCase();
  let resWidth = 1920;
  let resHeight = 1080;
  let resScalePct = 100;
  let baseGpuBottleneck = 48;

  if (resNorm.includes('4k')) {
    resWidth = 3840;
    resHeight = 2160;
    resScalePct = 42;
    baseGpuBottleneck = 88;
  } else if (resNorm.includes('1440')) {
    resWidth = 2560;
    resHeight = 1440;
    resScalePct = 72;
    baseGpuBottleneck = 70;
  }

  // 4. Game 1: Cyberpunk 2077 (Ultra Preset)
  const cpBase = 98;
  const cpFps = Math.floor((cpBase * gpuIndex * resScalePct) / 10000);
  let cp1Pct = Math.floor((cpFps * 74) / 100);
  if (has3dVcache) cp1Pct += 6;
  const cpGpuBottle = baseGpuBottleneck + 2;
  const cpCpuBottle = 100 - cpGpuBottle;
  benchmarks.push({
    gameName: 'Cyberpunk 2077',
    resolutionWidth: resWidth,
    resolutionHeight: resHeight,
    avgFps: cpFps,
    low1PctFps: cp1Pct,
    cpuBottleneckPct: cpCpuBottle,
    gpuBottleneckPct: cpGpuBottle,
    qualityPreset: 'Ray Tracing Ultra',
  });

  // 5. Game 2: Black Myth: Wukong (Cinematic)
  const bmBase = 86;
  const bmFps = Math.floor((bmBase * gpuIndex * resScalePct) / 10000);
  let bm1Pct = Math.floor((bmFps * 76) / 100);
  if (has3dVcache) bm1Pct += 5;
  const bmGpuBottle = baseGpuBottleneck + 3;
  const bmCpuBottle = 100 - bmGpuBottle;
  benchmarks.push({
    gameName: 'Black Myth: Wukong',
    resolutionWidth: resWidth,
    resolutionHeight: resHeight,
    avgFps: bmFps,
    low1PctFps: bm1Pct,
    cpuBottleneckPct: bmCpuBottle,
    gpuBottleneckPct: bmGpuBottle,
    qualityPreset: 'Cinematic TSR',
  });

  // 6. Game 3: Counter-Strike 2 (Competitive Max)
  const csBase = 350;
  let csFps = 0;
  let csGpuBottle = 30;
  let csCpuBottle = 70;

  if (resNorm.includes('4k')) {
    csFps = Math.floor((csBase * gpuIndex * 44) / 10000);
    csGpuBottle = 65;
    csCpuBottle = 35;
  } else if (resNorm.includes('1440')) {
    csFps = Math.floor((csBase * (gpuIndex * 40 + cpuIndex * 60)) / 10000);
    csGpuBottle = 45;
    csCpuBottle = 55;
  } else {
    csFps =
      Math.floor((csBase * cpuIndex * 130) / 10000) + Math.floor((gpuIndex * 12) / 10);
    csGpuBottle = 25;
    csCpuBottle = 75;
  }
  const cs1Pct = has3dVcache
    ? Math.floor((csFps * 80) / 100)
    : Math.floor((csFps * 72) / 100);

  benchmarks.push({
    gameName: 'Counter-Strike 2',
    resolutionWidth: resWidth,
    resolutionHeight: resHeight,
    avgFps: csFps,
    low1PctFps: cs1Pct,
    cpuBottleneckPct: csCpuBottle,
    gpuBottleneckPct: csGpuBottle,
    qualityPreset: 'Competitive Max',
  });

  // 7. Game 4: Red Dead Redemption 2 (Ultra)
  const rdBase = 125;
  const rdFps = Math.floor((rdBase * gpuIndex * (resScalePct + 4)) / 10000);
  const rd1Pct = Math.floor((rdFps * 76) / 100);
  const rdGpuBottle = baseGpuBottleneck;
  const rdCpuBottle = 100 - rdGpuBottle;
  benchmarks.push({
    gameName: 'Red Dead Redemption 2',
    resolutionWidth: resWidth,
    resolutionHeight: resHeight,
    avgFps: rdFps,
    low1PctFps: rd1Pct,
    cpuBottleneckPct: rdCpuBottle,
    gpuBottleneckPct: rdGpuBottle,
    qualityPreset: 'Ultra',
  });

  // 8. Game 5: Shadow of the Tomb Raider (Highest)
  const trBase = 185;
  const trFps = Math.floor((trBase * gpuIndex * (resScalePct + 3)) / 10000);
  const tr1Pct = Math.floor((trFps * 75) / 100);
  const trGpuBottle = baseGpuBottleneck - 4;
  const trCpuBottle = 100 - trGpuBottle;
  benchmarks.push({
    gameName: 'Shadow of the Tomb Raider',
    resolutionWidth: resWidth,
    resolutionHeight: resHeight,
    avgFps: trFps,
    low1PctFps: tr1Pct,
    cpuBottleneckPct: trCpuBottle,
    gpuBottleneckPct: trGpuBottle,
    qualityPreset: 'Highest Preset',
  });

  // 9. Game 6: Hogwarts Legacy (Ultra + Ray Tracing)
  const hwBase = 95;
  const hwFps = Math.floor((hwBase * gpuIndex * (resScalePct - 1)) / 10000);
  const hw1Pct = Math.floor((hwFps * 72) / 100);
  const hwGpuBottle = baseGpuBottleneck + 2;
  const hwCpuBottle = 100 - hwGpuBottle;
  benchmarks.push({
    gameName: 'Hogwarts Legacy',
    resolutionWidth: resWidth,
    resolutionHeight: resHeight,
    avgFps: hwFps,
    low1PctFps: hw1Pct,
    cpuBottleneckPct: hwCpuBottle,
    gpuBottleneckPct: hwGpuBottle,
    qualityPreset: 'Ultra Ray Tracing',
  });

  return benchmarks;
}
