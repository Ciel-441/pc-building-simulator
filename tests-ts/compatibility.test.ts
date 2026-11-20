import test from 'node:test';
import assert from 'node:assert/strict';
import { getComponentById } from '../web/src/hardwareDb.js';
import { verifyCompatibility } from '../web/src/compatibility.js';
import { BuildConfiguration } from '../web/src/types.js';

test('compatibility engine verification', () => {
  // Test 1: Verified Clean AM5 build
  const goodBuild: BuildConfiguration = {
    cpu: getComponentById('cpu_7800x3d'),
    motherboard: getComponentById('mb_b650e'),
    memory: getComponentById('ram_trident_32gb'),
    gpu: getComponentById('gpu_rtx_4080s'),
    psu: getComponentById('psu_seasonic_1000w'),
    chassis: getComponentById('case_o11_evo'),
    cooler: getComponentById('cooler_arctic_360'),
    storage: getComponentById('ssd_samsung_990pro'),
  };

  const rep1 = verifyCompatibility(goodBuild);
  assert.equal(rep1.isCompatible, true, 'AM5 build should be compatible');
  assert.equal(rep1.errors.length, 0, 'No errors in valid build');
  assert.ok(rep1.totalCostUsd > 2500, 'Accurate MSRP');
  assert.ok(rep1.estimatedPeakWatts > 500, 'Accurate peak wattage');

  // Test 2: Incompatible socket
  const badSocketBuild: BuildConfiguration = {
    cpu: getComponentById('cpu_7800x3d'),
    motherboard: getComponentById('mb_z790'),
    chassis: getComponentById('case_o11_evo'),
  };

  const rep2 = verifyCompatibility(badSocketBuild);
  assert.equal(rep2.isCompatible, false, 'Socket mismatch is incompatible');
  assert.ok(rep2.errors.length >= 1, 'Socket error recorded');

  // Test 3: Cooler clearance violation
  const badClearanceBuild: BuildConfiguration = {
    cpu: getComponentById('cpu_14900k'),
    motherboard: getComponentById('mb_b760_itx'),
    cooler: getComponentById('cooler_nh_d15'),
    chassis: getComponentById('case_terra'),
  };

  const rep3 = verifyCompatibility(badClearanceBuild);
  assert.equal(rep3.isCompatible, false, 'Cooler clearance violation caught');
  assert.ok(rep3.errors.length >= 1, 'Cooler height error recorded');
});
