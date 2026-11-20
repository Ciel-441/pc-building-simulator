import { BuildConfiguration, PowerMetrics, ThermalMetrics } from './types.js';

export function calculatePowerMetrics(build: BuildConfiguration): PowerMetrics {
  const cpuTdp = build.cpu?.tdpWatts ?? 0;
  const gpuTdp = build.gpu?.tdpWatts ?? 0;
  const mbWatts = build.motherboard?.tdpWatts ?? 0;
  const ramWatts = build.memory?.tdpWatts ?? 0;
  const ssdWatts = build.storage?.tdpWatts ?? 0;
  const coolerWatts = build.cooler?.tdpWatts ?? 0;
  const baseWatts = 25; // Fans, chipset, RGB lighting

  // 100% stress peak load
  const peakWatts = cpuTdp + gpuTdp + mbWatts + ramWatts + ssdWatts + coolerWatts + baseWatts;

  // Realistic heavy gaming load (~65% CPU, ~90% GPU)
  const loadWatts =
    Math.floor((cpuTdp * 65) / 100) +
    Math.floor((gpuTdp * 90) / 100) +
    mbWatts +
    ramWatts +
    ssdWatts +
    coolerWatts +
    20;

  // Idle power draw
  let idleWatts = 35;
  if (build.cpu) idleWatts += 10;
  if (build.gpu) idleWatts += 15;

  // Transient spike excursion (ATX 3.0 specification: 130-140% GPU spikes)
  const transientSpikeWatts =
    cpuTdp + Math.floor((gpuTdp * 135) / 100) + mbWatts + ramWatts + baseWatts + 30;

  // Recommended PSU with 25-30% headroom rounded up to nearest 50W
  const rawRec = Math.floor((transientSpikeWatts * 115) / 100);
  let recommendedPsuWatts = Math.floor((rawRec + 49) / 50) * 50;
  if (recommendedPsuWatts < 550) {
    recommendedPsuWatts = 550;
  }

  // 80-Plus efficiency at median gaming load
  const efficiencyPct = 90;

  // Annual electricity cost (4 hrs/day * 365 days @ $0.16/kWh)
  const annualCostKwh = Math.floor((loadWatts * 4 * 365 * 16) / 100000);

  return {
    idleWatts,
    loadWatts,
    peakWatts,
    transientSpikeWatts,
    recommendedPsuWatts,
    efficiencyPct,
    annualCostKwh,
  };
}

export function calculateThermalMetrics(build: BuildConfiguration): ThermalMetrics {
  const cpuTdp = build.cpu?.tdpWatts ?? 65;
  const gpuTdp = build.gpu?.tdpWatts ?? 0;

  // Cooler thermal dissipation capacity (Watts)
  let coolerCap = 30; // Uncooled thermal bottleneck
  if (build.cooler) {
    const c = build.cooler;
    if (c.coolerType === 'liquid_aio_360' || c.coolerType === 'liquid_aio_420') {
      coolerCap = 350;
    } else if (c.coolerType === 'liquid_aio_240') {
      coolerCap = 280;
    } else if (c.id === 'cooler_a115') {
      coolerCap = 270;
    } else if (c.id === 'cooler_nh_d15') {
      coolerCap = 250;
    } else if (c.id === 'cooler_peerless_120') {
      coolerCap = 220;
    } else {
      coolerCap = 180;
    }
  }

  // CPU Temperatures (Die junction delta + Cooler water/fin delta + Ambient)
  const idleDelta = coolerCap >= 250 ? 10 : 14;
  const cpuIdleTempC = 22 + idleDelta;

  const dieDelta = Math.floor((cpuTdp * 17) / 100);
  const radDelta = Math.floor((cpuTdp * 20) / coolerCap);
  let cpuLoadTempC = 22 + dieDelta + radDelta;
  let thermalThrottling = false;

  if (coolerCap < cpuTdp || cpuLoadTempC >= 95) {
    cpuLoadTempC = 100;
    thermalThrottling = true;
  }

  // GPU Temperatures
  let gpuIdleTempC = 25;
  let gpuLoadTempC = 30;
  if (gpuTdp > 0) {
    gpuIdleTempC = 34;
    const deltaGpu = Math.floor((gpuTdp * 30) / 300);
    let t = 22 + deltaGpu;
    if (t < 60) t = 60;
    if (t > 75) t = 75;
    gpuLoadTempC = t;
  }

  // Acoustic noise decibels (dBA)
  const noiseDecibelsIdle = 24;
  let noiseDecibelsLoad = 36;
  if (gpuTdp > 250) {
    noiseDecibelsLoad += 4;
  }
  if (thermalThrottling) {
    noiseDecibelsLoad += 8; // Max fan ramp
  }

  return {
    cpuIdleTempC,
    cpuLoadTempC,
    gpuIdleTempC,
    gpuLoadTempC,
    noiseDecibelsIdle,
    noiseDecibelsLoad,
    thermalThrottling,
  };
}
