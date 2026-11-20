# Virtual PC Building Simulator & Test Bench

A high-fidelity **Virtual PC Building Simulator and Hardware Test Bench** engineered with a dual-stack **Rust Core** and **TypeScript / WebGL 3D Workstation**. Features real-world component specifications sourced from **BuildCores** and **Corsair PC Builder**, authentic component clearances, ATX 3.0 transient power modeling, thermodynamic dissipation curves, and verified AAA gaming benchmarks.

---

## Architecture Overview

The system is constructed with strict separation of concerns, zero emojis, and dual runtime support (Native Rust Server or Standalone Web Client):

```
                               +---------------------------------------+
                               |     Spatial 3D WebGL Workstation      |
                               |   Three.js + TypeScript Client UI     |
                               +-------------------+-------------------+
                                                   |
                                       Wire REST API / Client Engine
                                                   |
                               +-------------------v-------------------+
                               |         src/router.rs (Rust)          |
                               |       web/server.ts (TypeScript)      |
                               +-------------------+-------------------+
                                                   |
          +--------------------+-------------------+--------------------+--------------------+
          |                    |                   |                    |                    |
 +--------v---------+ +--------v--------+ +--------v---------+ +--------v--------+ +---------v-------+
 |   hardware_db    | |  compatibility  | |  power_thermal   | | benchmark_eng   | |     main        |
 | 30+ Verified     | | Socket, Memory, | | ATX 3.0 Spikes,  | | 6 AAA Titles,   | | Multi-threaded  |
 | BuildCores Parts | | Clearances      | | Radiator Deltas  | | 4K/1440p/1080p  | | Socket Listener |
 +------------------+ +-----------------+ +------------------+ +-----------------+ +-----------------+
```

---

## Key Features

### 1. Spatial 3D Hardware Workstation
- **Interactive Three.js WebGL Viewport:** 360-degree orbital rotation, pan, zoom, and component inspection.
- **Differentiated 3D Hardware Models:**
  - **GPUs:** Distinct Founders Edition hourglass dual-axial flow-through vs. ASUS ROG Strix 3.5-slot triple axial-tech fans vs. AMD Radeon reference.
  - **Coolers:** Corsair iCUE LINK / H150i AIO with illuminated pump display, braided swivel hoses, and 360mm top radiator; Noctua NH-D15 twin-tower air cooler with copper heatpipes.
  - **Motherboards:** ATX and Mini-ITX form factors with reinforced PCIe 5.0 stainless steel SafeSlots, M.2 thermal shields, and brushed VRM heatsinks.
  - **Memory:** Corsair Dominator Titanium die-cast aluminum heatspreaders with illuminated top light bars.
  - **Chassis:** Tempered glass side panel toggle, PSU shroud, and cable routing grommets.
- **Inspection Tools:**
  - **Thermal Infrared Heatmap Mode:** Renders visual heat distribution across components based on simulated die temperatures.
  - **Exploded View Mode:** Smooth mechanical separation along axes to inspect clearance envelopes.
  - **Wireframe Mode:** Structural CAD wireframe inspection.
  - **100% Stress Test Simulation:** Spins fans up to maximum RPM and ramps thermal curves in real time.

### 2. Verified Hardware Catalog (BuildCores & Corsair Specs)
Over 30 authentic retail components with exact MSRP, TDPs, clock speeds, dimensions, and visual colorways:
- **Processors:** AMD Ryzen 9 7950X3D, Ryzen 7 7800X3D, Intel Core i9-14900KS, i9-14900K, i7-14700K, i5-14600K, Ryzen 5 7600X, Ryzen 7 5800X3D (AM4).
- **Graphics Cards:** NVIDIA GeForce RTX 4090 Founders Edition ($1599), ASUS ROG Strix RTX 4090 ($1999), RTX 4080 Super ($999), MSI Gaming X Slim RTX 4070 Ti Super ($849), RTX 4070 Super ($599), RTX 4060 ($299), AMD Radeon RX 7900 XTX ($949), Sapphire NITRO+ RX 7900 XT ($749), PowerColor Hellhound RX 7800 XT ($499).
- **Motherboards:** ASUS ROG Maximus Z790 Dark Hero, ROG Strix B650E-E, Gigabyte X670E AORUS Master, MSI MAG B650 Tomahawk, MSI MPG B760I Edge Mini-ITX, MSI MAG B650M Mortar mATX.
- **Cooling:** Corsair iCUE LINK TITAN 360 RX RGB, Corsair iCUE H150i Elite LCD XT, NZXT Kraken Elite 360, Arctic Liquid Freezer III 360, Noctua NH-D15 chromax.black, Corsair A115 Twin Tower, Thermalright Peerless Assassin 120 SE.
- **Memory:** Corsair Dominator Titanium RGB 64GB DDR5-6000 CL30, Corsair Vengeance RGB 32GB DDR5-6000, G.Skill Trident Z5 RGB 32GB, Corsair Vengeance 32GB low profile.
- **Storage:** Corsair MP700 PRO Gen5 4TB (12,400 MB/s), Samsung 990 PRO 2TB NVMe with Heatsink, Crucial T700 Gen5 2TB, WD_BLACK SN850X 2TB.
- **Power Supplies:** Corsair RM1000x Shift ATX 3.0 (side cable modular), Corsair HX1500i Platinum, Seasonic Vertex GX-1000, Corsair RM750e, be quiet! Straight Power 12 1200W.
- **Chassis:** Corsair 5000D AIRFLOW, Corsair 4000D AIRFLOW, Lian Li O11 Dynamic EVO, Fractal Design North (Walnut), Fractal Design Terra (Mini-ITX SFF).

