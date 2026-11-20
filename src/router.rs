use crate::benchmark_engine::simulate_benchmarks;
use crate::compatibility::verify_compatibility;
use crate::frontend_assets::get_spa_html;
use crate::hardware_db::{get_all_components, get_component_by_id};
use crate::power_thermal::{calculate_power_metrics, calculate_thermal_metrics};
use crate::types::{BuildConfiguration, ComponentKind};
use serde_json::json;

#[derive(Debug, Clone, PartialEq)]
pub struct HttpResponse {
    pub status_code: u16,
    pub content_type: String,
    pub body: String,
}

impl HttpResponse {
    pub fn new(status_code: u16, content_type: impl Into<String>, body: impl Into<String>) -> Self {
        Self {
            status_code,
            content_type: content_type.into(),
            body: body.into(),
        }
    }
}

pub fn parse_build_from_json(body: &str) -> BuildConfiguration {
    let mut build = BuildConfiguration::new();
    let all = get_all_components();

    for c in all {
        let pattern = format!("\"{}\"", c.id);
        if body.contains(&pattern) {
            match c.kind {
                ComponentKind::Processor => build.cpu = Some(c),
                ComponentKind::GraphicsCard => build.gpu = Some(c),
                ComponentKind::Motherboard => build.motherboard = Some(c),
                ComponentKind::Memory => build.memory = Some(c),
                ComponentKind::Storage => build.storage = Some(c),
                ComponentKind::PowerSupply => build.psu = Some(c),
                ComponentKind::Cooler => build.cooler = Some(c),
                ComponentKind::Chassis => build.chassis = Some(c),
            }
        }
    }

    // Also support direct JSON object parse with keys: cpu, gpu, etc.
    if let Ok(val) = serde_json::from_str::<serde_json::Value>(body) {
        if let Some(obj) = val.as_object() {
            let slot_map = [
                ("cpu", ComponentKind::Processor),
                ("gpu", ComponentKind::GraphicsCard),
                ("motherboard", ComponentKind::Motherboard),
                ("memory", ComponentKind::Memory),
                ("storage", ComponentKind::Storage),
                ("psu", ComponentKind::PowerSupply),
                ("cooler", ComponentKind::Cooler),
                ("chassis", ComponentKind::Chassis),
            ];

            for (slot, kind) in slot_map {
                if let Some(id_val) = obj.get(slot).and_then(|v| v.as_str()) {
                    if let Some(comp) = get_component_by_id(id_val) {
                        match kind {
                            ComponentKind::Processor => build.cpu = Some(comp),
                            ComponentKind::GraphicsCard => build.gpu = Some(comp),
                            ComponentKind::Motherboard => build.motherboard = Some(comp),
                            ComponentKind::Memory => build.memory = Some(comp),
                            ComponentKind::Storage => build.storage = Some(comp),
                            ComponentKind::PowerSupply => build.psu = Some(comp),
                            ComponentKind::Cooler => build.cooler = Some(comp),
                            ComponentKind::Chassis => build.chassis = Some(comp),
                        }
                    }
                }
            }
        }
    }

    build
}

pub fn dispatch_request(method: &str, path: &str, body: &str) -> HttpResponse {
    let method = method.to_ascii_uppercase();

    // CORS preflight
    if method == "OPTIONS" {
        return HttpResponse::new(200, "text/plain", "OK");
    }

    // 0. Spatial 3D Web UI Single Page Application
    if method == "GET" && (path == "/" || path == "/index.html") {
        return HttpResponse::new(200, "text/html; charset=utf-8", get_spa_html());
    }

    // 1. Health check
    if method == "GET" && path == "/health" {
        let resp = json!({
            "status": "healthy",
            "engine": "PC Simulator [Rust + TypeScript]",
            "version": "0.2.0"
        });
        return HttpResponse::new(200, "application/json", resp.to_string());
    }

    // 2. Hardware components catalog
    if method == "GET" && path == "/api/components" {
        let catalog = get_all_components();
        let resp = serde_json::to_string(&catalog).unwrap_or_else(|_| "[]".to_string());
        return HttpResponse::new(200, "application/json", resp);
    }

    // 3. Compatibility & Clearance verification
    if method == "POST" && path == "/api/verify" {
        let build = parse_build_from_json(body);
        let rep = verify_compatibility(&build);
        let resp = serde_json::to_string(&rep).unwrap_or_else(|_| "{}".to_string());
        return HttpResponse::new(200, "application/json", resp);
    }

    // 4. Power & Thermal simulation
    if method == "POST" && path == "/api/power" {
        let build = parse_build_from_json(body);
        let pwr = calculate_power_metrics(&build);
        let therm = calculate_thermal_metrics(&build);

        let resp = json!({
            "idleWatts": pwr.idle_watts,
            "loadWatts": pwr.load_watts,
            "peakWatts": pwr.peak_watts,
            "transientSpikeWatts": pwr.transient_spike_watts,
            "recommendedPsuWatts": pwr.recommended_psu_watts,
            "efficiencyPct": pwr.efficiency_pct,
            "annualCostKwh": pwr.annual_cost_kwh,
            "cpuIdleTempC": therm.cpu_idle_temp_c,
            "cpuLoadTempC": therm.cpu_load_temp_c,
            "gpuIdleTempC": therm.gpu_idle_temp_c,
            "gpuLoadTempC": therm.gpu_load_temp_c,
            "noiseDecibelsIdle": therm.noise_decibels_idle,
            "noiseDecibelsLoad": therm.noise_decibels_load,
            "thermalThrottling": therm.thermal_throttling
        });
        return HttpResponse::new(200, "application/json", resp.to_string());
    }

    // 5. Gaming benchmarks simulation
    if method == "POST" && path == "/api/benchmark" {
        let build = parse_build_from_json(body);
        let resolution = if body.contains("\"4k\"") || body.contains("\"4K\"") {
            "4k"
        } else if body.contains("\"1080p\"") || body.contains("\"1080P\"") {
            "1080p"
        } else {
            "1440p"
        };

        let bench = simulate_benchmarks(&build, resolution);
        let resp = serde_json::to_string(&bench).unwrap_or_else(|_| "[]".to_string());
        return HttpResponse::new(200, "application/json", resp);
    }

    // 6. Authentic live market price crawler & open dataset index
    if method == "GET" && path == "/api/live-prices" {
        const AUTHENTIC_DATA: &str = include_str!("authentic_market_data.json");
        return HttpResponse::new(200, "application/json", AUTHENTIC_DATA.to_string());
    }

    // Default 404
    HttpResponse::new(404, "application/json", r#"{"error":"Not Found"}"#)
}
