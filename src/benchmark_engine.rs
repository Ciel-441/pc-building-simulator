use crate::types::{BuildConfiguration, GameBenchmark};

pub fn simulate_benchmarks(build: &BuildConfiguration, resolution: &str) -> Vec<GameBenchmark> {
    let mut benchmarks = Vec::with_capacity(24);

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

    // Helper closure to calculate framerates cleanly
    let calc_fps = |base: u32, is_esports: bool, res_scale: u32| -> (i32, i32, i32, i32) {
        let (fps, gpu_b, cpu_b) = if is_esports {
            if res_norm.contains("4k") {
                let f = (base * gpu_index * 44) / 10000;
                (f, 65, 35)
            } else if res_norm.contains("1440") {
                let f = (base * ((gpu_index * 40) + (cpu_index * 60))) / 10000;
                (f, 45, 55)
            } else {
                let f = ((base * cpu_index * 130) / 10000) + ((gpu_index * 12) / 10);
                (f, 25, 75)
            }
        } else {
            let f = (base * gpu_index * res_scale) / 10000;
            let gb = std::cmp::min(98, base_gpu_bottleneck + 2);
            (f, gb, 100 - gb)
        };
        let low1 = if has_3d_vcache {
            (fps * 78) / 100 + 4
        } else {
            (fps * 72) / 100
        };
        (
            std::cmp::max(12, fps) as i32,
            std::cmp::max(8, low1) as i32,
            cpu_b as i32,
            gpu_b as i32,
        )
    };

    // Game 1: Cyberpunk 2077
    let (cp_fps, cp_1pct, cp_cpu, cp_gpu) = calc_fps(98, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Cyberpunk 2077",
        res_width,
        res_height,
        cp_fps,
        cp_1pct,
        cp_cpu,
        cp_gpu,
        "Ray Tracing Ultra",
    ));

    // Game 2: Black Myth: Wukong
    let (bm_fps, bm_1pct, bm_cpu, bm_gpu) = calc_fps(86, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Black Myth: Wukong",
        res_width,
        res_height,
        bm_fps,
        bm_1pct,
        bm_cpu,
        bm_gpu,
        "Cinematic TSR",
    ));

    // Game 3: Counter-Strike 2
    let (cs_fps, cs_1pct, cs_cpu, cs_gpu) = calc_fps(350, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Counter-Strike 2",
        res_width,
        res_height,
        cs_fps,
        cs_1pct,
        cs_cpu,
        cs_gpu,
        "Competitive Max",
    ));

    // Game 4: Red Dead Redemption 2
    let (rd_fps, rd_1pct, rd_cpu, rd_gpu) = calc_fps(125, false, res_scale_pct + 4);
    benchmarks.push(GameBenchmark::new(
        "Red Dead Redemption 2",
        res_width,
        res_height,
        rd_fps,
        rd_1pct,
        rd_cpu,
        rd_gpu,
        "Ultra",
    ));

    // Game 5: Shadow of the Tomb Raider
    let (tr_fps, tr_1pct, tr_cpu, tr_gpu) = calc_fps(185, false, res_scale_pct + 3);
    benchmarks.push(GameBenchmark::new(
        "Shadow of the Tomb Raider",
        res_width,
        res_height,
        tr_fps,
        tr_1pct,
        tr_cpu,
        tr_gpu,
        "Highest Preset",
    ));

    // Game 6: Hogwarts Legacy
    let (hw_fps, hw_1pct, hw_cpu, hw_gpu) = calc_fps(95, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Hogwarts Legacy",
        res_width,
        res_height,
        hw_fps,
        hw_1pct,
        hw_cpu,
        hw_gpu,
        "Ultra Ray Tracing",
    ));

    // Game 7: Grand Theft Auto V / GTA V
    let (gta_fps, gta_1pct, gta_cpu, gta_gpu) = calc_fps(195, false, res_scale_pct + 12);
    benchmarks.push(GameBenchmark::new(
        "Grand Theft Auto V",
        res_width,
        res_height,
        gta_fps,
        gta_1pct,
        gta_cpu,
        gta_gpu,
        "Very High / Ultra",
    ));

    // Game 8: Fortnite
    let (fn_fps, fn_1pct, fn_cpu, fn_gpu) = calc_fps(145, true, res_scale_pct + 5);
    benchmarks.push(GameBenchmark::new(
        "Fortnite",
        res_width,
        res_height,
        fn_fps,
        fn_1pct,
        fn_cpu,
        fn_gpu,
        "Epic Nanite & Lumen",
    ));

    // Game 9: Valorant
    let (val_fps, val_1pct, val_cpu, val_gpu) = calc_fps(420, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Valorant",
        res_width,
        res_height,
        val_fps,
        val_1pct,
        val_cpu,
        val_gpu,
        "Competitive Max",
    ));

    // Game 10: Elden Ring
    let (er_fps, er_1pct, er_cpu, er_gpu) = calc_fps(135, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Elden Ring",
        res_width,
        res_height,
        er_fps,
        er_1pct,
        er_cpu,
        er_gpu,
        "Maximum Settings",
    ));

    // Game 11: Call of Duty: Warzone
    let (wz_fps, wz_1pct, wz_cpu, wz_gpu) = calc_fps(165, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Call of Duty: Warzone",
        res_width,
        res_height,
        wz_fps,
        wz_1pct,
        wz_cpu,
        wz_gpu,
        "Competitive High",
    ));

    // Game 12: Baldur's Gate 3
    let (bg_fps, bg_1pct, bg_cpu, bg_gpu) = calc_fps(130, false, res_scale_pct + 4);
    benchmarks.push(GameBenchmark::new(
        "Baldur's Gate 3",
        res_width,
        res_height,
        bg_fps,
        bg_1pct,
        bg_cpu,
        bg_gpu,
        "Ultra Vulkan",
    ));

    // Game 13: Alan Wake 2
    let (aw_fps, aw_1pct, aw_cpu, aw_gpu) = calc_fps(72, false, res_scale_pct - 2);
    benchmarks.push(GameBenchmark::new(
        "Alan Wake 2",
        res_width,
        res_height,
        aw_fps,
        aw_1pct,
        aw_cpu,
        aw_gpu,
        "Full Path Tracing",
    ));

    // Game 14: Apex Legends
    let (apex_fps, apex_1pct, apex_cpu, apex_gpu) = calc_fps(240, true, res_scale_pct + 6);
    benchmarks.push(GameBenchmark::new(
        "Apex Legends",
        res_width,
        res_height,
        apex_fps,
        apex_1pct,
        apex_cpu,
        apex_gpu,
        "Competitive Max",
    ));

    // Game 15: Forza Horizon 5
    let (fz_fps, fz_1pct, fz_cpu, fz_gpu) = calc_fps(155, false, res_scale_pct + 6);
    benchmarks.push(GameBenchmark::new(
        "Forza Horizon 5",
        res_width,
        res_height,
        fz_fps,
        fz_1pct,
        fz_cpu,
        fz_gpu,
        "Extreme Settings",
    ));

    // Game 16: Starfield
    let (sf_fps, sf_1pct, sf_cpu, sf_gpu) = calc_fps(92, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Starfield",
        res_width,
        res_height,
        sf_fps,
        sf_1pct,
        sf_cpu,
        sf_gpu,
        "Ultra Preset",
    ));

    // Game 17: Marvel's Spider-Man Remastered
    let (sm_fps, sm_1pct, sm_cpu, sm_gpu) = calc_fps(138, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Marvel's Spider-Man Remastered",
        res_width,
        res_height,
        sm_fps,
        sm_1pct,
        sm_cpu,
        sm_gpu,
        "Very High Ray Tracing",
    ));

    // Game 18: God of War
    let (gow_fps, gow_1pct, gow_cpu, gow_gpu) = calc_fps(142, false, res_scale_pct + 3);
    benchmarks.push(GameBenchmark::new(
        "God of War",
        res_width,
        res_height,
        gow_fps,
        gow_1pct,
        gow_cpu,
        gow_gpu,
        "Ultra Preset",
    ));

    // Game 19: Rainbow Six Siege
    let (r6_fps, r6_1pct, r6_cpu, r6_gpu) = calc_fps(360, true, res_scale_pct + 10);
    benchmarks.push(GameBenchmark::new(
        "Rainbow Six Siege",
        res_width,
        res_height,
        r6_fps,
        r6_1pct,
        r6_cpu,
        r6_gpu,
        "Ultra High Refresh",
    ));

    // Game 20: Overwatch 2
    let (ow_fps, ow_1pct, ow_cpu, ow_gpu) = calc_fps(280, true, res_scale_pct + 8);
    benchmarks.push(GameBenchmark::new(
        "Overwatch 2",
        res_width,
        res_height,
        ow_fps,
        ow_1pct,
        ow_cpu,
        ow_gpu,
        "Epic Settings",
    ));

    // Game 21: The Witcher 3: Wild Hunt
    let (tw_fps, tw_1pct, tw_cpu, tw_gpu) = calc_fps(105, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "The Witcher 3: Wild Hunt",
        res_width,
        res_height,
        tw_fps,
        tw_1pct,
        tw_cpu,
        tw_gpu,
        "Next-Gen RT Ultra",
    ));

    // Game 22: Helldivers 2
    let (hd_fps, hd_1pct, hd_cpu, hd_gpu) = calc_fps(115, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Helldivers 2",
        res_width,
        res_height,
        hd_fps,
        hd_1pct,
        hd_cpu,
        hd_gpu,
        "Ultra Preset",
    ));

    // Game 23: Resident Evil 4 Remake
    let (re_fps, re_1pct, re_cpu, re_gpu) = calc_fps(128, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Resident Evil 4 Remake",
        res_width,
        res_height,
        re_fps,
        re_1pct,
        re_cpu,
        re_gpu,
        "Max Ray Tracing",
    ));

    // Game 24: Minecraft (RTX)
    let (mc_fps, mc_1pct, mc_cpu, mc_gpu) = calc_fps(120, false, res_scale_pct + 4);
    benchmarks.push(GameBenchmark::new(
        "Minecraft RTX",
        res_width,
        res_height,
        mc_fps,
        mc_1pct,
        mc_cpu,
        mc_gpu,
        "Ray Tracing 24 Chunks",
    ));

    benchmarks
}
