use crate::types::{BuildConfiguration, GameBenchmark};

pub fn simulate_benchmarks(build: &BuildConfiguration, resolution: &str) -> Vec<GameBenchmark> {
    let mut benchmarks = Vec::with_capacity(40);

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

    // Game 1: Sons of the Forest
    let (g0_fps, g0_1pct, g0_cpu, g0_gpu) = calc_fps(110, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Sons of the Forest",
        res_width,
        res_height,
        g0_fps,
        g0_1pct,
        g0_cpu,
        g0_gpu,
        "Ultra Preset",
    ));
    // Game 2: Cyberpunk 2077
    let (g1_fps, g1_1pct, g1_cpu, g1_gpu) = calc_fps(98, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Cyberpunk 2077",
        res_width,
        res_height,
        g1_fps,
        g1_1pct,
        g1_cpu,
        g1_gpu,
        "Ray Tracing Ultra",
    ));
    // Game 3: Black Myth: Wukong
    let (g2_fps, g2_1pct, g2_cpu, g2_gpu) = calc_fps(86, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Black Myth: Wukong",
        res_width,
        res_height,
        g2_fps,
        g2_1pct,
        g2_cpu,
        g2_gpu,
        "Cinematic TSR",
    ));
    // Game 4: Counter-Strike 2
    let (g3_fps, g3_1pct, g3_cpu, g3_gpu) = calc_fps(350, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Counter-Strike 2",
        res_width,
        res_height,
        g3_fps,
        g3_1pct,
        g3_cpu,
        g3_gpu,
        "Competitive Max",
    ));
    // Game 5: Red Dead Redemption 2
    let (g4_fps, g4_1pct, g4_cpu, g4_gpu) = calc_fps(125, false, res_scale_pct + 4);
    benchmarks.push(GameBenchmark::new(
        "Red Dead Redemption 2",
        res_width,
        res_height,
        g4_fps,
        g4_1pct,
        g4_cpu,
        g4_gpu,
        "Ultra Preset",
    ));
    // Game 6: Grand Theft Auto V
    let (g5_fps, g5_1pct, g5_cpu, g5_gpu) = calc_fps(175, false, res_scale_pct + 5);
    benchmarks.push(GameBenchmark::new(
        "Grand Theft Auto V",
        res_width,
        res_height,
        g5_fps,
        g5_1pct,
        g5_cpu,
        g5_gpu,
        "Very High / Ultra",
    ));
    // Game 7: Elden Ring
    let (g6_fps, g6_1pct, g6_cpu, g6_gpu) = calc_fps(105, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Elden Ring",
        res_width,
        res_height,
        g6_fps,
        g6_1pct,
        g6_cpu,
        g6_gpu,
        "Maximum Settings",
    ));
    // Game 8: Baldur's Gate 3
    let (g7_fps, g7_1pct, g7_cpu, g7_gpu) = calc_fps(120, false, res_scale_pct + 3);
    benchmarks.push(GameBenchmark::new(
        "Baldur's Gate 3",
        res_width,
        res_height,
        g7_fps,
        g7_1pct,
        g7_cpu,
        g7_gpu,
        "Ultra Preset",
    ));
    // Game 9: Helldivers 2
    let (g8_fps, g8_1pct, g8_cpu, g8_gpu) = calc_fps(112, false, res_scale_pct + 1);
    benchmarks.push(GameBenchmark::new(
        "Helldivers 2",
        res_width,
        res_height,
        g8_fps,
        g8_1pct,
        g8_cpu,
        g8_gpu,
        "Ultra Preset",
    ));
    // Game 10: Call of Duty: Warzone
    let (g9_fps, g9_1pct, g9_cpu, g9_gpu) = calc_fps(155, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Call of Duty: Warzone",
        res_width,
        res_height,
        g9_fps,
        g9_1pct,
        g9_cpu,
        g9_gpu,
        "Competitive Ultra",
    ));
    // Game 11: Fortnite
    let (g10_fps, g10_1pct, g10_cpu, g10_gpu) = calc_fps(135, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Fortnite",
        res_width,
        res_height,
        g10_fps,
        g10_1pct,
        g10_cpu,
        g10_gpu,
        "UE5 Nanite/Lumen Epic",
    ));
    // Game 12: Valorant
    let (g11_fps, g11_1pct, g11_cpu, g11_gpu) = calc_fps(450, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Valorant",
        res_width,
        res_height,
        g11_fps,
        g11_1pct,
        g11_cpu,
        g11_gpu,
        "High Max Settings",
    ));
    // Game 13: Apex Legends
    let (g12_fps, g12_1pct, g12_cpu, g12_gpu) = calc_fps(220, true, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Apex Legends",
        res_width,
        res_height,
        g12_fps,
        g12_1pct,
        g12_cpu,
        g12_gpu,
        "Very High / Max",
    ));
    // Game 14: Forza Horizon 5
    let (g13_fps, g13_1pct, g13_cpu, g13_gpu) = calc_fps(145, false, res_scale_pct + 4);
    benchmarks.push(GameBenchmark::new(
        "Forza Horizon 5",
        res_width,
        res_height,
        g13_fps,
        g13_1pct,
        g13_cpu,
        g13_gpu,
        "Extreme Settings",
    ));
    // Game 15: Starfield
    let (g14_fps, g14_1pct, g14_cpu, g14_gpu) = calc_fps(88, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Starfield",
        res_width,
        res_height,
        g14_fps,
        g14_1pct,
        g14_cpu,
        g14_gpu,
        "Ultra Preset",
    ));
    // Game 16: Hogwarts Legacy
    let (g15_fps, g15_1pct, g15_cpu, g15_gpu) = calc_fps(95, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Hogwarts Legacy",
        res_width,
        res_height,
        g15_fps,
        g15_1pct,
        g15_cpu,
        g15_gpu,
        "Ultra Ray Tracing",
    ));
    // Game 17: Shadow of the Tomb Raider
    let (g16_fps, g16_1pct, g16_cpu, g16_gpu) = calc_fps(185, false, res_scale_pct + 3);
    benchmarks.push(GameBenchmark::new(
        "Shadow of the Tomb Raider",
        res_width,
        res_height,
        g16_fps,
        g16_1pct,
        g16_cpu,
        g16_gpu,
        "Highest Preset",
    ));
    // Game 18: Marvel's Spider-Man Remastered
    let (g17_fps, g17_1pct, g17_cpu, g17_gpu) = calc_fps(115, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Marvel's Spider-Man Remastered",
        res_width,
        res_height,
        g17_fps,
        g17_1pct,
        g17_cpu,
        g17_gpu,
        "Very High RT",
    ));
    // Game 19: God of War
    let (g18_fps, g18_1pct, g18_cpu, g18_gpu) = calc_fps(128, false, res_scale_pct + 3);
    benchmarks.push(GameBenchmark::new(
        "God of War",
        res_width,
        res_height,
        g18_fps,
        g18_1pct,
        g18_cpu,
        g18_gpu,
        "Ultra Settings",
    ));
    // Game 20: Rainbow Six Siege
    let (g19_fps, g19_1pct, g19_cpu, g19_gpu) = calc_fps(360, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Rainbow Six Siege",
        res_width,
        res_height,
        g19_fps,
        g19_1pct,
        g19_cpu,
        g19_gpu,
        "Ultra Preset",
    ));
    // Game 21: Overwatch 2
    let (g20_fps, g20_1pct, g20_cpu, g20_gpu) = calc_fps(280, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Overwatch 2",
        res_width,
        res_height,
        g20_fps,
        g20_1pct,
        g20_cpu,
        g20_gpu,
        "Epic Settings",
    ));
    // Game 22: The Witcher 3 Next-Gen
    let (g21_fps, g21_1pct, g21_cpu, g21_gpu) = calc_fps(92, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "The Witcher 3 Next-Gen",
        res_width,
        res_height,
        g21_fps,
        g21_1pct,
        g21_cpu,
        g21_gpu,
        "Next-Gen RT Ultra",
    ));
    // Game 23: Resident Evil 4 Remake
    let (g22_fps, g22_1pct, g22_cpu, g22_gpu) = calc_fps(118, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Resident Evil 4 Remake",
        res_width,
        res_height,
        g22_fps,
        g22_1pct,
        g22_cpu,
        g22_gpu,
        "Max Ray Tracing",
    ));
    // Game 24: Warhammer 40,000: Space Marine 2
    let (g23_fps, g23_1pct, g23_cpu, g23_gpu) = calc_fps(96, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Warhammer 40,000: Space Marine 2",
        res_width,
        res_height,
        g23_fps,
        g23_1pct,
        g23_cpu,
        g23_gpu,
        "Ultra Preset",
    ));
    // Game 25: Ghost of Tsushima
    let (g24_fps, g24_1pct, g24_cpu, g24_gpu) = calc_fps(122, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Ghost of Tsushima",
        res_width,
        res_height,
        g24_fps,
        g24_1pct,
        g24_cpu,
        g24_gpu,
        "Very High Preset",
    ));
    // Game 26: The Last of Us Part I
    let (g25_fps, g25_1pct, g25_cpu, g25_gpu) = calc_fps(85, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "The Last of Us Part I",
        res_width,
        res_height,
        g25_fps,
        g25_1pct,
        g25_cpu,
        g25_gpu,
        "Ultra Preset",
    ));
    // Game 27: Horizon Forbidden West
    let (g26_fps, g26_1pct, g26_cpu, g26_gpu) = calc_fps(104, false, res_scale_pct + 1);
    benchmarks.push(GameBenchmark::new(
        "Horizon Forbidden West",
        res_width,
        res_height,
        g26_fps,
        g26_1pct,
        g26_cpu,
        g26_gpu,
        "Very High Preset",
    ));
    // Game 28: Palworld
    let (g27_fps, g27_1pct, g27_cpu, g27_gpu) = calc_fps(116, false, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Palworld",
        res_width,
        res_height,
        g27_fps,
        g27_1pct,
        g27_cpu,
        g27_gpu,
        "Epic Settings",
    ));
    // Game 29: Rust
    let (g28_fps, g28_1pct, g28_cpu, g28_gpu) = calc_fps(130, true, res_scale_pct + 2);
    benchmarks.push(GameBenchmark::new(
        "Rust",
        res_width,
        res_height,
        g28_fps,
        g28_1pct,
        g28_cpu,
        g28_gpu,
        "Fantastic Settings",
    ));
    // Game 30: Dragon's Dogma 2
    let (g29_fps, g29_1pct, g29_cpu, g29_gpu) = calc_fps(82, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Dragon's Dogma 2",
        res_width,
        res_height,
        g29_fps,
        g29_1pct,
        g29_cpu,
        g29_gpu,
        "High RT",
    ));
    // Game 31: Dying Light 2 Stay Human
    let (g30_fps, g30_1pct, g30_cpu, g30_gpu) = calc_fps(100, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Dying Light 2 Stay Human",
        res_width,
        res_height,
        g30_fps,
        g30_1pct,
        g30_cpu,
        g30_gpu,
        "Ray Tracing Ultra",
    ));
    // Game 32: Alan Wake 2
    let (g31_fps, g31_1pct, g31_cpu, g31_gpu) = calc_fps(78, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Alan Wake 2",
        res_width,
        res_height,
        g31_fps,
        g31_1pct,
        g31_cpu,
        g31_gpu,
        "High Preset",
    ));
    // Game 33: Dead Space Remake
    let (g32_fps, g32_1pct, g32_cpu, g32_gpu) = calc_fps(98, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Dead Space Remake",
        res_width,
        res_height,
        g32_fps,
        g32_1pct,
        g32_cpu,
        g32_gpu,
        "Ultra RT",
    ));
    // Game 34: Microsoft Flight Simulator
    let (g33_fps, g33_1pct, g33_cpu, g33_gpu) = calc_fps(74, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Microsoft Flight Simulator",
        res_width,
        res_height,
        g33_fps,
        g33_1pct,
        g33_cpu,
        g33_gpu,
        "Ultra Settings",
    ));
    // Game 35: ARK: Survival Ascended
    let (g34_fps, g34_1pct, g34_cpu, g34_gpu) = calc_fps(64, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "ARK: Survival Ascended",
        res_width,
        res_height,
        g34_fps,
        g34_1pct,
        g34_cpu,
        g34_gpu,
        "Epic UE5",
    ));
    // Game 36: Escape from Tarkov
    let (g35_fps, g35_1pct, g35_cpu, g35_gpu) = calc_fps(115, true, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Escape from Tarkov",
        res_width,
        res_height,
        g35_fps,
        g35_1pct,
        g35_cpu,
        g35_gpu,
        "Ultra Settings",
    ));
    // Game 37: Diablo IV
    let (g36_fps, g36_1pct, g36_cpu, g36_gpu) = calc_fps(165, false, res_scale_pct + 3);
    benchmarks.push(GameBenchmark::new(
        "Diablo IV",
        res_width,
        res_height,
        g36_fps,
        g36_1pct,
        g36_cpu,
        g36_gpu,
        "Ultra Preset",
    ));
    // Game 38: DOOM Eternal
    let (g37_fps, g37_1pct, g37_cpu, g37_gpu) = calc_fps(260, false, res_scale_pct + 5);
    benchmarks.push(GameBenchmark::new(
        "DOOM Eternal",
        res_width,
        res_height,
        g37_fps,
        g37_1pct,
        g37_cpu,
        g37_gpu,
        "Ultra Nightmare",
    ));
    // Game 39: Hunt: Showdown 1896
    let (g38_fps, g38_1pct, g38_cpu, g38_gpu) = calc_fps(140, true, res_scale_pct + 1);
    benchmarks.push(GameBenchmark::new(
        "Hunt: Showdown 1896",
        res_width,
        res_height,
        g38_fps,
        g38_1pct,
        g38_cpu,
        g38_gpu,
        "High Settings",
    ));
    // Game 40: Minecraft RTX
    let (g39_fps, g39_1pct, g39_cpu, g39_gpu) = calc_fps(114, false, res_scale_pct);
    benchmarks.push(GameBenchmark::new(
        "Minecraft RTX",
        res_width,
        res_height,
        g39_fps,
        g39_1pct,
        g39_cpu,
        g39_gpu,
        "Ray Tracing 24 Chunks",
    ));

    benchmarks
}
