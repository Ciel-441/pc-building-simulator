use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ComponentKind {
    Processor,
    GraphicsCard,
    Motherboard,
    Memory,
    Storage,
    PowerSupply,
    Cooler,
    Chassis,
}

impl ComponentKind {
    pub fn to_index(&self) -> usize {
        match self {
            ComponentKind::Processor => 0,
            ComponentKind::GraphicsCard => 1,
            ComponentKind::Motherboard => 2,
            ComponentKind::Memory => 3,
            ComponentKind::Storage => 4,
            ComponentKind::PowerSupply => 5,
            ComponentKind::Cooler => 6,
            ComponentKind::Chassis => 7,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SocketType {
    Am5,
    Lga1700,
    Am4,
    NotApplicable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MemoryType {
    Ddr5,
    Ddr4,
    NotApplicable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FormFactor {
    Atx,
    MicroAtx,
    MiniItx,
    EAtx,
    NotApplicable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CoolerType {
    Air,
    LiquidAio240,
    LiquidAio360,
    LiquidAio420,
    NotApplicable,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Component {
    pub id: String,
    pub name: String,
    pub brand: String,
    pub kind: ComponentKind,
    pub price_usd: i32,
    pub tdp_watts: i32,
    pub socket: SocketType,
    pub mem_type: MemoryType,
    pub form_factor: FormFactor,
    pub cooler_type: CoolerType,
    pub length_mm: i32,
    pub height_mm: i32,
    pub psu_wattage: i32,
    pub core_count: i32,
    pub base_clock_mhz: i32,
    pub boost_clock_mhz: i32,
    pub vram_gb: i32,
    pub memory_speed_mhz: i32,
    pub capacity_gb: i32,
    pub colorway: String,
    pub visual_style: String,
    pub rgb_lighting: bool,
    pub image_badge: String,
}

impl Component {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        brand: impl Into<String>,
        kind: ComponentKind,
        price_usd: i32,
        tdp_watts: i32,
        socket: SocketType,
        mem_type: MemoryType,
        form_factor: FormFactor,
        cooler_type: CoolerType,
        length_mm: i32,
        height_mm: i32,
        psu_wattage: i32,
        core_count: i32,
        base_clock_mhz: i32,
        boost_clock_mhz: i32,
        vram_gb: i32,
        memory_speed_mhz: i32,
        capacity_gb: i32,
        colorway: impl Into<String>,
        visual_style: impl Into<String>,
        rgb_lighting: bool,
        image_badge: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            brand: brand.into(),
            kind,
            price_usd,
            tdp_watts,
            socket,
            mem_type,
            form_factor,
            cooler_type,
            length_mm,
            height_mm,
            psu_wattage,
            core_count,
            base_clock_mhz,
            boost_clock_mhz,
            vram_gb,
            memory_speed_mhz,
            capacity_gb,
            colorway: colorway.into(),
            visual_style: visual_style.into(),
            rgb_lighting,
            image_badge: image_badge.into(),
        }
    }
}

#[derive(Debug, Default, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildConfiguration {
    pub cpu: Option<Component>,
    pub gpu: Option<Component>,
    pub motherboard: Option<Component>,
    pub memory: Option<Component>,
    pub storage: Option<Component>,
    pub psu: Option<Component>,
    pub cooler: Option<Component>,
    pub chassis: Option<Component>,
}

impl BuildConfiguration {
    pub fn new() -> Self {
        Self::default()
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompatibilityReport {
    pub is_compatible: bool,
    pub total_cost_usd: i32,
    pub estimated_peak_watts: i32,
    pub recommended_psu_watts: i32,
    pub status_summary: String,
    pub warnings: Vec<String>,
    pub errors: Vec<String>,
}

impl CompatibilityReport {
    pub fn new(
        total_cost_usd: i32,
        estimated_peak_watts: i32,
        recommended_psu_watts: i32,
        status_summary: impl Into<String>,
        warnings: Vec<String>,
        errors: Vec<String>,
    ) -> Self {
        let is_compatible = errors.is_empty();
        Self {
            is_compatible,
            total_cost_usd,
            estimated_peak_watts,
            recommended_psu_watts,
            status_summary: status_summary.into(),
            warnings,
            errors,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameBenchmark {
    pub game_name: String,
    pub resolution_width: i32,
    pub resolution_height: i32,
    pub avg_fps: i32,
    pub low_1pct_fps: i32,
    pub cpu_bottleneck_pct: i32,
    pub gpu_bottleneck_pct: i32,
    pub quality_preset: String,
}

impl GameBenchmark {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        game_name: impl Into<String>,
        resolution_width: i32,
        resolution_height: i32,
        avg_fps: i32,
        low_1pct_fps: i32,
        cpu_bottleneck_pct: i32,
        gpu_bottleneck_pct: i32,
        quality_preset: impl Into<String>,
    ) -> Self {
        Self {
            game_name: game_name.into(),
            resolution_width,
            resolution_height,
            avg_fps,
            low_1pct_fps,
            cpu_bottleneck_pct,
            gpu_bottleneck_pct,
            quality_preset: quality_preset.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PowerMetrics {
    pub idle_watts: i32,
    pub load_watts: i32,
    pub peak_watts: i32,
    pub transient_spike_watts: i32,
    pub recommended_psu_watts: i32,
    pub efficiency_pct: i32,
    pub annual_cost_kwh: i32,
}

impl PowerMetrics {
    pub fn new(
        idle_watts: i32,
        load_watts: i32,
        peak_watts: i32,
        transient_spike_watts: i32,
        recommended_psu_watts: i32,
        efficiency_pct: i32,
        annual_cost_kwh: i32,
    ) -> Self {
        Self {
            idle_watts,
            load_watts,
            peak_watts,
            transient_spike_watts,
            recommended_psu_watts,
            efficiency_pct,
            annual_cost_kwh,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThermalMetrics {
    pub cpu_idle_temp_c: i32,
    pub cpu_load_temp_c: i32,
    pub gpu_idle_temp_c: i32,
    pub gpu_load_temp_c: i32,
    pub noise_decibels_idle: i32,
    pub noise_decibels_load: i32,
    pub thermal_throttling: bool,
}

impl ThermalMetrics {
    pub fn new(
        cpu_idle_temp_c: i32,
        cpu_load_temp_c: i32,
        gpu_idle_temp_c: i32,
        gpu_load_temp_c: i32,
        noise_decibels_idle: i32,
        noise_decibels_load: i32,
        thermal_throttling: bool,
    ) -> Self {
        Self {
            cpu_idle_temp_c,
            cpu_load_temp_c,
            gpu_idle_temp_c,
            gpu_load_temp_c,
            noise_decibels_idle,
            noise_decibels_load,
            thermal_throttling,
        }
    }
}
