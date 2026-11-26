use pc_build_sim::router::{dispatch_request, extract_query_param};

#[test]
fn test_router_dispatch() {
    assert_eq!(
        extract_query_param("/api/games/online?query=elden%20ring&resolution=1440p", "query").as_deref(),
        Some("elden ring"),
        "Percent-encoded query params decode properly"
    );
    // -------------------------------------------------------------
    // Test 0: Spatial 3D Web UI Root Dispatch
    // -------------------------------------------------------------
    let res_ui = dispatch_request("GET", "/", "");
    assert_eq!(res_ui.status_code, 200, "UI Root status 200");
    assert_eq!(res_ui.content_type, "text/html; charset=utf-8", "UI Content-Type HTML");
    assert!(res_ui.body.len() > 5000, "UI Root payload contains full SPA");

    // -------------------------------------------------------------
    // Test 1: Health probe
    // -------------------------------------------------------------
    let res_health = dispatch_request("GET", "/health", "");
    assert_eq!(res_health.status_code, 200, "Health status 200");

    // -------------------------------------------------------------
    // Test 2: Component Catalog API
    // -------------------------------------------------------------
    let res_catalog = dispatch_request("GET", "/api/components", "");
    assert_eq!(res_catalog.status_code, 200, "Catalog status 200");
    assert!(res_catalog.body.len() > 2000, "Catalog payload contains verified JSON components");

    // -------------------------------------------------------------
    // Test 3: Compatibility Verification API
    // -------------------------------------------------------------
    let payload_verify = r#"{"cpu":"cpu_7800x3d","motherboard":"mb_b650e","gpu":"gpu_rtx_4090"}"#;
    let res_verify = dispatch_request("POST", "/api/verify", payload_verify);
    assert_eq!(res_verify.status_code, 200, "Verify status 200");
    assert!(res_verify.body.len() > 50, "Verification JSON returned");

    // -------------------------------------------------------------
    // Test 4: Game Benchmarks Simulation API
    // -------------------------------------------------------------
    let payload_bench = r#"{"cpu":"cpu_7800x3d","gpu":"gpu_rtx_4090","resolution":"4k"}"#;
    let res_bench = dispatch_request("POST", "/api/benchmark", payload_bench);
    assert_eq!(res_bench.status_code, 200, "Benchmark status 200");
    assert!(res_bench.body.len() > 100, "Benchmark JSON results returned");

    // -------------------------------------------------------------
    // Test 5: Live Steam Store Online Game Fetcher
    // -------------------------------------------------------------
    let res_online = dispatch_request("GET", "/api/games/online?query=sons+of+the+forest&resolution=1440p&gpu=gpu_rtx_4080s", "");
    assert_eq!(res_online.status_code, 200, "Online steam search status 200");
    assert_eq!(res_online.content_type, "application/json");
}
