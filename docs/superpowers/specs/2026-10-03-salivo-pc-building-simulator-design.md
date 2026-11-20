# Architecture Specification: High-Fidelity PC Building Simulator

## 1. System Vision & Overview

This system is an engineering-grade, 3D interactive PC Building Simulator and Virtual Test Bench built 100% natively on **Salivo**. The platform pairs a high-performance native Salivo server and physics/benchmark calculation engine with a spatial, minimalist monochrome (black & white) 3D web workstation.

### Core Objectives:
1. **100% Salivo Foundation**: The backend HTTP daemon, socket layer, routing, database model, compatibility engine, and benchmark simulation are coded entirely in idiomatic Salivo adhering to language laws (stream imports `><`, PascalCase types, zero underscores in types, flexible camelCase fields, and postfix `?` propagation).
2. **Spatial Minimalist UI**: An obsidian-and-monochrome interface featuring floating spatial glass HUD panels, real-time 3D component rendering (CPU, GPU, Motherboard, RAM, Cooler, PSU, Storage, Chassis), full 360-degree orbital rotation, component inspection mode, and slot-snapping visualization.
3. **Verified Benchmark & Telemetry Engine**: No dummy or fabricated values. The engine computes verified framerates across 1080p, 1440p, and 4K resolutions for real games (Cyberpunk 2077, Black Myth: Wukong, CS2, Red Dead Redemption 2, Shadow of the Tomb Raider) with CPU/GPU bottleneck analysis, peak transient power modeling, and thermal delta calculations.
4. **Zero Emoji Standard**: Strictly no emojis are used anywhere in the UI, text, logs, or codebase. Clean typographic indicators and geometric SVG glyphs are used exclusively.

---

## 2. Salivo Backend Architecture

### 2.1 Package & Module Structure
The project is structured as an SPM package:
```
d:\pc build sim/
├── salivo.toml                    # Package manifest & dependencies
├── src/
│   ├── main.sal                   # Server entrypoint and CLI bootstrap
│   ├── types.sal                  # PascalCase domain structs & enums
│   ├── hardware_db.sal            # Verified component database (specs, TDP, MSRP)
│   ├── compatibility.sal          # Strict rule-based compatibility validator
│   ├── benchmark_engine.sal       # Game framerate & bottleneck simulation
│   ├── power_thermal.sal          # Load, transient spikes, and thermal models
│   ├── router.sal                 # HTTP/1.1 request dispatcher & JSON serializer
│   └── frontend_bundle.sal        # Embedded spatial UI web application
├── tests/
│   ├── test_compatibility.sal     # Unit tests for socket, clearance, and RAM rules
│   ├── test_benchmarks.sal        # Unit tests for FPS calculation & bottleneck logic
│   └── test_power.sal             # Unit tests for wattage, efficiency, and thermals
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

### 2.2 Domain Models (`src/types.sal`)
All types strictly respect the Zero-Underscore law:
```salivo
module app.domain.types;

pub enum ComponentKind {
    Processor,
    GraphicsCard,
    Motherboard,
    Memory,
    Storage,
    PowerSupply,
    Cooler,
    Chassis,
}

pub enum SocketType {
    Am5,
    Lga1700,
    Am4,
}

pub enum MemoryType {
    Ddr5,
    Ddr4,
}

pub enum FormFactor {
    Atx,
    MicroAtx,
    MiniItx,
}

pub enum CoolerType {
    Air,
    LiquidAio240,
    LiquidAio360,
}

pub struct Component {
    string id;
    string name;
    string brand;
    ComponentKind kind;
    int priceUsd;
    int tdpWatts;
    SocketType socket;
    MemoryType memType;
    FormFactor formFactor;
    CoolerType coolerType;
    int lengthMm;
    int heightMm;
    int psuWattage;
    int coreCount;
    int baseClockMhz;
    int boostClockMhz;
    int vramGb;
    int memorySpeedMhz;
    int capacityGb;
}

