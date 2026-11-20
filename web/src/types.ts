export type ComponentKind =
  | 'processor'
  | 'graphics_card'
  | 'motherboard'
  | 'memory'
  | 'storage'
  | 'power_supply'
  | 'cooler'
  | 'chassis';

export type SocketType = 'am5' | 'lga1700' | 'am4' | 'not_applicable';

export type MemoryType = 'ddr5' | 'ddr4' | 'not_applicable';

export type FormFactor = 'atx' | 'micro_atx' | 'mini_itx' | 'e_atx' | 'not_applicable';

export type CoolerType = 'air' | 'liquid_aio_240' | 'liquid_aio_360' | 'liquid_aio_420' | 'not_applicable';

export interface Component {
  id: string;
  name: string;
  brand: string;
  kind: ComponentKind;
  priceUsd: number;
  tdpWatts: number;
  socket: SocketType;
  memType: MemoryType;
  formFactor: FormFactor;
  coolerType: CoolerType;
  lengthMm: number;
  heightMm: number;
  psuWattage: number;
  coreCount: number;
  baseClockMhz: number;
  boostClockMhz: number;
  vramGb: number;
  memorySpeedMhz: number;
  capacityGb: number;
  colorway: string;
  visualStyle: string;
  rgbLighting: boolean;
  imageBadge: string;
}

export interface BuildConfiguration {
  cpu?: Component | null;
  gpu?: Component | null;
  motherboard?: Component | null;
  memory?: Component | null;
  storage?: Component | null;
  psu?: Component | null;
  cooler?: Component | null;
  chassis?: Component | null;
}

export interface CompatibilityReport {
  isCompatible: boolean;
  totalCostUsd: number;
  estimatedPeakWatts: number;
  recommendedPsuWatts: number;
  statusSummary: string;
  warnings: string[];
  errors: string[];
}

export interface GameBenchmark {
  gameName: string;
  resolutionWidth: number;
  resolutionHeight: number;
  avgFps: number;
  low1PctFps: number;
  cpuBottleneckPct: number;
  gpuBottleneckPct: number;
  qualityPreset: string;
}

export interface PowerMetrics {
  idleWatts: number;
  loadWatts: number;
  peakWatts: number;
  transientSpikeWatts: number;
  recommendedPsuWatts: number;
  efficiencyPct: number;
  annualCostKwh: number;
}

export interface ThermalMetrics {
  cpuIdleTempC: number;
  cpuLoadTempC: number;
  gpuIdleTempC: number;
  gpuLoadTempC: number;
  noiseDecibelsIdle: number;
  noiseDecibelsLoad: number;
  thermalThrottling: boolean;
}
