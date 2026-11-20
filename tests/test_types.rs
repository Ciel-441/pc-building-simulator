use pc_build_sim::types::{
    Component, ComponentKind, CoolerType, FormFactor, MemoryType, SocketType,
};

#[test]
fn test_component_creation_and_properties() {
    let cpu = Component::new(
        "cpu_7800x3d",
        "Ryzen 7 7800X3D",
        "AMD",
        ComponentKind::Processor,
        449,
        120,
        SocketType::Am5,
        MemoryType::Ddr5,
        FormFactor::Atx,
        CoolerType::Air,
        0,
        0,
        0,
        8,
        4200,
        5000,
        0,
        6000,
        0,
        "stealth",
        "am5_single_ccd",
        false,
        "8C/16T 3D V-Cache",
    );

    assert_eq!(cpu.name, "Ryzen 7 7800X3D");
    assert_eq!(cpu.price_usd, 449);
    assert_eq!(cpu.tdp_watts, 120);
    assert_eq!(cpu.core_count, 8);
    assert_eq!(cpu.socket, SocketType::Am5);
    assert_eq!(cpu.visual_style, "am5_single_ccd");
}