### 3. Electrical & Mechanical Compatibility Rules
- **Socket Alignment:** Validates AMD AM5, Intel LGA1700, and AMD AM4 socket pairings.
- **Memory Standard:** Enforces DDR5 vs DDR4 matching across motherboard and RAM.
- **Form Factor Clearance:** Prevents ATX / Micro-ATX motherboards from being installed into Mini-ITX cases (e.g. Fractal Terra).
- **Physical Dimensions:**
  - GPU card length vs chassis maximum GPU clearance.
  - CPU air cooler height vs chassis side panel clearance (e.g. Noctua NH-D15 at 168mm vs Fractal Terra at 77mm).
- **Power Headroom:** Evaluates peak wattage against continuous PSU output and ATX 3.0 transient spike thresholds.

### 4. Thermodynamic & Acoustics Simulation
- **Power Draw Equations:** Idle, gaming load, and 100% stress peak calculations with ATX 3.0 transient excursions (+35% GPU spikes).
- **Die Junction Equilibrium:**
  $$\Delta T_{\text{die}} = \frac{\text{TDP}_{\text{cpu}} \times 17}{100}, \quad \Delta T_{\text{rad}} = \frac{\text{TDP}_{\text{cpu}} \times 20}{\text{CoolerCapacity}}$$
- **Acoustic Profiling:** Dynamic fan curves modeling idle whisper (24 dBA) to high load (36-40 dBA) and thermal throttle ramp (48 dBA).

### 5. Verified AAA Gaming Benchmarks
Simulates authentic resolution-scaled frame rates, 1% lows, and hardware bottleneck percentages across 6 major titles:
- Cyberpunk 2077 (Ray Tracing Ultra)
- Black Myth: Wukong (Cinematic TSR)
- Counter-Strike 2 (Competitive Max)
- Red Dead Redemption 2 (Ultra)
- Shadow of the Tomb Raider (Highest Preset)
- Hogwarts Legacy (Ultra Ray Tracing)

---

## Directory Structure

```
├── src/                        # Rust Core Implementation
│   ├── types.rs                # Domain structs, enums, serialization
│   ├── hardware_db.rs          # 30+ verified components (BuildCores / Corsair)
│   ├── compatibility.rs        # Clearance & electrical validation rules
│   ├── power_thermal.rs        # Thermodynamic equations & ATX 3.0 power
│   ├── benchmark_engine.rs     # 6 AAA gaming bottleneck models
│   ├── frontend_assets.rs      # Embedded WebGL 3D Workstation SPA
│   ├── router.rs               # REST API dispatcher & JSON endpoints
│   ├── lib.rs                  # Rust library crate
│   └── main.rs                 # Native multi-threaded HTTP server
├── tests/                      # Rust Integration Test Suite
│   ├── test_types.rs
│   ├── test_hardware_db.rs
│   ├── test_compatibility.rs
│   ├── test_power_thermal.rs
│   ├── test_benchmark_engine.rs
│   ├── test_router.rs
│   ├── test_frontend.rs
│   └── test_e2e.rs
├── web/                        # TypeScript Implementation
│   ├── index.html              # Standalone WebGL 3D Workstation
│   ├── server.ts               # Node.js HTTP server
│   └── src/
│       ├── types.ts            # TypeScript interfaces & types
│       ├── hardwareDb.ts       # TypeScript components catalog
│       ├── compatibility.ts    # Compatibility logic in TypeScript
│       ├── powerThermal.ts     # Thermodynamic formulas in TypeScript
│       ├── benchmarkEngine.ts  # Benchmark simulations in TypeScript
│       └── index.ts            # TypeScript barrel exports
├── tests-ts/                   # TypeScript Test Suite (node:test)
│   ├── compatibility.test.ts
│   ├── powerThermal.test.ts
│   ├── benchmarkEngine.test.ts
│   └── e2e.test.ts
├── Cargo.toml                  # Rust crate configuration
├── package.json                # TypeScript & Node configuration
└── tsconfig.json               # TypeScript strict configuration
```

---

## Build & Test Instructions

### Running the Rust Native Server

```bash
# Run all Rust tests
cargo test

# Build optimized release binary
cargo build --release

# Start the simulator server (default port 8080)
cargo run --release -- --port 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Running the TypeScript Client & Server

```bash
# Install dependencies
npm install

# Type-check and compile TypeScript
npm run build

# Run all TypeScript tests
npm test

# Start the TypeScript server
npm start
```
Open [http://localhost:8080](http://localhost:8080) or open `web/index.html` directly in any web browser for zero-server client execution.
