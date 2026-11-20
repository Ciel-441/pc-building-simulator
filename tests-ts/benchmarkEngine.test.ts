import test from 'node:test';
import assert from 'node:assert/strict';
import { getComponentById } from '../web/src/hardwareDb.js';
import { simulateBenchmarks } from '../web/src/benchmarkEngine.js';
import { BuildConfiguration } from '../web/src/types.js';

test('gaming benchmark engine simulation', () => {
  const build: BuildConfiguration = {
    cpu: getComponentById('cpu_7800x3d'),
    gpu: getComponentById('gpu_rtx_4090'),
    memory: getComponentById('ram_trident_32gb'),
    cooler: getComponentById('cooler_arctic_360'),
    motherboard: getComponentById('mb_b650e'),
    psu: getComponentById('psu_seasonic_1000w'),
    storage: getComponentById('ssd_samsung_990pro'),
    chassis: getComponentById('case_o11_evo'),
  };

  const b4k = simulateBenchmarks(build, '4k');
  assert.equal(b4k.length, 6, 'All 6 games benchmarked at 4K');
  const cp4k = b4k[0];
  assert.equal(cp4k.gameName, 'Cyberpunk 2077');
  assert.equal(cp4k.resolutionWidth, 3840);
  assert.equal(cp4k.resolutionHeight, 2160);
  assert.ok(cp4k.avgFps >= 75 && cp4k.avgFps <= 95, '4K avg FPS verified');
  assert.ok(cp4k.low1PctFps >= 55 && cp4k.low1PctFps <= 75, '4K 1% low verified');
  assert.ok(cp4k.gpuBottleneckPct >= 85, '4K is heavily GPU bound');

  const b1080 = simulateBenchmarks(build, '1080p');
  const cs2 = b1080[2];
  assert.equal(cs2.gameName, 'Counter-Strike 2');
  assert.equal(cs2.resolutionWidth, 1920);
  assert.ok(cs2.avgFps >= 500, 'CS2 1080p frame rate exceeds 500 FPS');
  assert.ok(cs2.cpuBottleneckPct >= 50, 'CS2 at 1080p is CPU bound');
});
