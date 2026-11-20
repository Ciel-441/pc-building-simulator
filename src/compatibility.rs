use crate::types::{
    BuildConfiguration, CompatibilityReport, CoolerType, FormFactor, SocketType,
};

pub fn socket_name(s: SocketType) -> &'static str {
    match s {
        SocketType::Am5 => "AMD AM5",
        SocketType::Lga1700 => "Intel LGA1700",
        SocketType::Am4 => "AMD AM4",
        SocketType::NotApplicable => "Universal",
    }
}

pub fn verify_compatibility(build: &BuildConfiguration) -> CompatibilityReport {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();

    let mut total_cost = 0;
    let mut peak_watts = 50; // Base motherboard/chassis/fan load

    // 1. Check Processor (CPU)
    if let Some(ref cpu) = build.cpu {
        total_cost += cpu.price_usd;
        peak_watts += cpu.tdp_watts;

        // Check Socket with Motherboard
        if let Some(ref mb) = build.motherboard {
            if cpu.socket != mb.socket {
                let req_sock = socket_name(cpu.socket);
                let mb_sock = socket_name(mb.socket);
                errors.push(format!(
                    "Socket Mismatch: CPU '{}' requires {}, but Motherboard '{}' has {} socket.",
                    cpu.name, req_sock, mb.name, mb_sock
                ));
            }
        }
    } else {
        warnings.push("Build incomplete: No Processor (CPU) installed.".to_string());
    }

    // 2. Check Motherboard
    if let Some(ref mb) = build.motherboard {
        total_cost += mb.price_usd;
        peak_watts += mb.tdp_watts;

        // Check Form Factor with Chassis
        if let Some(ref ch) = build.chassis {
            if ch.form_factor == FormFactor::MiniItx && mb.form_factor != FormFactor::MiniItx {
                errors.push(format!(
                    "Form Factor Conflict: Chassis '{}' only accommodates Mini-ITX boards, but '{}' is ATX/mATX.",
                    ch.name, mb.name
                ));
            }
        }
    } else {
        warnings.push("Build incomplete: No Motherboard installed.".to_string());
    }

    // 3. Check Memory (RAM)
    if let Some(ref ram) = build.memory {
        total_cost += ram.price_usd;
        peak_watts += ram.tdp_watts;

        if let Some(ref mb) = build.motherboard {
            if ram.mem_type != mb.mem_type {
                errors.push(format!(
                    "Memory Protocol Mismatch: RAM '{}' is DDR5, but Motherboard requires DDR4.",
                    ram.name
                ));
            }
        }
    } else {
        warnings.push("Build incomplete: No Memory (RAM) installed.".to_string());
    }

    // 4. Check Graphics Card (GPU)
    if let Some(ref gpu) = build.gpu {
        total_cost += gpu.price_usd;
        peak_watts += gpu.tdp_watts;

        // Physical length clearance in chassis
        if let Some(ref ch) = build.chassis {
            if gpu.length_mm > ch.length_mm {
                errors.push(format!(
                    "GPU Clearance Violation: GPU '{}' length ({}mm) exceeds Chassis clearance ({}mm).",
                    gpu.name, gpu.length_mm, ch.length_mm
                ));
            }
        }
    }

    // 5. Check Storage (SSD)
    if let Some(ref ssd) = build.storage {
        total_cost += ssd.price_usd;
        peak_watts += ssd.tdp_watts;
    }

    // 6. Check Cooler
    if let Some(ref cooler) = build.cooler {
        total_cost += cooler.price_usd;
        peak_watts += cooler.tdp_watts;

        // Height clearance in chassis for air coolers
        if cooler.cooler_type == CoolerType::Air {
            if let Some(ref ch) = build.chassis {
                if cooler.height_mm > ch.height_mm {
                    errors.push(format!(
                        "Cooler Clearance Violation: Air cooler height ({}mm) exceeds Chassis side panel clearance ({}mm).",
                        cooler.height_mm, ch.height_mm
                    ));
                }
            }
        }
    }

    // 7. Check Chassis
    if let Some(ref ch) = build.chassis {
        total_cost += ch.price_usd;
    }

    // 8. Power Supply Sufficiency and Headroom
    let mut recommended_psu = (peak_watts * 130) / 100;
    if recommended_psu < 550 {
        recommended_psu = 550;
    }

    if let Some(ref psu) = build.psu {
        total_cost += psu.price_usd;

        if psu.psu_wattage < peak_watts {
            errors.push(format!(
                "Inadequate Power Supply: System estimated peak draw is {}W, but PSU rating is only {}W.",
                peak_watts, psu.psu_wattage
            ));
        } else if psu.psu_wattage < recommended_psu {
            warnings.push(format!(
                "Marginal Power Headroom: System peak is {}W. Recommended capacity is at least {}W to accommodate transient spikes.",
                peak_watts, recommended_psu
            ));
        }
    } else {
        warnings.push("Build incomplete: No Power Supply Unit (PSU) selected.".to_string());
    }

    let is_compatible = errors.is_empty();
    let status_summary = if is_compatible {
        "All selected components are 100% compatible. Mechanical clearances and power envelopes verified."
    } else {
        "Compatibility violations detected. Review flagged errors before assembling."
    };

    CompatibilityReport::new(
        total_cost,
        peak_watts,
        recommended_psu,
        status_summary,
        warnings,
        errors,
    )
}
