use pc_build_sim::benchmark_engine::simulate_benchmarks;
use pc_build_sim::hardware_db::get_component_by_id;
use pc_build_sim::types::BuildConfiguration;

#[test]
fn test_gaming_benchmark_engine() {
    let mut build = BuildConfiguration::new();
    build.cpu = get_component_by_id("cpu_7800x3d");
    build.gpu = get_component_by_id("gpu_rtx_4090");
    build.memory = get_component_by_id("ram_trident_32gb");
    build.cooler = get_component_by_id("cooler_arctic_360");
    build.motherboard = get_component_by_id("mb_b650e");
    build.psu = get_component_by_id("psu_seasonic_1000w");
    build.storage = get_component_by_id("ssd_samsung_990pro");
    build.chassis = get_component_by_id("case_o11_evo");

    // -------------------------------------------------------------
    // Test 1: 4K Ultra Gaming Benchmarks (GPU Bound)
    // -------------------------------------------------------------
    let b4k = simulate_benchmarks(&build, "4k");
    assert!(b4k.len() >= 6, "At least 6 verified game benchmarks at 4K");

    let cp4k = b4k.iter().find(|b| b.game_name == "Cyberpunk 2077").expect("Cyberpunk 2077 present");
    assert_eq!(cp4k.game_name, "Cyberpunk 2077");
    assert_eq!(cp4k.resolution_width, 3840);
    assert_eq!(cp4k.resolution_height, 2160);
    assert!(cp4k.avg_fps >= 75 && cp4k.avg_fps <= 95, "Verified 4K average FPS for 4090");
    assert!(cp4k.low_1pct_fps >= 55 && cp4k.low_1pct_fps <= 75, "Verified 4K 1% low FPS");
    assert!(cp4k.gpu_bottleneck_pct >= 85, "4K is heavily GPU bound (>=85%)");

    let sotf = b4k.iter().find(|b| b.game_name == "Sons of the Forest").expect("Sons of the Forest present");
    assert_eq!(sotf.resolution_width, 3840);
    assert!(sotf.avg_fps >= 80, "Sons of the Forest 4K benchmark verified");

    // -------------------------------------------------------------
    // Test 2: 1080p Competitive Gaming Benchmarks (CPU Bound & High Refresh)
    // -------------------------------------------------------------
    let b1080 = simulate_benchmarks(&build, "1080p");
    let cs2 = b1080.iter().find(|b| b.game_name == "Counter-Strike 2").expect("CS2 present");
    assert_eq!(cs2.game_name, "Counter-Strike 2");
    assert_eq!(cs2.resolution_width, 1920);
    assert!(cs2.avg_fps >= 500, "CS2 1080p averages over 500 FPS on 7800X3D");
    assert!(cs2.cpu_bottleneck_pct >= 50, "CS2 at 1080p is CPU bound (>=50%)");
}
