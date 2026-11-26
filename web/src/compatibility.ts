import { BuildConfiguration, CompatibilityReport, MemoryType, SocketType } from './types.js';

export function socketName(s: SocketType): string {
  switch (s) {
    case 'am5':
      return 'AMD AM5';
    case 'lga1700':
      return 'Intel LGA1700';
    case 'am4':
      return 'AMD AM4';
    default:
      return 'Universal';
  }
}

export function memoryTypeName(m: MemoryType): string {
  switch (m) {
    case 'ddr5':
      return 'DDR5';
    case 'ddr4':
      return 'DDR4';
    default:
      return 'Universal';
  }
}

export function verifyCompatibility(build: BuildConfiguration): CompatibilityReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  let totalCost = 0;
  let peakWatts = 50; // Base motherboard/chassis/fan load

  // 1. Check Processor (CPU)
  if (build.cpu) {
    const cpu = build.cpu;
    totalCost += cpu.priceUsd;
    peakWatts += cpu.tdpWatts;

    // Check Socket with Motherboard
    if (build.motherboard) {
      const mb = build.motherboard;
      if (cpu.socket !== mb.socket) {
        const reqSock = socketName(cpu.socket);
        const mbSock = socketName(mb.socket);
        errors.push(
          `Socket Mismatch: CPU '${cpu.name}' requires ${reqSock}, but Motherboard '${mb.name}' has ${mbSock} socket.`
        );
      }
    }
  } else {
    warnings.push('Build incomplete: No Processor (CPU) installed.');
  }

  // 2. Check Motherboard
  if (build.motherboard) {
    const mb = build.motherboard;
    totalCost += mb.priceUsd;
    peakWatts += mb.tdpWatts;

    // Check Form Factor with Chassis
    if (build.chassis) {
      const ch = build.chassis;
      if (ch.formFactor === 'mini_itx' && mb.formFactor !== 'mini_itx') {
        errors.push(
          `Form Factor Conflict: Chassis '${ch.name}' only accommodates Mini-ITX boards, but '${mb.name}' is ATX/mATX.`
        );
      }
    }
  } else {
    warnings.push('Build incomplete: No Motherboard installed.');
  }

  // 3. Check Memory (RAM)
  if (build.memory) {
    const ram = build.memory;
    totalCost += ram.priceUsd;
    peakWatts += ram.tdpWatts;

    if (build.motherboard) {
      const mb = build.motherboard;
      if (ram.memType !== mb.memType) {
        errors.push(
          `Memory Protocol Mismatch: RAM '${ram.name}' is ${memoryTypeName(ram.memType)}, but Motherboard '${mb.name}' requires ${memoryTypeName(mb.memType)}.`
        );
      }
    }
  } else {
    warnings.push('Build incomplete: No Memory (RAM) installed.');
  }

  // 4. Check Graphics Card (GPU)
  if (build.gpu) {
    const gpu = build.gpu;
    totalCost += gpu.priceUsd;
    peakWatts += gpu.tdpWatts;

    // Physical length clearance in chassis
    if (build.chassis) {
      const ch = build.chassis;
      if (gpu.lengthMm > ch.lengthMm) {
        errors.push(
          `GPU Clearance Violation: GPU '${gpu.name}' length (${gpu.lengthMm}mm) exceeds Chassis clearance (${ch.lengthMm}mm).`
        );
      }
    }
  }

  // 5. Check Storage (SSD)
  if (build.storage) {
    const ssd = build.storage;
    totalCost += ssd.priceUsd;
    peakWatts += ssd.tdpWatts;
  }

  // 6. Check Cooler
  if (build.cooler) {
    const cooler = build.cooler;
    totalCost += cooler.priceUsd;
    peakWatts += cooler.tdpWatts;

    // Height clearance in chassis for air coolers & radiator clearance in SFF Mini-ITX cases
    if (build.chassis) {
      const ch = build.chassis;
      if (cooler.coolerType === 'air' && cooler.heightMm > ch.heightMm) {
        errors.push(
          `Cooler Clearance Violation: Air cooler height (${cooler.heightMm}mm) exceeds Chassis side panel clearance (${ch.heightMm}mm).`
        );
      } else if (
        ch.formFactor === 'mini_itx' &&
        (cooler.coolerType === 'liquid_aio_360' || cooler.coolerType === 'liquid_aio_420')
      ) {
        errors.push(
          `Radiator Clearance Violation: Cooler '${cooler.name}' (${cooler.lengthMm}mm radiator) does not fit inside Mini-ITX SFF chassis '${ch.name}'.`
        );
      }
    }
  }

  // 7. Check Chassis
  if (build.chassis) {
    totalCost += build.chassis.priceUsd;
  }

  // 8. Power Supply Sufficiency and Headroom
  let recommendedPsu = Math.floor((peakWatts * 130) / 100);
  if (recommendedPsu < 550) {
    recommendedPsu = 550;
  }

  if (build.psu) {
    const psu = build.psu;
    totalCost += psu.priceUsd;

    if (build.chassis && build.chassis.formFactor === 'mini_itx' && psu.lengthMm > 160) {
      warnings.push(
        `Tight SFF PSU Clearance: '${psu.name}' (${psu.lengthMm}mm long) is oversized for Mini-ITX '${build.chassis.name}'. Consider SFX or compact <=150mm PSU.`
      );
    }

    if (psu.psuWattage < peakWatts) {
      errors.push(
        `Inadequate Power Supply: System estimated peak draw is ${peakWatts}W, but PSU rating is only ${psu.psuWattage}W.`
      );
    } else if (psu.psuWattage < recommendedPsu) {
      warnings.push(
        `Marginal Power Headroom: System peak is ${peakWatts}W. Recommended capacity is at least ${recommendedPsu}W to accommodate transient spikes.`
      );
    }
  } else {
    warnings.push('Build incomplete: No Power Supply Unit (PSU) selected.');
  }

  const isCompatible = errors.length === 0;
  const statusSummary = isCompatible
    ? 'All selected components are 100% compatible. Mechanical clearances and power envelopes verified.'
    : 'Compatibility violations detected. Review flagged errors before assembling.';

  return {
    isCompatible,
    totalCostUsd: totalCost,
    estimatedPeakWatts: peakWatts,
    recommendedPsuWatts: recommendedPsu,
    statusSummary,
    warnings,
    errors,
  };
}
