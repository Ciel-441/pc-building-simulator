use pc_build_sim::hardware_db::{filter_by_kind, get_all_components, get_component_by_id};
use pc_build_sim::types::ComponentKind;

#[test]
fn test_hardware_db_catalog() {
    let all = get_all_components();
    assert!(all.len() >= 30, "Catalog contains 30+ verified components from BuildCores & Corsair");

    let opt_fe = get_component_by_id("gpu_rtx_4090_fe");
    assert!(opt_fe.is_some(), "RTX 4090 FE found in database");
    let fe = opt_fe.unwrap();
    assert_eq!(fe.name, "GeForce RTX 4090 Founders Edition");
    assert_eq!(fe.tdp_watts, 450);
    assert_eq!(fe.price_usd, 1599);

    let opt_strix = get_component_by_id("gpu_rtx_4090");
    assert!(opt_strix.is_some(), "ROG Strix RTX 4090 found in database");

    let cpus = filter_by_kind(ComponentKind::Processor);
    assert!(cpus.len() >= 7, "At least 7 verified CPUs");

    let gpus = filter_by_kind(ComponentKind::GraphicsCard);
    assert!(gpus.len() >= 8, "At least 8 verified GPUs");
}
