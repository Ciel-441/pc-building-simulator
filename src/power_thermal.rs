use crate::types::{BuildConfiguration, CoolerType, PowerMetrics, ThermalMetrics};

pub fn calculate_power_metrics(build: &BuildConfiguration) -> PowerMetrics {
    let cpu_tdp = build.cpu.as_ref().map_or(0, |c| c.tdp_watts);
    let gpu_tdp = build.gpu.as_ref().map_or(0, |c| c.tdp_watts);
    let mb_watts = build.motherboard.as_ref().map_or(0, |c| c.tdp_watts);
    let ram_watts = build.memory.as_ref().map_or(0, |c| c.tdp_watts);
    let ssd_watts = build.storage.as_ref().map_or(0, |c| c.tdp_watts);
    let cooler_watts = build.cooler.as_ref().map_or(0, |c| c.tdp_watts);
    let base_watts = 25; // Fans, chipset, RGB lighting

    // 100% stress peak load
    let peak_watts = cpu_tdp + gpu_tdp + mb_watts + ram_watts + ssd_watts + cooler_watts + base_watts;

    // Realistic heavy gaming load (~65% CPU, ~90% GPU)
    let load_watts =
        ((cpu_tdp * 65) / 100) + ((gpu_tdp * 90) / 100) + mb_watts + ram_watts + ssd_watts + cooler_watts + 20;

    // Idle power draw
    let mut idle_watts = 35;
    if build.cpu.is_some() {
        idle_watts += 10;
    }
    if build.gpu.is_some() {
        idle_watts += 15;
    }

    // Transient spike excursion (ATX 3.0 specification: 130-140% GPU spikes)
    let transient_spike_watts =
        cpu_tdp + ((gpu_tdp * 135) / 100) + mb_watts + ram_watts + base_watts + 30;

    // Recommended PSU with 25-30% headroom rounded up to nearest 50W
    let raw_rec = (transient_spike_watts * 115) / 100;
    let mut recommended_psu_watts = ((raw_rec + 49) / 50) * 50;
    if recommended_psu_watts < 550 {
        recommended_psu_watts = 550;
    }

    // 80-Plus efficiency at median gaming load
    let efficiency_pct = 90;

    // Annual electricity cost (4 hrs/day * 365 days @ $0.16/kWh)
    let annual_cost_kwh = (load_watts * 4 * 365 * 16) / 100000;

    PowerMetrics::new(
        idle_watts,
        load_watts,
        peak_watts,
        transient_spike_watts,
        recommended_psu_watts,
        efficiency_pct,
        annual_cost_kwh,
    )
}

pub fn calculate_thermal_metrics(build: &BuildConfiguration) -> ThermalMetrics {
    let cpu_tdp = build.cpu.as_ref().map_or(65, |c| c.tdp_watts);
    let gpu_tdp = build.gpu.as_ref().map_or(0, |c| c.tdp_watts);

    // Cooler thermal dissipation capacity (Watts)
    let cooler_cap = if let Some(ref cooler) = build.cooler {
        if cooler.cooler_type == CoolerType::LiquidAio360 || cooler.cooler_type == CoolerType::LiquidAio420 {
            350
        } else if cooler.cooler_type == CoolerType::LiquidAio240 {
            280
        } else if cooler.id == "cooler_a115" {
            270
        } else if cooler.id == "cooler_nh_d15" {
            250
        } else if cooler.id == "cooler_peerless_120" {
            220
        } else {
            180
        }
    } else {
        30 // Uncooled thermal bottleneck
    };

    // CPU Temperatures (Die junction delta + Cooler water/fin delta + Ambient)
    let idle_delta = if cooler_cap >= 250 { 10 } else { 14 };
    let cpu_idle_temp_c = 22 + idle_delta;

    let die_delta = (cpu_tdp * 17) / 100;
    let rad_delta = (cpu_tdp * 20) / cooler_cap;
    let mut cpu_load_temp_c = 22 + die_delta + rad_delta;
    let mut thermal_throttling = false;

    if cooler_cap < cpu_tdp || cpu_load_temp_c >= 95 {
        cpu_load_temp_c = 100;
        thermal_throttling = true;
    }

    // GPU Temperatures
    let gpu_idle_temp_c;
    let gpu_load_temp_c;
    if gpu_tdp > 0 {
        gpu_idle_temp_c = 34;
        let delta_gpu = (gpu_tdp * 30) / 300;
        let mut t = 22 + delta_gpu;
        if t < 60 {
            t = 60;
        }
        if t > 75 {
            t = 75;
        }
        gpu_load_temp_c = t;
    } else {
        gpu_idle_temp_c = 25;
        gpu_load_temp_c = 30;
    }

    // Acoustic noise decibels (dBA)
    let noise_decibels_idle = 24;
    let mut noise_decibels_load = 36;
    if gpu_tdp > 250 {
        noise_decibels_load += 4;
    }
    if thermal_throttling {
        noise_decibels_load += 8; // Max fan ramp
    }

    ThermalMetrics::new(
        cpu_idle_temp_c,
        cpu_load_temp_c,
        gpu_idle_temp_c,
        gpu_load_temp_c,
        noise_decibels_idle,
        noise_decibels_load,
        thermal_throttling,
    )
}
