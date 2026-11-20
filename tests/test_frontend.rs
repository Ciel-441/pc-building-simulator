use pc_build_sim::frontend_assets::get_spa_html;

#[test]
fn test_frontend_spa_bundle() {
    let html = get_spa_html();
    assert!(html.len() > 5000, "SPA markup contains full spatial 3D client code");

    // Zero-emoji verification across entire frontend bundle
    assert!(!html.contains("🚀"), "No rocket emoji");
    assert!(!html.contains("🔥"), "No fire emoji");
    assert!(!html.contains("💻"), "No laptop emoji");
    assert!(!html.contains("⚡"), "No zap emoji");
    assert!(!html.contains("🎮"), "No game emoji");
    assert!(!html.contains("✅"), "No checkmark emoji");
    assert!(!html.contains("❌"), "No cross emoji");

    // Verify Three.js 3D viewport canvas
    assert!(html.contains("three.min.js"), "Includes Three.js 3D engine");
    assert!(html.contains("workstation-sidebar"), "Contains workstation sidebar");
    assert!(html.contains("spatial-hud"), "Contains spatial HUD");
    assert!(html.contains("benchmark-tray"), "Contains gaming benchmark tray");
}
