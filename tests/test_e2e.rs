use pc_build_sim::benchmark_engine::simulate_benchmarks;
use pc_build_sim::compatibility::verify_compatibility;
use pc_build_sim::hardware_db::get_component_by_id;
use pc_build_sim::power_thermal::{calculate_power_metrics, calculate_thermal_metrics};
use pc_build_sim::router::dispatch_request;
use pc_build_sim::types::BuildConfiguration;

#[test]
fn test_end_to_end_system_pipeline() {
    // -------------------------------------------------------------
    // Step 1: Full System Assembly & Compatibility Verification
    // -------------------------------------------------------------
    let mut build = BuildConfiguration::new();
    build.cpu = get_component_by_id("cpu_7800x3d");
    build.motherboard = get_component_by_id("mb_b650e");
    build.gpu = get_component_by_id("gpu_rtx_4090");
    build.memory = get_component_by_id("ram_trident_32gb");
    build.storage = get_component_by_id("ssd_samsung_990pro");
    build.cooler = get_component_by_id("cooler_arctic_360");
    build.psu = get_component_by_id("psu_seasonic_1000w");
    build.chassis = get_component_by_id("case_o11_evo");

    let comp = verify_compatibility(&build);
    assert!(comp.is_compatible, "Flagship system configuration is fully compatible");
    assert_eq!(comp.errors.len(), 0, "No compatibility errors in flagship build");
    assert!(comp.total_cost_usd > 3000, "Flagship MSRP is authentic");

    // -------------------------------------------------------------
    // Step 2: Power and Thermal Telemetry Verification
    // -------------------------------------------------------------
    let pwr = calculate_power_metrics(&build);
    assert!(pwr.peak_watts > 600, "Peak wattage accounts for 7800X3D + RTX 4090");
    assert!(pwr.transient_spike_watts >= 800, "Transient spike protection modeled");
    assert!(pwr.recommended_psu_watts >= 1000, "1000W recommended PSU rating");

    let therm = calculate_thermal_metrics(&build);
    assert!(therm.cpu_load_temp_c >= 45 && therm.cpu_load_temp_c <= 75, "Liquid 360mm cools 7800X3D within normal envelope");
    assert!(therm.gpu_load_temp_c >= 55 && therm.gpu_load_temp_c <= 75, "RTX 4090 triple-fan load temperature verified");
    assert!(!therm.thermal_throttling, "No thermal throttling with 360mm AIO in O11 Dynamic");

    // -------------------------------------------------------------
    // Step 3: Game Benchmark Matrix Verification
    // -------------------------------------------------------------
    let bench = simulate_benchmarks(&build, "4k");
    assert_eq!(bench.len(), 24, "All 24 AAA and esports gaming benchmark simulations calculated");

    let cp2077 = &bench[0];
    assert!(cp2077.avg_fps >= 70, "RTX 4090 4K Cyberpunk 2077 benchmark verified");
    assert!(cp2077.low_1pct_fps >= 50, "Cyberpunk 1% lows verified");

    // -------------------------------------------------------------
    // Step 4: Router End-to-End HTTP Wire Simulation
    // -------------------------------------------------------------
    let res_root = dispatch_request("GET", "/", "");
    assert_eq!(res_root.status_code, 200);

    let res_verify = dispatch_request(
        "POST",
        "/api/verify",
        r#"{"cpu":"cpu_7800x3d","motherboard":"mb_b650e","gpu":"gpu_rtx_4090","psu":"psu_seasonic_1000w"}"#,
    );
    assert_eq!(res_verify.status_code, 200);
}
