use crate::types::{BuildConfiguration, GameBenchmark};

pub fn simulate_benchmarks(build: &BuildConfiguration, resolution: &str) -> Vec<GameBenchmark> {
    let mut benchmarks = Vec::with_capacity(6);

    // 1. GPU Compute Index (Base 100 = RTX 4070 Super)
    let gpu_index = if let Some(ref gpu) = build.gpu {
        match gpu.id.as_str() {
            "gpu_rtx_4090" | "gpu_rtx_4090_fe" => 200,
            "gpu_rtx_4080s" => 148,
            "gpu_rx_7900xtx" => 140,
            "gpu_rtx_4070_ti_s" => 125,
            "gpu_rx_7900xt" => 122,
            "gpu_rx_7800xt" => 102,
            "gpu_rtx_4070s" => 100,
            "gpu_rtx_4060" => 52,
            _ => 80,
        }
    } else {
        8 // Integrated fallback
    };

    // 2. CPU IPC & Gaming Index (Base 100 = 7600X)
    let mut cpu_index = 25;
    let mut has_3d_vcache = false;
    if let Some(ref cpu) = build.cpu {
        match cpu.id.as_str() {
            "cpu_7950x3d" => {
                cpu_index = 135;
                has_3d_vcache = true;
            }
            "cpu_7800x3d" => {
                cpu_index = 128;
                has_3d_vcache = true;
            }
            "cpu_14900ks" => cpu_index = 130,
            "cpu_14900k" => cpu_index = 124,
            "cpu_14700k" => cpu_index = 116,
            "cpu_14600k" => cpu_index = 108,
            "cpu_7600x" => cpu_index = 100,
            "cpu_5800x3d" => {
                cpu_index = 102;
                has_3d_vcache = true;
            }
            _ => cpu_index = 90,
        }
    }

    // 3. Resolution scaling factors
    let res_norm = resolution.to_ascii_lowercase();
    let (res_width, res_height, res_scale_pct, base_gpu_bottleneck) = if res_norm.contains("4k") {
        (3840, 2160, 42, 88)
    } else if res_norm.contains("1440") {
        (2560, 1440, 72, 70)
    } else {
        (1920, 1080, 100, 48)
    };

    // 4. Game 1: Cyberpunk 2077 (Ultra Preset)
    let cp_base = 98;
    let cp_fps = (cp_base * gpu_index * res_scale_pct) / 10000;
    let mut cp_1pct = (cp_fps * 74) / 100;
    if has_3d_vcache {
        cp_1pct += 6;
    }
    let cp_gpu_bottle = base_gpu_bottleneck + 2;
    let cp_cpu_bottle = 100 - cp_gpu_bottle;
    benchmarks.push(GameBenchmark::new(
        "Cyberpunk 2077",
        res_width,
        res_height,
        cp_fps,
        cp_1pct,
        cp_cpu_bottle,
        cp_gpu_bottle,
        "Ray Tracing Ultra",
    ));

    // 5. Game 2: Black Myth: Wukong (Cinematic)
    let bm_base = 86;
    let bm_fps = (bm_base * gpu_index * res_scale_pct) / 10000;
    let mut bm_1pct = (bm_fps * 76) / 100;
    if has_3d_vcache {
        bm_1pct += 5;
    }
    let bm_gpu_bottle = base_gpu_bottleneck + 3;
    let bm_cpu_bottle = 100 - bm_gpu_bottle;
    benchmarks.push(GameBenchmark::new(
        "Black Myth: Wukong",
        res_width,
        res_height,
        bm_fps,
        bm_1pct,
        bm_cpu_bottle,
        bm_gpu_bottle,
        "Cinematic TSR",
    ));

    // 6. Game 3: Counter-Strike 2 (Competitive Max)
    let cs_base = 350;
    let cs_fps;
    let cs_gpu_bottle;
    let cs_cpu_bottle;

    if res_norm.contains("4k") {
        cs_fps = (cs_base * gpu_index * 44) / 10000;
        cs_gpu_bottle = 65;
        cs_cpu_bottle = 35;
    } else if res_norm.contains("1440") {
        cs_fps = (cs_base * ((gpu_index * 40) + (cpu_index * 60))) / 10000;
        cs_gpu_bottle = 45;
        cs_cpu_bottle = 55;
    } else {
        // 1080p: massive frame rate with high-end CPU
        cs_fps = ((cs_base * cpu_index * 130) / 10000) + ((gpu_index * 12) / 10);
        cs_gpu_bottle = 25;
        cs_cpu_bottle = 75;
    }
    let cs_1pct = if has_3d_vcache {
        (cs_fps * 80) / 100
    } else {
        (cs_fps * 72) / 100
    };
    benchmarks.push(GameBenchmark::new(
        "Counter-Strike 2",
        res_width,
        res_height,
        cs_fps,
        cs_1pct,
        cs_cpu_bottle,
        cs_gpu_bottle,
        "Competitive Max",
    ));

    // 7. Game 4: Red Dead Redemption 2 (Ultra)
    let rd_base = 125;
    let rd_fps = (rd_base * gpu_index * (res_scale_pct + 4)) / 10000;
    let rd_1pct = (rd_fps * 76) / 100;
    let rd_gpu_bottle = base_gpu_bottleneck;
    let rd_cpu_bottle = 100 - rd_gpu_bottle;
    benchmarks.push(GameBenchmark::new(
        "Red Dead Redemption 2",
        res_width,
        res_height,
        rd_fps,
        rd_1pct,
        rd_cpu_bottle,
        rd_gpu_bottle,
        "Ultra",
    ));

    // 8. Game 5: Shadow of the Tomb Raider (Highest)
    let tr_base = 185;
    let tr_fps = (tr_base * gpu_index * (res_scale_pct + 3)) / 10000;
    let tr_1pct = (tr_fps * 75) / 100;
    let tr_gpu_bottle = base_gpu_bottleneck - 4;
    let tr_cpu_bottle = 100 - tr_gpu_bottle;
    benchmarks.push(GameBenchmark::new(
        "Shadow of the Tomb Raider",
        res_width,
        res_height,
        tr_fps,
        tr_1pct,
        tr_cpu_bottle,
        tr_gpu_bottle,
        "Highest Preset",
    ));

    // 9. Game 6: Hogwarts Legacy (Ultra + Ray Tracing)
    let hw_base = 95;
    let hw_fps = (hw_base * gpu_index * (res_scale_pct - 1)) / 10000;
    let hw_1pct = (hw_fps * 72) / 100;
    let hw_gpu_bottle = base_gpu_bottleneck + 2;
    let hw_cpu_bottle = 100 - hw_gpu_bottle;
    benchmarks.push(GameBenchmark::new(
        "Hogwarts Legacy",
        res_width,
        res_height,
        hw_fps,
        hw_1pct,
        hw_cpu_bottle,
        hw_gpu_bottle,
        "Ultra Ray Tracing",
    ));

    benchmarks
}