pub struct CompatibilityReport {
    bool isCompatible;
    int totalCostUsd;
    int estimatedPeakWatts;
    int recommendedPsuWatts;
    string statusSummary;
    Vec<string> warnings;
    Vec<string> errors;
}

pub struct GameBenchmark {
    string gameName;
    int resolutionWidth;
    int resolutionHeight;
    int avgFps;
    int low1PctFps;
    int cpuBottleneckPct;
    int gpuBottleneckPct;
    string qualityPreset;
}
```

---

## 3. Verified Hardware Catalog Specifications

All components use verified data from technical specifications and verified real-world hardware reviews:

| Category | Component Model | Key Specs | TDP | MSRP |
| :--- | :--- | :--- | :--- | :--- |
| **CPU** | AMD Ryzen 7 7800X3D | 8C/16T, 4.2-5.0 GHz, 96MB 3D V-Cache, AM5, DDR5 | 120W | $449 |
| **CPU** | Intel Core i9-14900K | 24C/32T (8P+16E), 3.2-6.0 GHz, LGA1700, DDR5/DDR4 | 253W | $549 |
| **CPU** | AMD Ryzen 5 7600X | 6C/12T, 4.7-5.3 GHz, 32MB L3, AM5, DDR5 | 105W | $229 |
| **CPU** | Intel Core i5-14600K | 14C/20T (6P+8E), 3.5-5.3 GHz, LGA1700, DDR5/DDR4 | 181W | $319 |
| **GPU** | NVIDIA GeForce RTX 4090 | 24GB GDDR6X, 16384 CUDA, 384-bit, 304mm Length | 450W | $1599 |
| **GPU** | NVIDIA GeForce RTX 4080 Super | 16GB GDDR6X, 10240 CUDA, 256-bit, 304mm Length | 320W | $999 |
| **GPU** | NVIDIA GeForce RTX 4070 Super | 12GB GDDR6X, 7168 CUDA, 192-bit, 242mm Length | 220W | $599 |
| **GPU** | AMD Radeon RX 7900 XTX | 24GB GDDR6, 6144 SP, 384-bit, 287mm Length | 355W | $949 |
| **GPU** | NVIDIA GeForce RTX 4060 | 8GB GDDR6, 3072 CUDA, 128-bit, 210mm Length | 115W | $299 |
| **Motherboard** | ASUS ROG Strix B650E-E Gaming | Socket AM5, DDR5, ATX, PCIe 5.0 x16, 4x M.2 | 50W | $349 |
| **Motherboard** | ASUS ROG Maximus Z790 Hero | Socket LGA1700, DDR5, ATX, PCIe 5.0 x16, 5x M.2 | 60W | $599 |
| **RAM** | G.Skill Trident Z5 RGB 32GB (2x16GB) | DDR5-6000 CL30-38-38-96, 1.35V, Low-latency EXPO/XMP | 15W | $119 |
| **RAM** | Corsair Vengeance 32GB (2x16GB) | DDR5-5600 CL36, 1.25V | 12W | $99 |
| **Cooler** | Noctua NH-D15 G2 | Twin-tower air cooler, 2x 140mm fans, 168mm Height, 250W TDP cap | 8W | $149 |
| **Cooler** | Arctic Liquid Freezer III 360 | 360mm AIO liquid cooler, 3x 120mm fans, 38mm thick rad, 350W TDP cap | 15W | $110 |
| **Storage** | Samsung 990 Pro 2TB | PCIe 4.0 NVMe M.2 SSD, 7450 MB/s Read, 6900 MB/s Write | 8W | $179 |
| **PSU** | Seasonic Vertex GX-1000 | 1000W, ATX 3.0, PCIe 5.0 12VHPWR, 80-Plus Gold, Full Modular | - | $199 |
| **PSU** | Corsair RM750e | 750W, ATX 3.0, PCIe 5.0, 80-Plus Gold, Full Modular | - | $99 |
| **Chassis** | Lian Li O11 Dynamic EVO | Dual chamber ATX, Max GPU 426mm, Max Cooler 167mm, 360mm Rad top/side | - | $159 |
| **Chassis** | Fractal Design North | Mid-tower ATX, Real walnut/oak front, Max GPU 355mm, Max Cooler 170mm | - | $139 |

---

## 4. Verified Gaming Performance Model

The benchmark simulation produces verified framerates based on hardware compute capability and published benchmark datasets across 1080p, 1440p, and 4K resolutions:

### Tested Real Titles:
1. **Cyberpunk 2077** (Ray Tracing Ultra Preset & Raster Ultra)
2. **Black Myth: Wukong** (Cinematic Preset, TSR 100%)
3. **Counter-Strike 2** (Competitive High/Very High Preset)
4. **Red Dead Redemption 2** (Ultra Preset)
5. **Shadow of the Tomb Raider** (Highest Preset)
6. **Hogwarts Legacy** (Ultra Preset)

### Resolution Scaling and Bottleneck Formulations:
- At 1080p: Framerates are heavily influenced by CPU single-core IPC and memory subsystem latency.
- At 1440p: Balanced CPU/GPU load distribution.
- At 4K: Primary bottleneck shifts almost entirely (85-95%) to GPU shader array and VRAM bandwidth.
- Low 1% framerates account for CPU cache hierarchy (e.g. 3D V-Cache delivers 25-35% higher 1% lows compared to standard chips).

---

## 5. Spatial Web Interface & 3D Interactive Viewport

### 5.1 Aesthetics & Styling
- **Color Scheme**: Strict monochrome luxury dark palette:
  - Deep space base: `#050507`
  - Elevated surfaces: `#0c0d10`, `#14151a`
  - Subtle borders: `#22242c`, `#30333d`
  - Text & Accents: `#ffffff`, `#e4e4e7`, `#a1a1aa`, `#71717a`
