import test from 'node:test';
import assert from 'node:assert/strict';
import { getComponentById } from '../web/src/hardwareDb.js';
import { calculatePowerMetrics, calculateThermalMetrics } from '../web/src/powerThermal.js';
import { BuildConfiguration } from '../web/src/types.js';

test('power and thermal calculations', () => {
  const flagshipBuild: BuildConfiguration = {
    cpu: getComponentById('cpu_14900k'),
    gpu: getComponentById('gpu_rtx_4090_fe') || getComponentById('gpu_rtx_4090'),
    motherboard: getComponentById('mb_z790'),
    memory: getComponentById('ram_dominator_64gb'),
    storage: getComponentById('ssd_crucial_t700'),
    cooler: getComponentById('cooler_arctic_360'),
    psu: getComponentById('psu_seasonic_1000w'),
    chassis: getComponentById('case_o11_evo'),
  };

  const pwr = calculatePowerMetrics(flagshipBuild);
  assert.ok(pwr.idleWatts >= 40 && pwr.idleWatts <= 75, 'Realistic idle wattage');
  assert.ok(pwr.loadWatts >= 550 && pwr.loadWatts <= 730, 'Realistic gaming load');
  assert.ok(pwr.peakWatts >= 750 && pwr.peakWatts <= 860, 'Realistic peak wattage');
  assert.ok(pwr.transientSpikeWatts >= 950, 'ATX 3.0 transient spike calculation');
  assert.ok(pwr.recommendedPsuWatts >= 1000, 'PSU recommendation >= 1000W');

  const therm = calculateThermalMetrics(flagshipBuild);
  assert.ok(therm.cpuIdleTempC >= 30 && therm.cpuIdleTempC <= 42, 'CPU idle temp normal');
  assert.ok(therm.cpuLoadTempC >= 75 && therm.cpuLoadTempC <= 88, 'Liquid Freezer III load temp normal');
  assert.ok(therm.gpuLoadTempC >= 60 && therm.gpuLoadTempC <= 72, 'RTX 4090 temp normal');
  assert.equal(therm.thermalThrottling, false, 'No throttling with 360mm AIO');

  // Uncooled build
  const uncooledBuild: BuildConfiguration = {
    cpu: getComponentById('cpu_14900k'),
  };
  const therm2 = calculateThermalMetrics(uncooledBuild);
  assert.equal(therm2.thermalThrottling, true, 'Uncooled 14900K throttles');
  assert.ok(therm2.cpuLoadTempC >= 100, 'CPU hits junction limit');
});
