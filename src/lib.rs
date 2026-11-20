pub mod benchmark_engine;
pub mod compatibility;
pub mod frontend_assets;
pub mod hardware_db;
pub mod power_thermal;
pub mod router;
pub mod types;

pub use benchmark_engine::simulate_benchmarks;
pub use compatibility::verify_compatibility;
pub use frontend_assets::get_spa_html;
pub use hardware_db::{filter_by_kind, get_all_components, get_component_by_id};
pub use power_thermal::{calculate_power_metrics, calculate_thermal_metrics};
pub use router::{dispatch_request, parse_build_from_json, HttpResponse};
pub use types::*;
