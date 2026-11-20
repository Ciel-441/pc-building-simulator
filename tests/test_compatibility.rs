use pc_build_sim::compatibility::verify_compatibility;
use pc_build_sim::hardware_db::get_component_by_id;
use pc_build_sim::types::BuildConfiguration;

#[test]
fn test_compatibility_engine() {
    // -------------------------------------------------------------
    // Test 1: Verified Clean, High-End AM5 System (Zero errors)
    // -------------------------------------------------------------
    let mut good_build = BuildConfiguration::new();
    good_build.cpu = get_component_by_id("cpu_7800x3d");
    good_build.motherboard = get_component_by_id("mb_b650e");
    good_build.memory = get_component_by_id("ram_trident_32gb");
    good_build.gpu = get_component_by_id("gpu_rtx_4080s");
    good_build.psu = get_component_by_id("psu_seasonic_1000w");
    good_build.chassis = get_component_by_id("case_o11_evo");
    good_build.cooler = get_component_by_id("cooler_arctic_360");
    good_build.storage = get_component_by_id("ssd_samsung_990pro");

    let rep1 = verify_compatibility(&good_build);
    assert!(rep1.is_compatible, "AM5 build is compatible");
    assert_eq!(rep1.errors.len(), 0, "No compatibility errors in valid build");
    assert!(rep1.total_cost_usd > 2500, "Accurate total system MSRP calculated");
    assert!(rep1.estimated_peak_watts > 500, "Peak wattage calculated");

    // -------------------------------------------------------------
    // Test 2: Incompatible Socket (AM5 7800X3D + LGA1700 Z790 Motherboard)
    // -------------------------------------------------------------
    let mut bad_socket_build = BuildConfiguration::new();
    bad_socket_build.cpu = get_component_by_id("cpu_7800x3d");
    bad_socket_build.motherboard = get_component_by_id("mb_z790");
    bad_socket_build.chassis = get_component_by_id("case_o11_evo");

    let rep2 = verify_compatibility(&bad_socket_build);
    assert!(!rep2.is_compatible, "Socket mismatch is not compatible");
    assert!(rep2.errors.len() >= 1, "Socket error generated");

    // -------------------------------------------------------------
    // Test 3: Cooler Clearance Violation (Air cooler height exceeds Terra chassis)
    // -------------------------------------------------------------
    let mut bad_clearance_build = BuildConfiguration::new();
    bad_clearance_build.cpu = get_component_by_id("cpu_14900k");
    bad_clearance_build.motherboard = get_component_by_id("mb_b760_itx");
    bad_clearance_build.cooler = get_component_by_id("cooler_nh_d15"); // 168mm tall
    bad_clearance_build.chassis = get_component_by_id("case_terra");   // 77mm max cooler height

    let rep3 = verify_compatibility(&bad_clearance_build);
    assert!(!rep3.is_compatible, "Cooler clearance violation caught");
    assert!(rep3.errors.len() >= 1, "Cooler height error recorded");
}
