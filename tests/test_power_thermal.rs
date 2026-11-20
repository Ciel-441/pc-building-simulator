use pc_build_sim::hardware_db::get_component_by_id;
use pc_build_sim::power_thermal::{calculate_power_metrics, calculate_thermal_metrics};
use pc_build_sim::types::BuildConfiguration;

#[test]
fn test_power_and_thermal_simulation() {
    // -------------------------------------------------------------
    // Test 1: Heavy Flagship Load (14900K + RTX 4090 FE + 360mm AIO)
    // -------------------------------------------------------------
    let mut flagship_build = BuildConfiguration::new();
    flagship_build.cpu = get_component_by_id("cpu_14900k");
    flagship_build.gpu = get_component_by_id("gpu_rtx_4090_fe");
    flagship_build.motherboard = get_component_by_id("mb_z790");
    flagship_build.memory = get_component_by_id("ram_dominator_64gb");
    flagship_build.storage = get_component_by_id("ssd_crucial_t700");
    flagship_build.cooler = get_component_by_id("cooler_arctic_360");
    flagship_build.psu = get_component_by_id("psu_seasonic_1000w");
    flagship_build.chassis = get_component_by_id("case_o11_evo");

    let pwr1 = calculate_power_metrics(&flagship_build);
    assert!(pwr1.idle_watts >= 40 && pwr1.idle_watts <= 75, "Realistic idle wattage");
    assert!(pwr1.load_watts >= 550 && pwr1.load_watts <= 720, "Realistic gaming load wattage");
    assert!(pwr1.peak_watts >= 750 && pwr1.peak_watts <= 860, "Realistic 100% stress peak wattage");
    assert!(pwr1.transient_spike_watts >= 950, "ATX 3.0 transient spike calculation");
    assert!(pwr1.recommended_psu_watts >= 1000, "Recommended PSU >= 1000W");

    let therm1 = calculate_thermal_metrics(&flagship_build);
    assert!(therm1.cpu_idle_temp_c >= 30 && therm1.cpu_idle_temp_c <= 42, "Normal CPU idle temp");
    assert!(therm1.cpu_load_temp_c >= 75 && therm1.cpu_load_temp_c <= 88, "Liquid Freezer III keeps 14900K under 88C");
    assert!(therm1.gpu_load_temp_c >= 60 && therm1.gpu_load_temp_c <= 72, "RTX 4090 cooler keeps GPU under 72C");
    assert!(!therm1.thermal_throttling, "No thermal throttling with 360mm AIO");

    // -------------------------------------------------------------
    // Test 2: Thermal Throttling Scenario (14900K 253W with no cooler)
    // -------------------------------------------------------------
    let mut uncooled_build = BuildConfiguration::new();
    uncooled_build.cpu = get_component_by_id("cpu_14900k");
    let therm2 = calculate_thermal_metrics(&uncooled_build);
    assert!(therm2.thermal_throttling, "Uncooled 14900K triggers thermal throttling");
    assert!(therm2.cpu_load_temp_c >= 100, "CPU hits 100C junction ceiling");
}
