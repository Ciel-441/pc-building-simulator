import test from 'node:test';
import assert from 'node:assert/strict';
import { getComponentById } from '../web/src/hardwareDb.js';
import { verifyCompatibility } from '../web/src/compatibility.js';
import { calculatePowerMetrics, calculateThermalMetrics } from '../web/src/powerThermal.js';
import { simulateBenchmarks } from '../web/src/benchmarkEngine.js';
import { handleRequest } from '../web/server.js';
import { BuildConfiguration } from '../web/src/types.js';

test('end to end test bench simulation pipeline', () => {
  const build: BuildConfiguration = {
    cpu: getComponentById('cpu_7800x3d'),
    motherboard: getComponentById('mb_b650e'),
    gpu: getComponentById('gpu_rtx_4090'),
    memory: getComponentById('ram_trident_32gb'),
    storage: getComponentById('ssd_samsung_990pro'),
    cooler: getComponentById('cooler_arctic_360'),
    psu: getComponentById('psu_seasonic_1000w'),
    chassis: getComponentById('case_o11_evo'),
  };

  // Step 1: Compatibility
  const comp = verifyCompatibility(build);
  assert.equal(comp.isCompatible, true);
  assert.equal(comp.errors.length, 0);
  assert.ok(comp.totalCostUsd > 3000);

  // Step 2: Power and Thermal
  const pwr = calculatePowerMetrics(build);
  assert.ok(pwr.peakWatts > 600);
  assert.ok(pwr.transientSpikeWatts >= 800);
  assert.ok(pwr.recommendedPsuWatts >= 1000);

  const therm = calculateThermalMetrics(build);
  assert.ok(therm.cpuLoadTempC >= 45 && therm.cpuLoadTempC <= 75);
  assert.ok(therm.gpuLoadTempC >= 55 && therm.gpuLoadTempC <= 75);
  assert.equal(therm.thermalThrottling, false);

  // Step 3: Benchmarks
  const bench = simulateBenchmarks(build, '4k');
  assert.equal(bench.length, 6);
  assert.ok(bench[0].avgFps >= 70);

  // Step 4: Server HTTP Handler
  const resCatalog = handleRequest('GET', '/api/components', '');
  assert.equal(resCatalog.status, 200);

  const resVerify = handleRequest(
    'POST',
    '/api/verify',
    JSON.stringify({ cpu: 'cpu_7800x3d', motherboard: 'mb_b650e', gpu: 'gpu_rtx_4090', psu: 'psu_seasonic_1000w' })
  );
  assert.equal(resVerify.status, 200);
  const data = JSON.parse(resVerify.body);
  assert.equal(data.isCompatible, true);
});