- **Spatial UI Layout**:
  - Center: Full 3D canvas viewport rendering the test bench and components with high-fidelity PBR metallic surfaces, ambient lighting, shadows, and wireframe toggle.
  - Left / Top HUD: Telemetry display (Live Wattage, Est. Cost, Thermal Index, Compatibility Badge).
  - Right Workstation Dock: Categorized hardware selector with verified spec badges, dimension counters, and "Slot to Bench" / "Inspect 3D" actions.
  - Bottom Spatial Tray: Testing & Gaming Benchmark suite with resolution selector (1080p, 1440p, 4K), game tabs, FPS graph, and bottleneck gauge.
- **3D Components**:
  - Real-time procedural 3D models with geometry representing:
    - GPU: Dual/triple axial fans that animate, heatsink fin stack, backplate with cutouts, PCIe bracket, gold edge connector.
    - CPU: Heatspreader with metallic bevel and laser-etched markings, PCB substrate, gold contact array.
    - Motherboard: ATX PCB trace styling, AM5/LGA socket with retention bracket, 4 DDR5 DIMM slots, reinforced PCIe slots, VRM heatsinks, rear I/O shield.
    - RAM: Aluminum heat spreader with geometric pattern and DDR5 notch.
    - Cooler: Dual tower fin arrays with center fan and copper heatpipe ends; or 360mm AIO with braided hoses and circular pump block.
    - PSU: Matte black casing with modular socket grid and fan intake grill.
    - Chassis: Frame with motherboard tray, cable grommets, and toggleable tempered glass panel.
- **Controls**:
  - Left click + drag: Orbit 360 degrees
  - Right click + drag: Pan workstation
  - Scroll: Zoom in/out
  - Double click component: Focus and inspect in isolation
- **Zero Emojis**: Every indicator uses clean SVG iconography, status dots, or typographic badges (e.g. `[PASSED]`, `[VERIFIED]`, `1080P`, `1440P`, `4K`).
