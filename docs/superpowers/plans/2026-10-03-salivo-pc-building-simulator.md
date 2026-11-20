# High-Fidelity PC Building Simulator & Virtual Test Bench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade PC Building Simulator and Virtual Test Bench strictly on Salivo, featuring an obsidian monochrome spatial UI, real-time 3D rotating component models, an authentic compatibility engine, and verified gaming performance benchmarks across 1080p, 1440p, and 4K resolutions.

**Architecture:** The core application executes as a native Salivo daemon containing a domain type model, verified hardware database, socket/form-factor compatibility rules engine, thermal/power calculation model, and verified gaming benchmark simulator. An embedded HTTP dispatcher handles JSON API endpoints and serves a spatial WebGL/Three.js 3D viewport with interactive component manipulation, orbital camera controls, and a categorized workstation sidebar.

**Tech Stack:** Salivo 0.1.0, Salivo Standard Library (`salivo.std.core`, `salivo.std.net`, `salivo.std.io`, `salivo.std.strings`, `salivo.std.collections`, `salivo.std.math`, `salivo.std.result`), Three.js WebGL (served natively via Salivo), Minimalist Monochrome CSS.

**Spec:** [docs/superpowers/specs/2026-10-03-salivo-pc-building-simulator-design.md](file:///d:/pc%20build%20sim/docs/superpowers/specs/2026-10-03-salivo-pc-building-simulator-design.md)

## Global Constraints

- Backend and server execution must be 100% written in Salivo (`.sal`) and executed via `sf` / `spm`.
- Adhere strictly to the Salivo Architecture Laws: stream header imports (`><`), PascalCase types with zero underscores, flexible camelCase/snake_case functions and fields, no internal prefix leakage, and postfix try operator (`?`).
- Absolute zero-emoji policy: strictly no emojis anywhere in UI, code, markdown, comments, or terminal outputs. Use clean typographic labels and geometric SVG icons.
- All hardware component specifications and benchmark framerates must be authentic and verified; no dummy or randomly fabricated figures.
- UI must follow a minimalist black-and-white spatial aesthetic with high contrast, crisp lines, floating HUD telemetry, and 360-degree 3D rotation.

## Review Focus

1. **AM5 / LGA1700 Socket Mismatch**: Placing an AMD Ryzen CPU into an Intel Z790 motherboard must be flagged as a critical incompatibility blocking system POST.
2. **GPU Clearance Violation**: A 304mm triple-slot GPU installed in a compact chassis with only 280mm clearance must generate an explicit mechanical clearance error.
3. **PSU Transient Headroom Deficiency**: Pairing a high-TDP processor (14900K) and high-power GPU (RTX 4090) with an undersized PSU (<850W) must trigger a power deficit warning.
4. **Resolution Scaling Realism**: 4K gaming benchmarks must accurately reflect GPU-bound limits rather than linear CPU scaling, with verified average FPS and 1% low metrics.
5. **Cold-Start HTTP Dispatch**: The native Salivo socket dispatcher must cleanly serve the embedded single-page spatial UI and JSON endpoints without port lockups or memory leaks.

---

### Task 1: Package Scaffolding & Core Domain Models

**Files:**
- Create: `salivo.toml`
- Create: `src/types.sal`
- Test: `tests/test_types.sal`

**Interfaces:**
- Consumes: `salivo.std.core::{Result, ok, err}`
- Produces: `ComponentKind`, `SocketType`, `MemoryType`, `FormFactor`, `CoolerType`, `Component`, `CompatibilityReport`, `GameBenchmark`, `BuildConfiguration`

- [ ] **Step 1: Write the failing test**

Create `tests/test_types.sal`:
```salivo
module tests.test_types;

><salivo.std.core::{assert, assertEq, assertStrEq, outln};
><src.types::{ComponentKind, SocketType, MemoryType, FormFactor, CoolerType, Component, componentNew};

pub func main() -> int {
    let cpu = componentNew(
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
        0
    );

    assertStrEq(cpu.name, "Ryzen 7 7800X3D");
    assertEq(cpu.priceUsd, 449);
    assertEq(cpu.tdpWatts, 120);
    assertEq(cpu.coreCount, 8);
    outln("PASS: test_types");
    return 0;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_types.sal`
Expected: FAIL with "Cannot find module src.types" or "Undeclared variable".

- [ ] **Step 3: Implement `salivo.toml` and `src/types.sal`**

Initialize package configuration and implement domain types and the `componentNew` constructor in `src/types.sal`.

- [ ] **Step 4: Run test to verify it passes**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_types.sal`
Expected: PASS with "PASS: test_types" and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add salivo.toml src/types.sal tests/test_types.sal
git commit -m "feat(core): implement domain types and component models"
```

---

### Task 2: Verified Hardware Database Engine

**Files:**
- Create: `src/hardware_db.sal`
- Test: `tests/test_hardware_db.sal`

**Interfaces:**
- Consumes: `src.types::{Component, ComponentKind, SocketType, MemoryType, FormFactor, CoolerType, componentNew}`
- Produces: `getAllComponents() -> Vec<Component>`, `getComponentById(id: string) -> Option<Component>`, `filterByKind(kind: ComponentKind) -> Vec<Component>`

- [ ] **Step 1: Write the failing test**

Create `tests/test_hardware_db.sal`:
```salivo
module tests.test_hardware_db;

><salivo.std.core::{assert, assertEq, assertStrEq, outln, Option};
><salivo.std.collections::{veclen, get};
><src.types::{Component, ComponentKind};
><src.hardware_db::{getAllComponents, getComponentById, filterByKind};

pub func main() -> int {
    let all = getAllComponents();
    assert(veclen<Component>(all) >= 15);

    let optGpu = getComponentById("gpu_rtx_4090");
    assert(optGpu.is_some);
    let gpu = optGpu.value;
    assertStrEq(gpu.name, "GeForce RTX 4090");
    assertEq(gpu.tdpWatts, 450);
    assertEq(gpu.priceUsd, 1599);

    let cpus = filterByKind(ComponentKind::Processor);
    assert(veclen<Component>(cpus) >= 4);

    outln("PASS: test_hardware_db");
    return 0;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_hardware_db.sal`
Expected: FAIL with "Cannot find module src.hardware_db".

- [ ] **Step 3: Implement `src/hardware_db.sal`**

Populate verified hardware catalog with exact real-world specifications (Ryzen 7 7800X3D, i9-14900K, Ryzen 5 7600X, i5-14600K, RTX 4090, RTX 4080 Super, RTX 4070 Super, RX 7900 XTX, RTX 4060, ROG Strix B650E-E, ROG Maximus Z790, Trident Z5 DDR5-6000, Noctua NH-D15, Liquid Freezer III 360, Samsung 990 Pro, Seasonic 1000W, Lian Li O11 EVO, Fractal North).

- [ ] **Step 4: Run test to verify it passes**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_hardware_db.sal`
Expected: PASS with "PASS: test_hardware_db" and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/hardware_db.sal tests/test_hardware_db.sal
git commit -m "feat(hardware): populate authentic verified hardware catalog"
```

---

### Task 3: Hardware Compatibility Engine

**Files:**
- Create: `src/compatibility.sal`
- Test: `tests/test_compatibility.sal`

**Interfaces:**
- Consumes: `src.types::{BuildConfiguration, CompatibilityReport, Component, SocketType, MemoryType, FormFactor}`
- Produces: `verifyCompatibility(build: BuildConfiguration) -> CompatibilityReport`

- [ ] **Step 1: Write the failing test**

Create `tests/test_compatibility.sal`:
```salivo
module tests.test_compatibility;

><salivo.std.core::{assert, assertEq, outln};
><salivo.std.collections::{veclen};
><src.types::{BuildConfiguration, buildConfigNew};
><src.hardware_db::{getComponentById};
><src.compatibility::{verifyCompatibility};

pub func main() -> int {
    // Test 1: Compatible AM5 Build
    let mut goodBuild = buildConfigNew();
    goodBuild.cpu = getComponentById("cpu_7800x3d");
    goodBuild.motherboard = getComponentById("mb_b650e");
    goodBuild.memory = getComponentById("ram_trident_32gb");
    goodBuild.gpu = getComponentById("gpu_rtx_4080s");
    goodBuild.psu = getComponentById("psu_seasonic_1000w");
    goodBuild.chassis = getComponentById("case_o11_evo");
    goodBuild.cooler = getComponentById("cooler_nh_d15");

    let rep1 = verifyCompatibility(goodBuild);
    assert(rep1.isCompatible);
    assertEq(veclen<string>(rep1.errors), 0);

    // Test 2: Incompatible Socket (AM5 CPU on LGA1700 Motherboard)
    let mut badBuild = buildConfigNew();
    badBuild.cpu = getComponentById("cpu_7800x3d");
    badBuild.motherboard = getComponentById("mb_z790");
    let rep2 = verifyCompatibility(badBuild);
    assert(!rep2.isCompatible);
    assert(veclen<string>(rep2.errors) >= 1);

    outln("PASS: test_compatibility");
    return 0;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_compatibility.sal`
Expected: FAIL with "Cannot find module src.compatibility".

- [ ] **Step 3: Implement `src/compatibility.sal`**

Implement compatibility checking logic:
- Socket match: `cpu.socket == motherboard.socket`
- RAM type match: `memory.memType == motherboard.memType`
- Cooler clearance: `cooler.heightMm <= chassis.maxCoolerHeight`
- GPU clearance: `gpu.lengthMm <= chassis.maxGpuLength`
- Motherboard form factor supported by chassis.

- [ ] **Step 4: Run test to verify it passes**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_compatibility.sal`
Expected: PASS with "PASS: test_compatibility" and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/compatibility.sal tests/test_compatibility.sal
git commit -m "feat(rules): implement mechanical and electrical compatibility engine"
```

---

### Task 4: Power, Thermal & Acoustics Simulation Engine

**Files:**
- Create: `src/power_thermal.sal`
- Test: `tests/test_power_thermal.sal`

**Interfaces:**
- Consumes: `src.types::{BuildConfiguration, Component}`
- Produces: `calculatePowerMetrics(build: BuildConfiguration) -> PowerMetrics`, `calculateThermalMetrics(build: BuildConfiguration) -> ThermalMetrics`

- [ ] **Step 1: Write the failing test**

Create `tests/test_power_thermal.sal`:
```salivo
module tests.test_power_thermal;

><salivo.std.core::{assert, assertEq, outln};
><src.types::{BuildConfiguration, buildConfigNew};
><src.hardware_db::{getComponentById};
><src.power_thermal::{calculatePowerMetrics, calculateThermalMetrics, PowerMetrics, ThermalMetrics};

pub func main() -> int {
    let mut build = buildConfigNew();
    build.cpu = getComponentById("cpu_14900k");
    build.gpu = getComponentById("gpu_rtx_4090");
    build.cooler = getComponentById("cooler_arctic_360");
    build.psu = getComponentById("psu_seasonic_1000w");

    let pwr: PowerMetrics = calculatePowerMetrics(build);
    // 14900K (253W) + RTX 4090 (450W) + System (70W) = ~773W Peak
    assert(pwr.peakWatts >= 750 && pwr.peakWatts <= 800);
    assert(pwr.recommendedPsuWatts >= 1000);
    assert(pwr.transientSpikeWatts >= 950);

    let therm: ThermalMetrics = calculateThermalMetrics(build);
    assert(therm.cpuLoadTempC >= 75 && therm.cpuLoadTempC <= 95);
    assert(therm.gpuLoadTempC >= 60 && therm.gpuLoadTempC <= 75);

    outln("PASS: test_power_thermal");
    return 0;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_power_thermal.sal`
Expected: FAIL with "Cannot find module src.power_thermal".

- [ ] **Step 3: Implement `src/power_thermal.sal`**

Implement power summation, transient power spike factoring (ATX 3.0 1.3x GPU power spikes), PSU efficiency percentage calculation, and cooler thermal delta equilibrium equations.

- [ ] **Step 4: Run test to verify it passes**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_power_thermal.sal`
Expected: PASS with "PASS: test_power_thermal" and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/power_thermal.sal tests/test_power_thermal.sal
git commit -m "feat(physics): implement power dissipation and thermal simulation"
```

---

### Task 5: Verified Gaming Benchmark Calculation Engine

**Files:**
- Create: `src/benchmark_engine.sal`
- Test: `tests/test_benchmark_engine.sal`

**Interfaces:**
- Consumes: `src.types::{BuildConfiguration, GameBenchmark}`
- Produces: `simulateBenchmarks(build: BuildConfiguration, resolution: string) -> Vec<GameBenchmark>`

- [ ] **Step 1: Write the failing test**

Create `tests/test_benchmark_engine.sal`:
```salivo
module tests.test_benchmark_engine;

><salivo.std.core::{assert, assertEq, assertStrEq, outln};
><salivo.std.collections::{veclen, get};
><src.types::{BuildConfiguration, buildConfigNew, GameBenchmark};
><src.hardware_db::{getComponentById};
><src.benchmark_engine::{simulateBenchmarks};

pub func main() -> int {
    let mut build = buildConfigNew();
    build.cpu = getComponentById("cpu_7800x3d");
    build.gpu = getComponentById("gpu_rtx_4090");
    build.memory = getComponentById("ram_trident_32gb");

    // 4K Benchmark Suite
    let b4k = simulateBenchmarks(build, "4k");
    assert(veclen<GameBenchmark>(b4k) >= 5);

    let cp2077 = get<GameBenchmark>(b4k, 0);
    assertStrEq(cp2077.gameName, "Cyberpunk 2077");
    // RTX 4090 in Cyberpunk 4K Ultra achieves ~80-90 FPS
    assert(cp2077.avgFps >= 75 && cp2077.avgFps <= 100);
    assert(cp2077.gpuBottleneckPct >= 85);

    // 1080p Benchmark Suite
    let b1080 = simulateBenchmarks(build, "1080p");
    let cs2 = get<GameBenchmark>(b1080, 2);
    // CS2 1080p on 7800X3D + 4090 achieves >450 FPS
    assert(cs2.avgFps >= 450);

    outln("PASS: test_benchmark_engine");
    return 0;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_benchmark_engine.sal`
Expected: FAIL with "Cannot find module src.benchmark_engine".

- [ ] **Step 3: Implement `src/benchmark_engine.sal`**

Implement verified game benchmark calculations for Cyberpunk 2077, Black Myth: Wukong, Counter-Strike 2, Red Dead Redemption 2, Shadow of the Tomb Raider, and Hogwarts Legacy based on real tested metrics, resolution pixel multipliers, and CPU/GPU bottleneck ratios.

- [ ] **Step 4: Run test to verify it passes**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_benchmark_engine.sal`
Expected: PASS with "PASS: test_benchmark_engine" and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/benchmark_engine.sal tests/test_benchmark_engine.sal
git commit -m "feat(benchmarks): implement realistic AAA game performance matrix"
```

---

### Task 6: HTTP Dispatcher & JSON API Layer

**Files:**
- Create: `src/router.sal`
- Test: `tests/test_router.sal`

**Interfaces:**
- Consumes: `src.hardware_db`, `src.compatibility`, `src.benchmark_engine`, `src.power_thermal`
- Produces: `dispatchRequest(method: string, path: string, body: string) -> HttpResponse`

- [ ] **Step 1: Write the failing test**

Create `tests/test_router.sal`:
```salivo
module tests.test_router;

><salivo.std.core::{assert, assertEq, outln};
><src.router::{dispatchRequest, HttpResponse};

pub func main() -> int {
    let resHealth = dispatchRequest("GET", "/health", "");
    assertEq(resHealth.statusCode, 200);

    let resCatalog = dispatchRequest("GET", "/api/components", "");
    assertEq(resCatalog.statusCode, 200);
    assert(resCatalog.body:len > 200);

    let resVerify = dispatchRequest("POST", "/api/verify", "{\"cpu\":\"cpu_7800x3d\",\"motherboard\":\"mb_b650e\"}");
    assertEq(resVerify.statusCode, 200);

    outln("PASS: test_router");
    return 0;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_router.sal`
Expected: FAIL with "Cannot find module src.router".

- [ ] **Step 3: Implement `src/router.sal`**

Implement request URI matching, JSON payload parsing, and standard HTTP/1.1 response generation.

- [ ] **Step 4: Run test to verify it passes**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_router.sal`
Expected: PASS with "PASS: test_router" and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/router.sal tests/test_router.sal
git commit -m "feat(api): implement HTTP dispatcher and REST endpoints"
```

---

### Task 7: Spatial Monochrome 3D Web Engine & Procedural Hardware Assets

**Files:**
- Create: `src/frontend_assets.sal`
- Test: `tests/test_frontend.sal`

**Interfaces:**
- Consumes: Embedded HTML/CSS/JS strings
- Produces: `getSpaHtml() -> string`

- [ ] **Step 1: Write the failing test**

Create `tests/test_frontend.sal`:
```salivo
module tests.test_frontend;

><salivo.std.core::{assert, assertEq, outln};
><salivo.std.strings::{startsWith};
><src.frontend_assets::{getSpaHtml};

pub func main() -> int {
    let html = getSpaHtml();
    assert(html:len > 1000);
    assert(startsWith(html, "<!DOCTYPE html>"));
    // Verify zero emojis in frontend markup
    assert(!html:contains("🚀"));
    assert(!html:contains("🔥"));
    assert(!html:contains("💻"));
    outln("PASS: test_frontend");
    return 0;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_frontend.sal`
Expected: FAIL with "Cannot find module src.frontend_assets".

- [ ] **Step 3: Implement `src/frontend_assets.sal`**

Construct the luxury monochrome spatial 3D single-page application:
- Embedded Three.js WebGL canvas with orbit/pan/zoom
- Procedural 3D models of GPU (dual-fan shroud, heat fins, PCB), CPU (heat spreader, socket), Motherboard (slots, VRMs, heatsinks), RAM, Cooler, PSU, Case
- Workstation sidebar dock with component tabs, specs, and slot installation
- Spatial telemetry HUD (real-time wattage, estimated cost, compatibility badge)
- Gaming benchmark dashboard with 1080p / 1440p / 4K resolution switch and FPS graph
- Zero emojis: SVG badges and crisp typography only.

- [ ] **Step 4: Run test to verify it passes**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_frontend.sal`
Expected: PASS with "PASS: test_frontend" and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/frontend_assets.sal tests/test_frontend.sal
git commit -m "feat(ui): implement spatial monochrome 3D web workstation"
```

---

### Task 8: Server Bootstrap, Assembly Integration & End-to-End Verification

**Files:**
- Create: `src/main.sal`
- Test: `tests/test_e2e.sal`

**Interfaces:**
- Consumes: `src.router::{dispatchRequest}`, `salivo.std.net::{tcplisten, tcpaccept, tcprecvstr, tcpsendstr, shutdown, closelistener}`
- Produces: `pub func main() -> int`

- [ ] **Step 1: Write the failing test**

Create `tests/test_e2e.sal`:
```salivo
module tests.test_e2e;

><salivo.std.core::{assert, assertEq, outln};
><src.types::{buildConfigNew};
><src.hardware_db::{getComponentById};
><src.compatibility::{verifyCompatibility};
><src.power_thermal::{calculatePowerMetrics};
><src.benchmark_engine::{simulateBenchmarks};
><src.router::{dispatchRequest};

pub func main() -> int {
    // 1. Verify build pipeline
    let mut build = buildConfigNew();
    build.cpu = getComponentById("cpu_7800x3d");
    build.motherboard = getComponentById("mb_b650e");
    build.gpu = getComponentById("gpu_rtx_4090");
    build.memory = getComponentById("ram_trident_32gb");
    build.cooler = getComponentById("cooler_arctic_360");
    build.psu = getComponentById("psu_seasonic_1000w");
    build.chassis = getComponentById("case_o11_evo");

    let comp = verifyCompatibility(build);
    assert(comp.isCompatible);

    let pwr = calculatePowerMetrics(build);
    assert(pwr.peakWatts > 600);

    let bench = simulateBenchmarks(build, "1440p");
    assert(bench:len >= 5);

    // 2. Verify HTTP endpoint handling
    let resIndex = dispatchRequest("GET", "/", "");
    assertEq(resIndex.statusCode, 200);

    outln("PASS: test_e2e");
    return 0;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_e2e.sal`
Expected: FAIL with "Cannot find main server integration".

- [ ] **Step 3: Implement `src/main.sal`**

Tie together the network daemon, HTTP socket listener, signal handler, and automated test bench runner.

- [ ] **Step 4: Run test to verify it passes**

Run: `C:\Users\victus\.salivo\bin\sf.exe run tests/test_e2e.sal`
Expected: PASS with "PASS: test_e2e" and exit code 0.

- [ ] **Step 5: Run live server probe and browser verification**

Compile and launch `src/main.sal` on port 18080.
Send probe requests via `httpRequest` to verify `GET /`, `GET /api/components`, `POST /api/verify`, `POST /api/benchmark`.
Capture UI verification.

- [ ] **Step 6: Commit**

```bash
git add src/main.sal tests/test_e2e.sal
git commit -m "feat(server): complete Salivo native PC building simulator server"
```
