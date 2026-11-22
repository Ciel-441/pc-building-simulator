const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'web', 'index.html');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PC Hardware Architect - 3D Rig Simulation & Performance Lab</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    :root {
      --bg-studio: #050806;
      --bg-panel: rgba(8, 14, 10, 0.94);
      --bg-card: rgba(12, 20, 15, 0.92);
      --border-panel: rgba(255, 255, 255, 0.10);
      --border-panel-hover: rgba(16, 240, 106, 0.45);
      --border-accent: #10f06a;
      --text-white: #f8fafc;
      --text-dim: #94a3b8;
      --text-muted: #64748b;
      --accent-cyan: #10f06a;
      --accent-blue: #84cc16;
      --accent-amber: #f59e0b;
      --accent-emerald: #10b981;
      --accent-crimson: #ef4444;
      --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    body, html { width: 100%; height: 100%; overflow: hidden !important; background: var(--bg-studio); color: var(--text-white); font-family: var(--font-sans); user-select: none; }
    
    #viewport-container { position: absolute; inset: 0; z-index: 1; cursor: grab; }
    #viewport-container:active { cursor: grabbing; }
    canvas { width: 100%; height: 100%; display: block; }

    /* Top Telemetry Header */
    .spatial-hud { position: absolute; top: 16px; left: 16px; right: 500px; z-index: 10; display: flex; flex-direction: column; gap: 8px; pointer-events: none; transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .spatial-hud.expanded { right: 16px; }
    .hud-header { display: flex; align-items: center; justify-content: space-between; background: var(--bg-panel); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--border-panel); border-radius: 10px; padding: 12px 22px; pointer-events: auto; box-shadow: 0 16px 36px rgba(0,0,0,0.55); }
    .brand-cluster { display: flex; align-items: center; gap: 14px; }
    .brand-logo-badge { background: #fff; color: #000; font-family: var(--font-mono); font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 4px; letter-spacing: 1.2px; }
    .brand-title { font-family: var(--font-display); font-weight: 700; font-size: 14px; letter-spacing: 0.5px; color: #fff; display: flex; align-items: center; gap: 8px; }
    .brand-tag { font-size: 10px; font-weight: 600; padding: 3px 8px; border: 1px solid var(--border-panel); border-radius: 4px; color: var(--text-dim); letter-spacing: 0.5px; font-family: var(--font-mono); }
    
    .telemetry-row { display: flex; align-items: center; gap: 24px; font-family: var(--font-mono); font-size: 12px; }
    .telem-item { display: flex; flex-direction: column; align-items: flex-end; }
    .telem-lbl { font-size: 9px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.8px; margin-bottom: 2px; }
    .telem-val { font-size: 15px; font-weight: 800; color: #fff; display: flex; align-items: baseline; gap: 3px; }
    .telem-unit { font-size: 10px; color: var(--text-dim); font-weight: 600; }
    .compat-badge { padding: 5px 12px; border-radius: 5px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid var(--accent-emerald); background: rgba(16, 185, 129, 0.15); color: #34d399; cursor: pointer; transition: all 0.2s ease; font-family: var(--font-mono); }
    .compat-badge.incompatible { border-color: var(--accent-crimson); background: rgba(239, 68, 68, 0.2); color: #f87171; }

    /* 3D Viewport Navigation & Zoom Floating Dock */
    .viewport-tools { position: absolute; left: 16px; bottom: 16px; z-index: 10; display: flex; flex-wrap: nowrap; align-items: center; gap: 6px; pointer-events: auto; max-width: calc(100% - 510px);; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; transition: max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .viewport-tools::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .viewport-tools.full-width { max-width: calc(100% - 32px); }
    .tool-group { display: flex; align-items: center; gap: 3px; background: var(--bg-panel); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border-panel); padding: 3px 5px; border-radius: 8px; box-shadow: 0 10px 24px rgba(0,0,0,0.45); flex-shrink: 0; }
    .tool-btn { background: transparent; border: 1px solid transparent; color: var(--text-dim); font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; padding: 6px 9px; border-radius: 5px; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); letter-spacing: 0.3px; white-space: nowrap; }
    .tool-btn:hover { color: #fff; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); transform: translateY(-1px); }
    .tool-btn.active { color: #fff; background: rgba(16, 240, 106, 0.18); border-color: var(--accent-cyan); box-shadow: 0 0 10px rgba(16, 240, 106, 0.2); }
    .tool-btn.active-cyan { color: #10f06a; background: rgba(16, 240, 106, 0.15); border-color: #10f06a; box-shadow: 0 0 10px rgba(16, 240, 106, 0.2); }
    .tool-btn.stress-btn.active { background: rgba(239, 68, 68, 0.25); border-color: var(--accent-crimson); color: #fca5a5; box-shadow: 0 0 12px rgba(239, 68, 68, 0.3); }

    .zoom-slider-wrap { display: flex; align-items: center; padding: 0 4px; }
    .zoom-slider-wrap input[type=range] { width: 68px; height: 4px; accent-color: var(--accent-cyan); cursor: pointer; }
    .zoom-btn { font-size: 13px; font-weight: 900; padding: 4px 7px; }

    /* Floating Re-Open Pills (When panels are closed) */
    .floating-reopen-btn { position: absolute; z-index: 15; background: rgba(8, 14, 10, 0.95); border: 1px solid #10f06a; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-family: var(--font-display); font-size: 11px; font-weight: 700; cursor: pointer; display: none; align-items: center; gap: 8px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(16, 240, 106, 0.25); backdrop-filter: blur(16px); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .floating-reopen-btn:hover { background: var(--accent-cyan); color: #000; transform: translateY(-2px); }
    .floating-reopen-btn.right-edge { top: 74px; right: 16px; }
    .floating-reopen-btn.bottom-edge { bottom: 58px; left: 16px; }
    .reopen-badge { background: rgba(16, 240, 106, 0.2); color: var(--accent-cyan); font-family: var(--font-mono); font-size: 10px; padding: 2px 6px; border-radius: 4px; }
    .floating-reopen-btn:hover .reopen-badge { background: #000; color: #fff; }

    /* Workstation Multi-Panel Sidebar */
    .workstation-sidebar { position: absolute; top: 16px; right: 16px; bottom: 16px; width: 480px; background: var(--bg-panel); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); border: 1px solid var(--border-panel); border-radius: 12px; z-index: 10; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 48px rgba(0,0,0,0.55); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s; }
    .workstation-sidebar.collapsed { transform: translateX(calc(100% + 24px)); pointer-events: none; opacity: 0; }
    
    /* Sidebar Header with Segmented Modern Tabs */
    .sidebar-header-bar { display: flex; align-items: center; justify-content: space-between; background: rgba(6, 12, 8, 0.94); border-bottom: 1px solid rgba(16, 240, 106, 0.22); padding: 8px 10px; gap: 6px; flex-shrink: 0; }
    .panel-switcher-tabs { display: flex; flex: 1; gap: 3px; background: rgba(0, 0, 0, 0.6); padding: 3px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); }
    
    .tab-switch-btn { flex: 1; min-width: 0; padding: 7px 5px; font-family: var(--font-display); font-size: 10px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; background: transparent; border: none; color: #94a3b8; border-radius: 6px; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-align: center; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
    .tab-switch-btn:hover { color: #ffffff; background: rgba(255, 255, 255, 0.07); transform: translateY(-1px); }
    .tab-switch-btn.active { color: #040805 !important; background: #10f06a !important; font-weight: 800; box-shadow: 0 0 16px rgba(16, 240, 106, 0.45); transform: scale(1.02); }
    .tab-switch-btn.active .rig-counter-badge { background: #040805; color: #10f06a; border-color: rgba(0, 0, 0, 0.4); }
    .tab-switch-btn.active .badge-num { color: #10f06a; }
    .tab-switch-btn.active .badge-total { color: #a6ff00; }
    
    /* Dedicated High-Tech Counter Badge with Pulse Animation */
    @keyframes badgePulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.22); }
      100% { transform: scale(1); }
    }
    .rig-counter-badge { display: inline-flex; align-items: center; gap: 1px; padding: 1px 6px; background: rgba(16, 240, 106, 0.15); border: 1px solid rgba(16, 240, 106, 0.4); border-radius: 5px; font-family: var(--font-mono); font-size: 9px; font-weight: 800; color: #10f06a; line-height: 1.2; transition: all 0.2s ease; }
    .rig-counter-badge.pulse { animation: badgePulse 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .badge-num { color: #ffffff; }
    .badge-sep { color: rgba(255, 255, 255, 0.45); margin: 0 1px; font-weight: 400; }
    .badge-total { color: #10f06a; }

    /* Tab Transition Smooth Zoom-In / Zoom-Out Animation */
    @keyframes panelZoomFadeIn {
      0% { opacity: 0; transform: scale(0.97) translateY(8px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .panel-view.tab-entering { animation: panelZoomFadeIn 0.30s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    /* Close Button */
    .panel-close-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid transparent; color: var(--text-dim); border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 700; transition: all 0.18s; flex-shrink: 0; }
    .panel-close-btn:hover { background: rgba(239, 68, 68, 0.2); border-color: var(--accent-crimson); color: #fca5a5; }

    /* Search Bar in Catalog */
    .catalog-search-bar { padding: 10px 14px; border-bottom: 1px solid var(--border-panel); background: rgba(255,255,255,0.02); display: flex; gap: 8px; }
    .search-input { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid var(--border-panel); border-radius: 6px; padding: 7px 12px; color: #fff; font-family: var(--font-sans); font-size: 12px; outline: none; }
    .search-input:focus { border-color: var(--accent-cyan); }
    .sort-select { background: rgba(0,0,0,0.4); border: 1px solid var(--border-panel); border-radius: 6px; padding: 7px 8px; color: var(--text-dim); font-family: var(--font-sans); font-size: 11px; outline: none; }

    .category-nav { display: flex; overflow-x: auto; padding: 8px 12px; gap: 6px; border-bottom: 1px solid var(--border-panel); scrollbar-width: none; background: rgba(0,0,0,0.2); flex-shrink: 0; }
    .category-nav::-webkit-scrollbar { display: none; }
    .cat-btn { padding: 5px 10px; font-size: 11px; font-weight: 600; border-radius: 5px; border: 1px solid var(--border-panel); background: rgba(255,255,255,0.03); color: var(--text-dim); cursor: pointer; white-space: nowrap; transition: all 0.15s; font-family: var(--font-sans); }
    .cat-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); }
    .cat-btn.active { color: #000; border-color: #fff; background: #fff; font-weight: 700; }

    /* Feeds */
    .panel-view { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    .panel-view::-webkit-scrollbar { width: 5px; }
    .panel-view::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
    .panel-view::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

    .component-feed { padding: 12px; display: flex; flex-direction: column; gap: 10px; }

    /* Dedicated Gaming FPS Benchmark Panel View */
    .bench-panel-view { padding: 14px; display: flex; flex-direction: column; gap: 12px; }
    .bench-panel-header { display: flex; flex-direction: column; gap: 10px; background: rgba(0,0,0,0.4); border: 1px solid rgba(16, 240, 106, 0.2); border-radius: 8px; padding: 12px; }
    .bench-header-top { display: flex; justify-content: space-between; align-items: center; }
    .bench-panel-title { font-size: 11.5px; font-weight: 800; font-family: var(--font-display); letter-spacing: 0.6px; text-transform: uppercase; color: #10f06a; }
    .bench-panel-sub { font-size: 9.5px; font-family: var(--font-sans); color: var(--text-dim); }
    .res-toggles { display: flex; gap: 3px; background: rgba(0,0,0,0.4); padding: 2px; border-radius: 6px; border: 1px solid var(--border-panel); }
    .res-btn { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; border: none; background: transparent; color: var(--text-dim); cursor: pointer; transition: all 0.15s; }
    .res-btn:hover { color: #fff; }
    .res-btn.active { background: #10f06a; color: #040805; font-weight: 800; box-shadow: 0 0 10px rgba(16, 240, 106, 0.3); }

    .bench-search-wrap input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--border-panel); border-radius: 6px; padding: 7px 12px; color: #fff; font-family: var(--font-sans); font-size: 11px; outline: none; }
    .bench-search-wrap input:focus { border-color: #10f06a; }

    /* Performance Summary Card in Benchmark Panel */
    .bench-summary-card { background: rgba(16, 240, 106, 0.08); border: 1px solid rgba(16, 240, 106, 0.3); border-radius: 8px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; }
    .bench-stat-col { display: flex; flex-direction: column; gap: 2px; }
    .bench-stat-col.align-right { align-items: flex-end; }
    .stat-micro-lbl { font-size: 8.5px; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.6px; }
    .bench-headline-stat { font-size: 22px; font-family: var(--font-mono); font-weight: 800; color: #fff; display: flex; align-items: baseline; gap: 4px; text-shadow: 0 0 12px rgba(16, 240, 106, 0.3); }
    .bench-headline-stat .unit { font-size: 11px; color: #10f06a; font-weight: 700; }
    .bench-sub-headline { font-size: 16px; font-family: var(--font-mono); font-weight: 700; color: #e2e8f0; display: flex; align-items: baseline; gap: 3px; }
    .bench-sub-headline .unit { font-size: 10px; color: #84cc16; }
    .bench-tier-badge { display: inline-block; background: #10f06a; color: #040805; font-family: var(--font-mono); font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px; width: fit-content; margin-top: 2px; }
    .bench-stability-sub { font-size: 9.5px; font-family: var(--font-mono); color: #84cc16; margin-top: 2px; }

    /* Game Row Cards inside Benchmark Panel */
    .game-bench-feed { display: flex; flex-direction: column; gap: 10px; padding-bottom: 20px; }
    
    .game-card { width: 234px; flex-shrink: 0; background: rgba(10, 16, 12, 0.95); border: 1px solid rgba(255, 255, 255, 0.10); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.25s ease; position: relative; }
    .game-card:hover { transform: translateY(-3px) scale(1.02); border-color: #10f06a; box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 16px rgba(16, 240, 106, 0.25); }
    .game-banner-box { width: 100%; height: 72px; overflow: hidden; background: #000; position: relative; }
    .game-banner-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .game-card:hover .game-banner-box img { transform: scale(1.05); }
    .game-preset-tag { position: absolute; top: 6px; right: 6px; font-size: 8.5px; font-family: var(--font-mono); font-weight: 700; color: #a6ff00; background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(8px); padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(166, 255, 0, 0.35); z-index: 2; letter-spacing: 0.3px; text-transform: uppercase; }
    .game-meta-box { padding: 9px 12px; display: flex; flex-direction: column; gap: 5px; }
    .game-title { font-size: 11.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #f8fafc; font-family: var(--font-sans); }
    .game-fps-row { display: flex; justify-content: space-between; align-items: baseline; }
    .game-fps { font-family: var(--font-mono); font-size: 20px; font-weight: 800; color: #ffffff; text-shadow: 0 0 10px rgba(16, 240, 106, 0.25); display: flex; align-items: baseline; gap: 3px; }
    .game-fps-unit { font-size: 10.5px; color: #10f06a; font-weight: 700; }
    .game-badge-load { font-size: 9.5px; font-family: var(--font-mono); font-weight: 700; color: #84cc16; }
    .game-sub { display: flex; justify-content: space-between; font-size: 9px; font-family: var(--font-mono); color: var(--text-muted); margin-top: 1px; }
    .bench-sub-stat { display: flex; align-items: baseline; gap: 4px; }
    .stat-lbl { color: var(--text-dim); font-size: 8.5px; }
    .stat-val { color: #cbd5e1; font-weight: 700; }
    .bottle-bar { width: 100%; height: 3.5px; background: rgba(255, 255, 255, 0.08); border-radius: 2px; overflow: hidden; display: flex; margin-top: 3px; }
    .bottle-fill { height: 100%; background: linear-gradient(90deg, #10f06a, #a6ff00); border-radius: 2px; transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

    .game-card-row:hover { transform: translateY(-2px); border-color: #10f06a; box-shadow: 0 8px 24px rgba(16, 240, 106, 0.15); }
    .game-row-thumb { width: 100%; height: 74px; overflow: hidden; background: #000; position: relative; }
    .game-row-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .game-card-row:hover .game-row-thumb img { transform: scale(1.03); }
    .game-row-info { padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
    .game-row-title-bar { display: flex; justify-content: space-between; align-items: center; }
    .game-title { font-size: 12px; font-weight: 700; color: #f8fafc; font-family: var(--font-sans); }
    .game-preset-tag { font-size: 9px; font-family: var(--font-mono); font-weight: 700; color: #a6ff00; background: rgba(166, 255, 0, 0.12); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(166, 255, 0, 0.25); }
    .game-row-stats { display: flex; justify-content: space-between; align-items: center; }
    .game-fps-box { display: flex; align-items: baseline; gap: 3px; font-family: var(--font-mono); font-size: 20px; font-weight: 800; color: #fff; text-shadow: 0 0 10px rgba(16, 240, 106, 0.25); }
    .game-fps-box .fps-unit { font-size: 10px; color: #10f06a; font-weight: 700; }
    .game-sub-stats { display: flex; gap: 14px; font-family: var(--font-mono); font-size: 9.5px; }
    .sub-stat-line { display: flex; align-items: baseline; gap: 4px; }
    .sub-stat-line .lbl { color: var(--text-dim); font-size: 8.5px; }
    .sub-stat-line .val { color: #cbd5e1; font-weight: 700; }
    .bottle-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; display: flex; }
    .bottle-fill { height: 100%; background: linear-gradient(90deg, #10f06a, #a6ff00); border-radius: 2px; transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1); }


    /* Component Cards with Authentic Real Product Photos */
    .part-card { background: var(--bg-card); border: 1px solid var(--border-panel); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; position: relative; flex-shrink: 0; min-height: 110px; }
    .part-card:hover { border-color: var(--border-panel-hover); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(16, 240, 106, 0.12); }
    .part-card.installed { border-color: var(--accent-cyan); background: rgba(16, 240, 106, 0.08); }
    .part-card.installed::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--accent-cyan); }
    
    .part-main-row { display: flex; gap: 12px; align-items: flex-start; }
    
    /* Real Photo Box with Vignette & Loading Guard */
    .part-img-box { width: 76px; height: 76px; border-radius: 8px; background: #080c14; border: 1px solid var(--border-panel); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; position: relative; }
    .real-part-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.25s ease; }
    .part-card:hover .real-part-img { transform: scale(1.08); }
    .part-img-box svg { width: 100%; height: 100%; display: block; padding: 4px; }

    .part-info-col { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .part-top-row { display: flex; justify-content: space-between; align-items: flex-start; }
    .part-brand-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font-mono); padding: 2px 6px; border-radius: 3px; background: rgba(255,255,255,0.08); color: var(--text-dim); }
    .brand-amd { background: rgba(239, 68, 68, 0.18); color: #f87171; }
    .brand-intel { background: rgba(59, 130, 246, 0.18); color: #60a5fa; }
    .brand-nvidia { background: rgba(16, 185, 129, 0.18); color: #34d399; }
    .brand-corsair { background: rgba(245, 158, 11, 0.18); color: #fbbf24; }
    .brand-asus { background: rgba(244, 63, 94, 0.18); color: #fb7185; }

    .part-price-badge { font-family: var(--font-mono); font-size: 15px; font-weight: 800; color: #fff; }
    .part-name-title { font-size: 13px; font-weight: 700; color: #fff; line-height: 1.3; margin-top: 1px; word-break: break-word; font-family: var(--font-sans); }
    .part-tagline-text { font-size: 10px; font-family: var(--font-sans); color: var(--accent-blue); margin-top: 1px; }
    .stock-tag { font-size: 9px; font-family: var(--font-mono); color: #10b981; font-weight: 600; margin-top: 2px; }

    .part-specs-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .spec-pill { font-size: 9px; font-family: var(--font-mono); background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 3px; color: var(--text-dim); }

    .part-actions-row { display: flex; gap: 8px; margin-top: 6px; }
    .action-btn { flex: 1; padding: 7px 0; border: 1px solid var(--border-panel); border-radius: 5px; background: rgba(255,255,255,0.04); color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer; transition: all 0.18s; font-family: var(--font-sans); }
    .action-btn:hover { border-color: #fff; background: rgba(255,255,255,0.12); }
    .action-btn.primary { background: #fff; color: #000; border-color: #fff; }
    .action-btn.primary:hover { background: #e2e8f0; }
    .action-btn.primary.installed-btn { background: rgba(239, 68, 68, 0.15); border-color: var(--accent-crimson); color: #fca5a5; }

    /* Dedicated "MY RIG / CHOSEN SETUP" Panel */
    .chosen-rig-container { padding: 14px; display: flex; flex-direction: column; gap: 12px; }
    .chosen-summary-card { background: rgba(16, 240, 106, 0.06); border: 1px solid rgba(16, 240, 106, 0.25); border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
    .chosen-summary-header { display: flex; justify-content: space-between; align-items: center; }
    .chosen-summary-title { font-family: var(--font-display); font-size: 12px; font-weight: 800; color: #fff; }
    .chosen-summary-actions { display: flex; gap: 6px; margin-top: 4px; }
    
    .chosen-slot-card { background: var(--bg-card); border: 1px solid var(--border-panel); border-radius: 8px; padding: 10px 12px; display: flex; gap: 12px; align-items: center; transition: all 0.2s; }
    .chosen-slot-card:hover { border-color: var(--accent-cyan); }
    .chosen-slot-card.empty-slot { border-style: dashed; border-color: rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); }
    .chosen-slot-label { font-family: var(--font-mono); font-size: 9px; font-weight: 800; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 2px; }
    .chosen-slot-name { font-size: 12px; font-weight: 700; color: #fff; line-height: 1.2; }
    .chosen-slot-sub { font-size: 10px; color: var(--text-dim); font-family: var(--font-mono); }
    .chosen-slot-price { font-family: var(--font-mono); font-size: 14px; font-weight: 800; color: #34d399; margin-left: auto; text-align: right; }
    .chosen-btn-grp { display: flex; gap: 4px; margin-left: 8px; }
    .mini-icon-btn { padding: 4px 8px; font-size: 9px; font-family: var(--font-mono); font-weight: 700; border-radius: 4px; border: 1px solid var(--border-panel); background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; }
    .mini-icon-btn:hover { background: #fff; color: #000; }
    .mini-icon-btn.remove { color: #fca5a5; border-color: rgba(239, 68, 68, 0.4); }
    .mini-icon-btn.remove:hover { background: #ef4444; color: #fff; }

    /* Build Spec Sheet View */
    .spec-sheet-container { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
    .spec-section-card { background: var(--bg-card); border: 1px solid var(--border-panel); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .spec-section-header { font-size: 11px; font-weight: 700; font-family: var(--font-display); text-transform: uppercase; letter-spacing: 0.8px; color: var(--accent-cyan); display: flex; justify-content: space-between; }
    .spec-row { display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .spec-key { color: var(--text-dim); font-family: var(--font-sans); font-size: 12px; }
    .spec-val { color: #fff; font-weight: 700; }
    .clearance-pass { color: var(--accent-emerald); font-weight: 700; }
    .clearance-fail { color: var(--accent-crimson); font-weight: 700; }

    /* Market Deals & Live Pricing View */
    .market-view-container { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
    .crawler-status-box { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
    .crawler-header-row { display: flex; justify-content: space-between; align-items: center; }
    .crawler-info { display: flex; flex-direction: column; gap: 3px; }
    .crawler-title { font-size: 12px; font-weight: 700; font-family: var(--font-display); color: #34d399; letter-spacing: 0.3px; }
    .crawler-sub { font-size: 10px; font-family: var(--font-sans); color: var(--text-dim); }
    .crawler-btn-group { display: flex; gap: 6px; flex-wrap: wrap; }
    .crawler-action-btn { background: #1e293b; color: #84cc16; border: 1px solid rgba(132, 204, 22, 0.3); padding: 6px 12px; border-radius: 4px; font-family: var(--font-sans); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.18s; }
    .crawler-action-btn:hover { background: #84cc16; color: #000; }
    .crawler-action-btn.active-green { background: #34d399; color: #000; border-color: #34d399; }
    .crawler-action-btn.active-green:hover { background: #10b981; }
    .crawler-log-box { background: #070a13; border: 1px solid #1e293b; border-radius: 6px; padding: 10px; font-family: var(--font-mono); font-size: 10px; color: #94a3b8; max-height: 140px; overflow-y: auto; line-height: 1.5; white-space: pre-wrap; }
    .crawler-raw-json { background: #05070f; border: 1px dashed rgba(132, 204, 22, 0.25); border-radius: 4px; padding: 8px; font-family: var(--font-mono); font-size: 9px; color: #6ee7b7; max-height: 120px; overflow-y: auto; margin-top: 8px; white-space: pre-wrap; }
    .market-delta-pill { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); display: inline-block; }
    .delta-discount { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); }
    .delta-scalp { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); }
    .delta-neutral { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }

    /* Bottom Gaming Benchmark Tray: Custom Moving Carousel (No Native White Bar!) */
    .benchmark-tray { position: absolute; left: 16px; right: 500px; bottom: 65px; z-index: 10; background: var(--bg-panel); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--border-panel); border-radius: 10px; padding: 12px 18px; display: flex; flex-direction: column; gap: 8px; pointer-events: auto; max-height: 240px; box-shadow: 0 16px 36px rgba(0,0,0,0.55); overflow: hidden !important; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s, right 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .benchmark-tray.collapsed { transform: translateY(calc(100% + 40px)); pointer-events: none; opacity: 0; }
    .benchmark-tray.expanded { right: 16px; }

    .tray-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .tray-title-cluster { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .tray-title { font-size: 11.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #fff; font-family: var(--font-display); }
    .game-search-box { flex: 1; max-width: 300px; }
    .game-search-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid var(--border-panel); border-radius: 6px; padding: 5px 10px; color: #fff; font-family: var(--font-sans); font-size: 11px; outline: none; }
    .game-search-input:focus { border-color: var(--accent-cyan); }
    .res-toggles { display: flex; gap: 3px; background: rgba(0,0,0,0.3); padding: 2px; border-radius: 6px; border: 1px solid var(--border-panel); flex-shrink: 0; }
    .res-btn { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; border: none; background: transparent; color: var(--text-dim); cursor: pointer; transition: all 0.15s; }
    .res-btn:hover { color: #fff; }
    .res-btn.active { background: #fff; color: #000; font-weight: 800; }

    /* Carousel Nav Arrows in the Header (Clean & Unobstructed!) */
    .tray-carousel-nav { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }
    .tray-header-nav-btn { width: 26px; height: 24px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-panel); border-radius: 5px; color: var(--text-dim); font-size: 15px; font-weight: 800; line-height: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .tray-header-nav-btn:hover { background: var(--accent-cyan); color: #000; border-color: var(--accent-cyan); transform: translateY(-1px); box-shadow: 0 0 8px rgba(16, 240, 106, 0.3); }

    /* Custom Moving Carousel Wrapper - Completely Open & Unobstructed */
    .game-carousel-wrap { position: relative; width: 100%; overflow: hidden; display: flex; align-items: center; }

    /* ZERO NATIVE SCROLLBAR - Drag & Cursor Inspection */
    .game-grid { display: flex; gap: 12px; overflow-x: auto; padding: 2px 2px; width: 100%; cursor: grab; scrollbar-width: none !important; -ms-overflow-style: none !important; scroll-behavior: smooth; }
    .game-grid::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
    .game-grid.grabbing { cursor: grabbing !important; scroll-behavior: auto !important; }

    .game-card { width: 180px; flex-shrink: 0; background: var(--bg-card); border: 1px solid var(--border-panel); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.25s ease; transform-style: preserve-3d; }
    .game-card:hover { transform: translateY(-4px) scale(1.02); border-color: var(--accent-cyan); box-shadow: 0 10px 24px rgba(16, 240, 106, 0.18); }
    .game-banner-box { width: 100%; height: 60px; overflow: hidden; background: #000; position: relative; }
    .game-banner-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .game-card:hover .game-banner-box img { transform: scale(1.04); }
    .game-meta-box { padding: 9px 10px; display: flex; flex-direction: column; gap: 5px; }
    .game-title { font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #f1f5f9; font-family: var(--font-sans); }
    .game-fps-row { display: flex; justify-content: space-between; align-items: baseline; }
    .game-fps { font-family: var(--font-mono); font-size: 18px; font-weight: 800; color: #fff; text-shadow: 0 0 10px rgba(16, 240, 106, 0.2); }
    .game-fps-unit { font-size: 10px; color: var(--accent-cyan); font-weight: 700; margin-left: 2px; }
    .game-preset-tag { font-size: 9px; font-family: var(--font-mono); font-weight: 700; color: #84cc16; background: rgba(132, 204, 22, 0.12); padding: 2px 5px; border-radius: 4px; border: 1px solid rgba(132, 204, 22, 0.25); }
    .game-sub { display: flex; justify-content: space-between; font-size: 9px; font-family: var(--font-mono); color: var(--text-muted); }
    .bench-sub-stat { display: flex; align-items: baseline; gap: 3px; }
    .stat-lbl { color: var(--text-dim); font-size: 8.5px; }
    .stat-val { color: #cbd5e1; font-weight: 700; }
    .bottle-bar { width: 100%; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; display: flex; margin-top: 2px; }
    .bottle-fill { height: 100%; background: linear-gradient(90deg, #10f06a, #84cc16); border-radius: 2px; transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

    /* 3D Floating Part Labels */
    .part-label-tag { position: absolute; pointer-events: none !important; user-select: none; transform: translate(-50%, -100%); transition: opacity 0.2s; z-index: 5; }
    .part-label-content { pointer-events: none !important; background: rgba(13, 17, 26, 0.92); backdrop-filter: blur(12px); border: 1px solid rgba(16, 240, 106, 0.45); padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 9.5px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.6); }
    .part-label-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent-cyan); box-shadow: 0 0 8px var(--accent-cyan); }
    .part-label-arrow { width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid rgba(16, 240, 106, 0.45); margin: 0 auto; }

    /* Interactive Holographic HUD Cursor Inspection Chip */
    .cursor-inspect-chip { position: absolute; pointer-events: none; z-index: 25; background: rgba(10, 15, 24, 0.92); backdrop-filter: blur(12px); border: 1px solid var(--accent-cyan); padding: 6px 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 10px; color: #fff; display: none; transform: translate(15px, 15px); box-shadow: 0 8px 24px rgba(0,0,0,0.6); }
    .cursor-inspect-title { color: var(--accent-cyan); font-weight: 800; font-size: 11px; margin-bottom: 2px; }
    .cursor-inspect-sub { color: #94a3b8; font-size: 9px; }

    /* Visual Click Toast */
    .interact-toast { position: absolute; top: 72px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.95); border: 1px solid var(--accent-cyan); color: #fff; font-family: var(--font-mono); font-size: 11px; padding: 6px 14px; border-radius: 6px; pointer-events: none; z-index: 20; opacity: 0; transition: opacity 0.3s; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <div id="viewport-container"></div>
  <div id="labels-container" style="display: none;"></div>
  <div class="interact-toast" id="interact-toast"></div>
  <div class="cursor-inspect-chip" id="cursor-inspect-chip">
    <div class="cursor-inspect-title" id="chip-title">PART INSPECTION</div>
    <div class="cursor-inspect-sub" id="chip-sub">Ready to inspect</div>
  </div>

  <!-- Floating Re-Open Buttons when panels are closed -->
  <button class="floating-reopen-btn right-edge" id="btn-reopen-sidebar">
    <span>HARDWARE RIG</span>
    <span class="rig-counter-badge" id="reopen-rig-badge"><span class="badge-num" id="reopen-badge-rig-count">8</span><span class="badge-sep">/</span><span class="badge-total">8</span></span>
  </button>
  <button class="floating-reopen-btn bottom-edge" id="btn-reopen-bench">
    <span>GAMING BENCHMARKS</span>
    <span class="reopen-badge">FPS TELEMETRY</span>
  </button>

  <!-- Telemetry Header -->
  <div class="spatial-hud" id="spatial-hud">
    <div class="hud-header">
      <div class="brand-cluster">
        <div class="brand-logo-badge">RIG STUDIO</div>
        <div>
          <div class="brand-title">PC Hardware Architect</div>
          <div class="brand-tag">3D Mechanical Rig & Hardware Telemetry</div>
        </div>
      </div>
      <div class="telemetry-row">
        <div class="telem-item">
          <span class="telem-lbl">Estimated Price</span>
          <span class="telem-val" id="telem-cost">$0</span>
        </div>
        <div class="telem-item">
          <span class="telem-lbl">Peak Draw</span>
          <span class="telem-val"><span id="telem-power">50</span><span class="telem-unit">W</span></span>
        </div>
        <div class="telem-item">
          <span class="telem-lbl">Core Temps</span>
          <span class="telem-val"><span id="telem-thermal-cpu">28</span><span class="telem-unit">°C</span> / <span id="telem-thermal-gpu">26</span><span class="telem-unit">°C</span></span>
        </div>
        <button class="compat-badge" id="compat-status-btn">Clearances Verified</button>
      </div>
    </div>
  </div>

  <!-- 3D Viewport Controls & Navigation Bar -->
  <div class="viewport-tools" id="viewport-tools">
    <!-- Camera View Presets -->
    <div class="tool-group">
      <button class="tool-btn active" id="btn-cam-iso">ISO 3D</button>
      <button class="tool-btn" id="btn-cam-front">FRONT</button>
      <button class="tool-btn" id="btn-cam-top">TOP</button>
      <button class="tool-btn" id="btn-cam-side">SIDE</button>
      <button class="tool-btn" id="btn-auto-rotate">AUTO ORBIT</button>
    </div>

    <!-- Zoom In/Out & Distance Range Slider -->
    <div class="tool-group">
      <button class="tool-btn zoom-btn" id="btn-zoom-in">+</button>
      <div class="zoom-slider-wrap">
        <input type="range" id="cam-zoom-slider" min="50" max="900" value="390" step="5" />
      </div>
      <button class="tool-btn zoom-btn" id="btn-zoom-out">-</button>
      <button class="tool-btn" id="btn-reset-cam">RESET</button>
    </div>

    <!-- 3D Inspection Tools & Labels Toggle -->
    <div class="tool-group">
      <button class="tool-btn" id="btn-toggle-labels">LABELS: OFF</button>
      <button class="tool-btn" id="btn-glass">GLASS</button>
      <button class="tool-btn" id="btn-explode">EXPLODE</button>
      <button class="tool-btn" id="btn-wireframe">WIREFRAME</button>
      <button class="tool-btn" id="btn-thermal">HEATMAP</button>
      <button class="tool-btn stress-btn" id="btn-stress">STRESS 100%</button>
    </div>

    <!-- Lighting Profiles (Studio, Lime Neon, Stealth) -->
    <div class="tool-group">
      <button class="tool-btn active" data-light="studio">STUDIO</button>
      <button class="tool-btn" data-light="ice">ICE GLOW</button>
      <button class="tool-btn" data-light="stealth">STEALTH</button>
    </div>
    <div class="tool-group">
      <button class="tool-btn" id="btn-quick-bench" style="color: #10f06a; border-color: rgba(16, 240, 106, 0.4); background: rgba(16, 240, 106, 0.1);">FPS BENCHMARKS</button>
    </div>
  </div>

  <!-- Workstation Multi-Panel Sidebar -->
  <div class="workstation-sidebar" id="workstation-sidebar">
    <div class="sidebar-header-bar">
      <div class="panel-switcher-tabs">
        <button class="tab-switch-btn active" data-tab="chosen">My Rig <span class="rig-counter-badge" id="tab-chosen-badge"><span class="badge-num" id="badge-rig-count">8</span><span class="badge-sep">/</span><span class="badge-total">8</span></span></button>
        <button class="tab-switch-btn" data-tab="catalog">Catalog</button>
        <button class="tab-switch-btn" data-tab="build">Specs</button>
        <button class="tab-switch-btn" data-tab="market">Deals</button>
        <button class="tab-switch-btn" data-tab="thermal">Thermals</button>
      </div>
      <button class="panel-close-btn" id="btn-close-sidebar" aria-label="Close Sidebar">✕</button>
    </div>

    <!-- VIEW 0: CHOSEN RIG SETUP (The user's configured PC parts tab) -->
    <div class="panel-view" id="view-chosen">
      <div class="chosen-rig-container" id="chosen-rig-container"></div>
    </div>

    <!-- VIEW 1: CATALOG -->
    <div class="panel-view" id="view-catalog" style="display: none;">
      <div class="catalog-search-bar">
        <input type="text" class="search-input" id="part-search-input" placeholder="Filter components by name, socket, specs..." />
        <select class="sort-select" id="part-sort-select">
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="power">Power Draw</option>
        </select>
      </div>
      <div class="category-nav" id="category-nav">
        <button class="cat-btn active" data-cat="all">All</button>
        <button class="cat-btn" data-cat="cpu">CPU</button>
        <button class="cat-btn" data-cat="gpu">GPU</button>
        <button class="cat-btn" data-cat="mb">Motherboard</button>
        <button class="cat-btn" data-cat="ram">RAM</button>
        <button class="cat-btn" data-cat="cooler">Cooler</button>
        <button class="cat-btn" data-cat="storage">SSD</button>
        <button class="cat-btn" data-cat="psu">PSU</button>
        <button class="cat-btn" data-cat="chassis">Case</button>
      </div>
      <div class="component-feed" id="component-feed"></div>
    </div>


    <!-- VIEW 2: ACTIVE BUILD SPEC -->
    <div class="panel-view" id="view-build" style="display: none;">
      <div class="spec-sheet-container" id="spec-sheet-container"></div>
    </div>

    <!-- VIEW 3: LIVE MARKET DEALS & CRAWLER -->
    <div class="panel-view" id="view-market" style="display: none;">
      <div class="market-view-container" id="market-view-container"></div>
    </div>

    <!-- VIEW 4: THERMAL & ACOUSTICS BENCH -->
    <div class="panel-view" id="view-thermal" style="display: none;">
      <div class="spec-sheet-container" id="thermal-bench-container"></div>
    </div>
  </div>

  <!-- Floating Bottom Gaming Benchmark Tray: Custom Moving Carousel (No Native White Bar!) -->
  <div class="benchmark-tray" id="benchmark-tray">
    <div class="tray-header">
      <div class="tray-title-cluster">
        <div class="tray-title">REAL-WORLD GAMING BENCHMARKS</div>
        <div class="tray-subtitle">Simulated Ray Tracing & Frametime Telemetry</div>
      </div>
      <div class="game-search-box">
        <input type="text" class="game-search-input" id="game-search-input" placeholder="Search benchmarks (Cyberpunk, Wukong, CS2)..." />
      </div>
      <div class="res-toggles">
        <button class="res-btn" data-res="1080p">1080p FHD</button>
        <button class="res-btn active" data-res="1440p">1440p QHD</button>
        <button class="res-btn" data-res="4k">4K UHD</button>
      </div>
      <div class="tray-carousel-nav">
        <button class="tray-header-nav-btn" id="tray-nav-left" aria-label="Previous Games">‹</button>
        <button class="tray-header-nav-btn" id="tray-nav-right" aria-label="Next Games">›</button>
      </div>
      <button class="panel-close-btn" id="btn-close-bench" aria-label="Hide Gaming Benchmarks">✕</button>
    </div>
    
    <div class="game-carousel-wrap">
      <div class="game-grid" id="game-grid"></div>
    </div>
  </div>

  <script>
    const activeBuild = { cpu: null, gpu: null, motherboard: null, memory: null, storage: null, cooler: null, psu: null, chassis: null };
    let currentResolution = '1440p';
    let allComponents = [];
    let liveMarketQuotes = {};
    let crawlerTerminalLogs = [
      '[INIT] Authentic Open Hardware Dataset Engine Ready',
      '[INDEX] Connected to GitHub docyx/pc-part-dataset (45,951 retail records)',
      '[STATUS] Catalog Components Matched with Real Scraped Retail Prices'
    ];
    let isCrawlingLive = false;
    let applyRealMarketPrices = false;
    let rawJsonExpanded = {};
    let currentBenchmarkList = [];
    let activeTab = 'chosen';
    let activeCategory = 'all';
    let exploded = false;
    let explodeProgress = 0;
    let wireframeMode = false;
    let thermalMode = false;
    let showGlass = false;
    let stressActive = false;
    let showLabels = false;
    let currentCpuTemp = 28;
    let currentGpuTemp = 26;
    let activeLightMode = 'studio';
    let selectedFanProfile = 'balanced';
    let aioDisplayMetric = 0; // 0 = CPU Temp, 1 = Coolant Temp, 2 = Pump RPM

    // Verified Authentic Real Product Images Map (100% Real Hardware Photos)
    const REAL_PRODUCT_IMAGES = {
      // CPUs
      'cpu_7950x3d': 'https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505503-ryzen-7-7800x3d-front.jpg',
      'cpu_7800x3d': 'https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505503-ryzen-7-7800x3d-front.jpg',
      'cpu_14900ks': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80',
      'cpu_14900k': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80',
      'cpu_14700k': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80',
      'cpu_7600x': 'https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505503-ryzen-7-7800x3d-front.jpg',
      'cpu_14600k': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80',
      'cpu_5800x3d': 'https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505503-ryzen-7-7800x3d-front.jpg',

      // GPUs
      'gpu_rtx_4090_fe': 'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-full-screen-3840-1.jpg',
      'gpu_rtx_4090': 'https://dlcdnwebimgs.asus.com/gain/EFF9D6D8-2F6C-4E76-989F-E5DB594052BA/w1000/h732',
      'gpu_rtx_4080s': 'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-full-screen-3840-1.jpg',
      'gpu_rtx_4070_ti_s': 'https://dlcdnwebimgs.asus.com/gain/EFF9D6D8-2F6C-4E76-989F-E5DB594052BA/w1000/h732',
      'gpu_rtx_4070s': 'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-full-screen-3840-1.jpg',
      'gpu_rx_7900xtx': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80',
      'gpu_rx_7900xt': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80',
      'gpu_rx_7800xt': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80',
      'gpu_rtx_4060': 'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-full-screen-3840-1.jpg',

      // Motherboards
      'mb_z790_dark_hero': 'https://dlcdnwebimgs.asus.com/gain/3D431110-3C12-421F-B955-4927CD2B40D8/w1000/h732',
      'mb_b650e': 'https://dlcdnwebimgs.asus.com/gain/0F27F993-9C9D-42FF-A8FE-27C81A0837BA/w1000/h732',
      'mb_z790': 'https://dlcdnwebimgs.asus.com/gain/3D431110-3C12-421F-B955-4927CD2B40D8/w1000/h732',
      'mb_x670e_aorus': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80',
      'mb_b650_tomahawk': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80',
      'mb_b760_itx': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80',
      'mb_b650m': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80',

      // RAM
      'ram_dominator_titanium_64gb': 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80',
      'ram_dominator_64gb': 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80',
      'ram_vengeance_rgb_32gb': 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80',
      'ram_trident_32gb': 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80',
      'ram_vengeance_32gb': 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80',

      // Storage
      'ssd_mp700_pro_4tb': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80',
      'ssd_samsung_990pro': 'https://images.samsung.com/is/image/samsung/p6pim/in/mz-v9p2t0bw/gallery/in-990pro-nvme-m2-ssd-mz-v9p2t0bw-534630688?$1164_776_PNG$',
      'ssd_crucial_t700': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80',
      'ssd_sn850x': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80',

      // Coolers
      'cooler_icue_titan_360': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'cooler_h150i_lcd': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'cooler_kraken_elite_360': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'cooler_arctic_360': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'cooler_nh_d15': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'cooler_a115': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'cooler_peerless_120': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',

      // PSUs
      'psu_rm1000x_shift': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'psu_hx1500i': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'psu_seasonic_1000w': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'psu_corsair_750w': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      'psu_bequiet_1200w': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',

      // Cases
      'case_5000d_airflow': 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=500&auto=format&fit=crop&q=80',
      'case_4000d_airflow': 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=500&auto=format&fit=crop&q=80',
      'case_o11_evo': 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=500&auto=format&fit=crop&q=80',
      'case_north': 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=500&auto=format&fit=crop&q=80',
      'case_terra': 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=500&auto=format&fit=crop&q=80'
    };

    const CATEGORY_FALLBACK_IMAGES = {
      processor: 'https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505503-ryzen-7-7800x3d-front.jpg',
      graphics_card: 'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-full-screen-3840-1.jpg',
      motherboard: 'https://dlcdnwebimgs.asus.com/gain/0F27F993-9C9D-42FF-A8FE-27C81A0837BA/w1000/h732',
      memory: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80',
      storage: 'https://images.samsung.com/is/image/samsung/p6pim/in/mz-v9p2t0bw/gallery/in-990pro-nvme-m2-ssd-mz-v9p2t0bw-534630688?$1164_776_PNG$',
      cooler: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      power_supply: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80',
      chassis: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=500&auto=format&fit=crop&q=80'
    };

    // Verified Steam CDN Capsule Artwork
    const STEAM_GAME_ASSETS = {
      'Cyberpunk 2077': { appId: 1091500, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg', genre: 'Ray Tracing' },
      'Black Myth: Wukong': { appId: 2358720, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg', genre: 'Unreal Engine 5' },
      'Counter-Strike 2': { appId: 730, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg', genre: 'Esports' },
      'Red Dead Redemption 2': { appId: 1174180, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg', genre: 'Open World' },
      'Shadow of the Tomb Raider': { appId: 750920, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/750920/header.jpg', genre: 'Action' },
      'Hogwarts Legacy': { appId: 990080, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg', genre: 'Open World' },
      'Elden Ring': { appId: 1245620, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg', genre: 'Action RPG' },
      'Starfield': { appId: 1716740, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg', genre: 'Space RPG' },
      'Forza Horizon 5': { appId: 1551360, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg', genre: 'Racing' },
      'Baldur\\'s Gate 3': { appId: 1086940, header: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg', genre: 'RPG' }
    };

    // Three.js Scene Setup with Realistic Analytical Lighting & Studio Reflections
    const container = document.getElementById('viewport-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.0009);

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2400);
    camera.position.set(240, 180, 290);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Generate Studio Reflection Environment for Photorealistic Metallic Gleam
    function createStudioEnvironment(renderer) {
      const envScene = new THREE.Scene();
      const p1 = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      p1.position.set(0, 60, 0);
      p1.rotation.x = Math.PI / 2;
      envScene.add(p1);

      const p2 = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), new THREE.MeshBasicMaterial({ color: 0x10f06a }));
      p2.position.set(60, 20, 0);
      p2.rotation.y = -Math.PI / 2;
      envScene.add(p2);

      const p3 = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), new THREE.MeshBasicMaterial({ color: 0x84cc16 }));
      p3.position.set(-60, 20, 0);
      p3.rotation.y = Math.PI / 2;
      envScene.add(p3);

      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const envMap = pmrem.fromScene(envScene).texture;
      pmrem.dispose();
      return envMap;
    }
    const studioEnv = createStudioEnvironment(renderer);
    scene.environment = studioEnv;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.90; // Free tilting around without cutoff
    controls.minPolarAngle = 0.05;          // Direct overhead plan view
    controls.minDistance = 25;              // Zoom right into CPU/GPU/RAM
    controls.maxDistance = 1400;            // Wide panorama without clipping
    controls.screenSpacePanning = true;
    controls.target.set(0, 42, 0);

    // Smooth Camera Transition State
    let isCameraTransitioning = false;
    const targetCameraPos = new THREE.Vector3(240, 180, 290);
    const targetCameraTarget = new THREE.Vector3(0, 42, 0);

    function smoothTransitionCamera(newPos, newTarget) {
      targetCameraPos.copy(newPos);
      if (newTarget) targetCameraTarget.copy(newTarget);
      isCameraTransitioning = true;
    }

    renderer.domElement.addEventListener('pointerdown', () => {
      isCameraTransitioning = false;
      targetCameraPos.copy(camera.position);
      targetCameraTarget.copy(controls.target);
    });

    // Smooth Rolling Number Counter Animation (Ease-Out Cubic)
    function animateRollingNumber(element, startVal, endVal, duration = 400, formatter = v => Math.round(v).toString()) {
      if (!element) return;
      const start = (typeof startVal === 'number' && !isNaN(startVal)) ? startVal : 0;
      const end = (typeof endVal === 'number' && !isNaN(endVal)) ? endVal : 0;
      element._animTargetVal = end;

      if (Math.abs(end - start) < 0.001) {
        const res = formatter(end);
        if (typeof res === 'string' && res.includes('<')) element.innerHTML = res;
        else element.textContent = res;
        return;
      }

      const startTime = performance.now();
      const diff = end - start;

      function updateNumber(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = start + diff * ease;
        const formatted = formatter(current);
        if (typeof formatted === 'string' && formatted.includes('<')) {
          element.innerHTML = formatted;
        } else {
          element.textContent = formatted;
        }

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          const finalFormatted = formatter(end);
          if (typeof finalFormatted === 'string' && finalFormatted.includes('<')) {
            element.innerHTML = finalFormatted;
          } else {
            element.textContent = finalFormatted;
          }
        }
      }
      requestAnimationFrame(updateNumber);
    }

    // Studio 3-Point Lighting Setup with Rich Contrast
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x141824, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(220, 320, 200);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 1.2);
    fillLight.position.set(-200, 180, -160);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf1f5f9, 1.3);
    rimLight.position.set(0, 180, -260);
    scene.add(rimLight);

    // Workbench Pedestal
    const benchGroup = new THREE.Group();
    scene.add(benchGroup);

    const pedestalGeo = new THREE.CylinderGeometry(200, 205, 12, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x0c0f16, metalness: 0.92, roughness: 0.35 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -6;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const gridCircle = new THREE.PolarGridHelper(195, 16, 8, 64, 0x334155, 0x1e293b);
    gridCircle.position.y = 0.2;
    scene.add(gridCircle);

    // Modern Architectural Dual-Chamber Chassis Frame (Zero Giant Scaffolding Posts & Zero Obstructing Deck Boxes)
    const rigChassis = new THREE.Group();
    benchGroup.add(rigChassis);

    // 1. Lower Chassis Basement Pedestal (Houses PSU & Drive Bay strictly underneath the deck)
    const lowerBasement = new THREE.Mesh(
      new THREE.BoxGeometry(254, 18, 224),
      new THREE.MeshStandardMaterial({ color: 0x0f121a, metalness: 0.88, roughness: 0.32 })
    );
    lowerBasement.position.set(0, -1, 0);
    lowerBasement.receiveShadow = true;
    lowerBasement.castShadow = true;
    rigChassis.add(lowerBasement);

    // Front/Side Lower Basement Skirt Bevel
    const skirtBevel = new THREE.Mesh(
      new THREE.BoxGeometry(256, 2, 226),
      new THREE.MeshStandardMaterial({ color: 0x1e2433, metalness: 0.92, roughness: 0.22 })
    );
    skirtBevel.position.set(0, -10, 0);
    rigChassis.add(skirtBevel);

    // Lower PSU Showcase Window Cutout (On the lower front skirt, underneath the motherboard level)
    const psuCutoutFrame = new THREE.Mesh(
      new THREE.BoxGeometry(92, 12, 2),
      new THREE.MeshStandardMaterial({ color: 0x222938, metalness: 0.95, roughness: 0.2 })
    );
    psuCutoutFrame.position.set(-75, -1, 112.5);
    rigChassis.add(psuCutoutFrame);

    // 2. Main Workstation Motherboard Deck (Completely unobstructed, zero blocking boxes!)
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(260, 4, 230),
      new THREE.MeshStandardMaterial({ color: 0x141824, metalness: 0.85, roughness: 0.25 })
    );
    basePlate.position.set(0, 9, 0);
    basePlate.receiveShadow = true;
    basePlate.castShadow = true;
    rigChassis.add(basePlate);

    // Rubber Cable Pass-Through Grommets in Deck Floor
    const deckGrommetMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.9 });
    [ [-35, 9, 50], [55, 9, 50], [80, 9, -10] ].forEach(([gx, gy, gz]) => {
      const dg = new THREE.Mesh(new THREE.BoxGeometry(20, 4.4, 10), deckGrommetMat);
      dg.position.set(gx, gy, gz);
      rigChassis.add(dg);
    });

    // 4 Heavy-Duty Anti-Vibration Cylindrical Feet
    [ [-115, -100], [115, -100], [-115, 100], [115, 100] ].forEach(([fx, fz]) => {
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(9, 9, 6, 24),
        new THREE.MeshStandardMaterial({ color: 0x08090d, roughness: 0.85 })
      );
      foot.position.set(fx, -13, fz);
      rigChassis.add(foot);
    });

    // 3. Motherboard Tray Backplate (Stands cleanly behind the motherboard at Z = -108)
    const mbTray = new THREE.Mesh(
      new THREE.BoxGeometry(200, 185, 3),
      new THREE.MeshStandardMaterial({ color: 0x12151f, metalness: 0.88, roughness: 0.32 })
    );
    mbTray.position.set(0, 105, -108);
    mbTray.castShadow = true;
    rigChassis.add(mbTray);

    // Rubber Cable Grommets on Tray
    const grommetMat = new THREE.MeshStandardMaterial({ color: 0x090c12, roughness: 0.9 });
    [ [85, 75], [85, 130], [-85, 75] ].forEach(([gx, gy]) => {
      const grommet = new THREE.Mesh(new THREE.BoxGeometry(8, 28, 4), grommetMat);
      grommet.position.set(gx, gy, -108);
      rigChassis.add(grommet);
    });

    // Rear Corner Structural Pillars
    const cornerPillarMat = new THREE.MeshStandardMaterial({ color: 0x1f2434, metalness: 0.92, roughness: 0.22 });
    [-115, 115].forEach(cx => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(6, 205, 8), cornerPillarMat);
      pillar.position.set(cx, 95, -108);
      pillar.castShadow = true;
      rigChassis.add(pillar);
    });

    // 4. Sleek Top Chassis Radiator Ceiling Rail (Mounts the 360mm AIO Flush!)
    const topCeiling = new THREE.Mesh(
      new THREE.BoxGeometry(235, 6, 65),
      new THREE.MeshStandardMaterial({ color: 0x181d2a, metalness: 0.9, roughness: 0.25 })
    );
    topCeiling.position.set(0, 202, -35);
    topCeiling.castShadow = true;
    rigChassis.add(topCeiling);

    // Brass Motherboard Standoffs (Elevates motherboard cleanly to Y = 16.6)
    const standoffMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    [ [-80, -30], [80, -30], [-80, 25], [80, 25] ].forEach(([x, z]) => {
      const so = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 5.6, 16), standoffMat);
      so.position.set(x, 13.8, z);
      so.castShadow = true;
      rigChassis.add(so);
    });

    // Chassis Rear Expansion Slot Frame (At rear left where GPU bracket locks in)
    const pcieRearFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3, 62, 52),
      new THREE.MeshStandardMaterial({ color: 0x222736, metalness: 0.92, roughness: 0.25 })
    );
    pcieRearFrame.position.set(-47.5, 50, 32);
    pcieRearFrame.castShadow = true;
    rigChassis.add(pcieRearFrame);

    // Anti-Sag GPU Support Post (Sturdily supporting the front-right edge of the GPU)
    const gpuBracket = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 4.5, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 })
    );
    gpuBracket.position.set(118, 17, 46);
    gpuBracket.castShadow = true;
    const gpuCradle = new THREE.Mesh(
      new THREE.BoxGeometry(10, 3, 10),
      new THREE.MeshStandardMaterial({ color: 0x10f06a, metalness: 0.8, roughness: 0.2 })
    );
    gpuCradle.position.set(118, 25, 46);
    rigChassis.add(gpuBracket, gpuCradle);

    const meshNodes = {
      motherboard: null,
      cpu: null,
      cooler: null,
      coolerFanList: [],
      ram: null,
      gpu: null,
      gpuFanList: [],
      gpuHeatpipes: [],
      gpuLogoMat: null,
      psu: null,
      storage: null,
      glassPanel: null,
      aioCanvas: null,
      aioTexture: null,
      aioScreenMesh: null
    };

    function createAioLcdTexture() {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      meshNodes.aioCanvas = c;
      const tex = new THREE.CanvasTexture(c);
      meshNodes.aioTexture = tex;
      updateAioLcdDisplay();
      return tex;
    }

    function updateAioLcdDisplay() {
      if (!meshNodes.aioCanvas) return;
      const c = meshNodes.aioCanvas;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, 256, 256);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(128, 128, 112, 0, Math.PI * 2);
      ctx.stroke();

      const tempNorm = Math.min(Math.max((currentCpuTemp - 20) / 75, 0), 1);
      const arcColor = currentCpuTemp > 80 ? '#ef4444' : currentCpuTemp > 65 ? '#f59e0b' : '#10f06a';
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(128, 128, 112, -Math.PI / 2, -Math.PI / 2 + tempNorm * Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';

      if (aioDisplayMetric === 0) {
        ctx.fillText('CPU TEMPERATURE', 128, 75);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 66px monospace';
        ctx.fillText(Math.round(currentCpuTemp) + '°C', 128, 142);
        ctx.fillStyle = arcColor;
        ctx.font = 'bold 16px monospace';
        const rpm = stressActive ? '2750 RPM' : (selectedFanProfile === 'silent' ? '820 RPM' : '1420 RPM');
        ctx.fillText(rpm, 128, 185);
      } else if (aioDisplayMetric === 1) {
        ctx.fillText('COOLANT TEMP', 128, 75);
        ctx.fillStyle = '#84cc16';
        ctx.font = '900 66px monospace';
        const coolant = Math.round(24 + currentCpuTemp * 0.18);
        ctx.fillText(coolant + '°C', 128, 142);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('FLOW: 2.4 L/MIN', 128, 185);
      } else {
        ctx.fillText('PEAK SYSTEM DRAW', 128, 75);
        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 60px monospace';
        const pwr = stressActive ? '680W' : '240W';
        ctx.fillText(pwr, 128, 142);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('EFFICIENCY: 94.2%', 128, 185);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.fillText('AIO PUMP OLED (CLICK TO CYCLE)', 128, 218);

      if (meshNodes.aioTexture) meshNodes.aioTexture.needsUpdate = true;
    }

    // =========================================================================
    // Photorealistic Procedural Texture Generators (HTML5 Canvas -> CanvasTexture)
    // =========================================================================

    function createMotherboardPcbTexture() {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1024;
      const ctx = c.getContext('2d');

      // Deep Matte Obsidian Circuit Board Substrate
      ctx.fillStyle = '#0b0e16';
      ctx.fillRect(0, 0, 1024, 1024);

      // Micro Carbon Hex Pattern in Board Substrate
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1024; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, 1024);
        ctx.moveTo(0, x); ctx.lineTo(1024, x);
        ctx.stroke();
      }

      // High-Speed Gold Signal Traces Radiating from CPU Socket
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.8;
      for (let t = 0; t < 32; t++) {
        ctx.beginPath();
        const startX = 410 + (t % 8) * 28;
        const startY = 460 + Math.floor(t / 8) * 14;
        ctx.moveTo(startX, startY);
        const midX = startX + (t > 16 ? 130 : -130);
        const midY = startY + (t > 16 ? 130 : 170);
        ctx.lineTo(midX, midY);
        ctx.lineTo(midX + (t > 16 ? 190 : -90), midY + 95);
        ctx.stroke();

        // Gold Solder Vias
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(startX, startY, 2.5, 0, Math.PI * 2);
        ctx.arc(midX + (t > 16 ? 190 : -90), midY + 95, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Audio Isolation Gold Trace Line
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(60, 520);
      ctx.lineTo(190, 520);
      ctx.lineTo(190, 940);
      ctx.stroke();

      // Silkscreen Technical Component Designation Markings
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('ROG MAXIMUS HERO ARCHITECT', 220, 140);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('SOCKET AM5 / LGA-1718 HIGH-DENSITY BUS', 360, 300);
      ctx.fillText('PCIEX16(G5)_1 STEEL SAFESLOT', 220, 740);
      ctx.fillText('DDR5 DUAL CHANNEL 8000+ MT/s OC', 720, 260);
      ctx.fillText('M.2_1 PCIe 5.0 x4 (NVMe SSD ARMOR)', 460, 590);
      ctx.fillText('SUPREMEFX ALC4082 HD AUDIO CODEC', 70, 780);

      // High-Frequency SMT Capacitor & Resistor Arrays
      for (let cIdx = 0; cIdx < 16; cIdx++) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(80, 550 + cIdx * 24, 14, 16);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(82, 550 + cIdx * 24, 10, 3);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      return tex;
    }

    function createGpuShroudTexture(isFounders, isStrix) {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d');

      // Gunmetal Obsidian Brushed Armor Base
      const baseGrad = ctx.createLinearGradient(0, 0, 1024, 512);
      baseGrad.addColorStop(0, '#131722');
      baseGrad.addColorStop(0.5, '#1b212e');
      baseGrad.addColorStop(1, '#10141d');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Diagonal Carbon-Weave Geometric Accent Panels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      for (let i = 0; i < 1024; i += 8) {
        ctx.fillRect(i, 0, 4, 512);
      }

      // Outer Beveled Rings & Deep Intake Wells for 3 Fan Ports
      const fanPositions = [180, 512, 844];
      fanPositions.forEach(fx => {
        // Deep Intake Shadow Well
        const wellGrad = ctx.createRadialGradient(fx, 256, 110, fx, 256, 145);
        wellGrad.addColorStop(0, '#05070a');
        wellGrad.addColorStop(0.85, '#0b0f17');
        wellGrad.addColorStop(1, '#1a202c');
        ctx.fillStyle = wellGrad;
        ctx.beginPath();
        ctx.arc(fx, 256, 145, 0, Math.PI * 2);
        ctx.fill();

        // Polished Silver Chamfered Cowl Ring
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(fx, 256, 146, 0, Math.PI * 2);
        ctx.stroke();

        // Laser-Cut Hex Vent Grille Patterns
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let gx = fx - 32; gx <= fx + 32; gx += 14) {
          ctx.fillRect(gx, 32, 7, 26);
          ctx.fillRect(gx, 454, 7, 26);
        }
      });

      // Precision CNC Chamfer Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, 996, 484);

      // Authentic Laser-Etched Typography
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('GEFORCE RTX', 42, 68);
      ctx.fillStyle = '#10f06a';
      ctx.font = '900 19px monospace';
      ctx.fillText('4080 SUPER // 16GB G6X', 42, 96);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('TRIPLE AXIAL-TECH // AIRFLOW 3.5X', 980, 68);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.fillText('NVIDIA ADA LOVELACE ARCHITECTURE', 980, 92);

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      return tex;
    }

    function createGpuFanTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      const cx = 256, cy = 256;

      // Outer Axial-Tech Barrier Ring
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#141822';
      ctx.beginPath();
      ctx.arc(cx, cy, 238, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Specular Highlight on Barrier Ring
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(cx, cy, 243, 0, Math.PI * 2);
      ctx.stroke();

      // 9 Swept Aerodynamic Sickle Airfoil Blades
      const bladeCount = 9;
      for (let b = 0; b < bladeCount; b++) {
        const angle = (b * Math.PI * 2) / bladeCount;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Curved Airfoil Blade Path
        ctx.beginPath();
        ctx.moveTo(52, -14);
        ctx.bezierCurveTo(95, -24, 175, -34, 238, -8);
        ctx.arc(0, 0, 238, -0.034, 0.24, false);
        ctx.bezierCurveTo(185, 54, 115, 46, 56, 22);
        ctx.closePath();

        // Specular Shading Gradient along Blade Sweep
        const grad = ctx.createLinearGradient(50, -20, 238, 45);
        grad.addColorStop(0, '#0e121a');
        grad.addColorStop(0.3, '#1c2230');
        grad.addColorStop(0.65, '#283144');
        grad.addColorStop(0.85, '#1e2434');
        grad.addColorStop(1, '#11151e');
        ctx.fillStyle = grad;
        ctx.fill();

        // Sharp Aerodynamic Leading Edge Highlight
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.moveTo(52, -14);
        ctx.bezierCurveTo(95, -24, 175, -34, 238, -8);
        ctx.stroke();

        // Deep Drop-Shadow on Trailing Edge for 3D Overlapping Depth
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.moveTo(238, 56);
        ctx.bezierCurveTo(185, 54, 115, 46, 56, 22);
        ctx.stroke();

        ctx.restore();
      }

      // Central Spinner Hub (Radial Metallic Gradient)
      const hubGrad = ctx.createRadialGradient(cx - 15, cy - 15, 8, cx, cy, 68);
      hubGrad.addColorStop(0, '#384357');
      hubGrad.addColorStop(0.45, '#161b26');
      hubGrad.addColorStop(1, '#090c12');
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 68, 0, Math.PI * 2);
      ctx.fill();

      // Hub Outer Bezel
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Brushed Metallic Center Badge
      const badgeGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 48);
      badgeGrad.addColorStop(0, '#f1f5f9');
      badgeGrad.addColorStop(0.65, '#94a3b8');
      badgeGrad.addColorStop(1, '#334155');
      ctx.fillStyle = badgeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.fill();

      // Inner Metallic Ring
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(cx, cy, 44, 0, Math.PI * 2);
      ctx.stroke();

      // Center Emblem Typography
      ctx.fillStyle = '#090b10';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GEFORCE', cx, cy - 6);
      ctx.fillStyle = '#10f06a';
      ctx.font = '900 13px sans-serif';
      ctx.fillText('RTX', cx, cy + 8);

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      return tex;
    }

    // =========================================================================
    // High-Realism Procedural 3D Hardware Meshes
    // =========================================================================

    function buildMotherboardMesh(mb) {
      if (meshNodes.motherboard) benchGroup.remove(meshNodes.motherboard);
      const group = new THREE.Group();
      const isITX = mb.formFactor === 'mini_itx' || mb.formFactor === 2;
      const sizeX = isITX ? 135 : 190;
      const sizeZ = isITX ? 135 : 190;

      // 1. Multi-Layer PCB with High-Resolution Circuit Silkscreen Texture
      const pcbTex = createMotherboardPcbTexture();
      const pcbMat = new THREE.MeshStandardMaterial({
        map: pcbTex,
        roughness: 0.45,
        metalness: 0.35
      });
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(sizeX, 3.2, sizeZ), pcbMat);
      pcb.position.set(0, 16.6, -10);
      pcb.receiveShadow = true;
      group.add(pcb);

      // Gold Trace Trim Along Outer Beveled Edge
      const traceEdge = new THREE.Mesh(
        new THREE.BoxGeometry(sizeX + 0.8, 0.5, sizeZ + 0.8),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.15 })
      );
      traceEdge.position.set(0, 16.6, -10);
      group.add(traceEdge);

      // 2. CPU Socket LGA-1718 / AM5 with Metal Retention Arm & Bracket
      const sockBase = new THREE.Mesh(
        new THREE.BoxGeometry(44, 2.8, 44),
        new THREE.MeshStandardMaterial({ color: 0x1b202c, metalness: 0.65, roughness: 0.35 })
      );
      sockBase.position.set(0, 18.8, -25);
      const sockLever = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 40, 8),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.96, roughness: 0.1 })
      );
      sockLever.rotation.z = Math.PI / 2;
      sockLever.position.set(0, 19.8, -48);
      group.add(sockBase, sockLever);

      // 3. Multi-Tiered CNC Aluminum VRM Heatsinks with Interlinked Heatpipe
      const vrmMat = new THREE.MeshStandardMaterial({ color: 0x222736, metalness: 0.92, roughness: 0.18 });
      const vrmTop = new THREE.Mesh(new THREE.BoxGeometry(sizeX * 0.44, 22, 24), vrmMat);
      vrmTop.position.set(0, 28, isITX ? -55 : -68);
      vrmTop.castShadow = true;

      // Layered Cooling Fins
      for (let i = -3; i <= 3; i++) {
        const fin = new THREE.Mesh(
          new THREE.BoxGeometry(sizeX * 0.42, 1.8, 22),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.94, roughness: 0.16 })
        );
        fin.position.set(0, 22 + i * 2.2, isITX ? -55 : -68);
        group.add(fin);
      }

      const vrmLeft = new THREE.Mesh(new THREE.BoxGeometry(24, 22, sizeZ * 0.45), vrmMat);
      vrmLeft.position.set(isITX ? -38 : -54, 28, -25);
      vrmLeft.castShadow = true;

      // Nickel-Plated Copper Heatpipe Joining VRMs
      const vrmHeatpipe = new THREE.Mesh(
        new THREE.CylinderGeometry(2.0, 2.0, 48, 16),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.96, roughness: 0.12 })
      );
      vrmHeatpipe.position.set(-35, 34, -55);
      group.add(vrmTop, vrmLeft, vrmHeatpipe);

      // 4. Rear I/O Armor Shield with Polished Mirror Logo Accent
      const ioArmor = new THREE.Mesh(
        new THREE.BoxGeometry(28, 34, 70),
        new THREE.MeshStandardMaterial({ color: 0x161a24, metalness: 0.88, roughness: 0.25 })
      );
      ioArmor.position.set(isITX ? -52 : -73, 32, -40);
      ioArmor.castShadow = true;

      const ioEmblem = new THREE.Mesh(
        new THREE.BoxGeometry(28.2, 10, 24),
        new THREE.MeshStandardMaterial({ color: 0x10f06a, emissive: 0x10f06a, emissiveIntensity: 0.65, roughness: 0.1 })
      );
      ioEmblem.position.set(isITX ? -52 : -73, 38, -40);
      group.add(ioArmor, ioEmblem);

      // Gold USB & Audio Ports on I/O Shield
      const usbPortMat = new THREE.MeshStandardMaterial({ color: 0x10f06a, metalness: 0.8 });
      for (let p = 0; p < 4; p++) {
        const port = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4.5, 8.5), usbPortMat);
        port.position.set(isITX ? -66.5 : -87.5, 25 + (p % 2) * 8.5, -60 + Math.floor(p / 2) * 18);
        group.add(port);
      }

      // 5. PCIe 5.0 Steel SafeSlot with Latch Mechanism
      const pcieSlot = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(sizeX - 35, 125), 8, 9),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.12 })
      );
      pcieSlot.position.set(-6, 20.5, isITX ? 25 : 32);
      pcieSlot.castShadow = true;
      const pcieLatch = new THREE.Mesh(
        new THREE.BoxGeometry(8, 10, 7),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })
      );
      pcieLatch.position.set(Math.min(sizeX - 35, 125) / 2 - 2, 21.5, isITX ? 25 : 32);
      group.add(pcieSlot, pcieLatch);

      // 6. Dual M.2 Thermal Armor Shields with Grooved Heat Dissipation Ridges
      const m2Shield = new THREE.Mesh(
        new THREE.BoxGeometry(76, 5.5, 24),
        new THREE.MeshStandardMaterial({ color: 0x222838, metalness: 0.94, roughness: 0.18 })
      );
      m2Shield.position.set(20, 19.8, 6);
      m2Shield.castShadow = true;

      // Second M.2 Shield (Lower Southbridge area)
      const m2Shield2 = new THREE.Mesh(
        new THREE.BoxGeometry(76, 5.5, 24),
        new THREE.MeshStandardMaterial({ color: 0x1a1f2c, metalness: 0.94, roughness: 0.18 })
      );
      m2Shield2.position.set(20, 19.8, 55);
      m2Shield2.castShadow = true;
      group.add(m2Shield, m2Shield2);

      // 7. Gold Audio Section Capacitors (5x Nichicon Fine Gold Caps)
      for (let cap = 0; cap < 5; cap++) {
        const audioCap = new THREE.Mesh(
          new THREE.CylinderGeometry(3.2, 3.2, 8, 16),
          new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.12 })
        );
        audioCap.position.set(-72 + (cap % 2) * 8, 22, 10 + cap * 11);
        group.add(audioCap);
      }

      benchGroup.add(group);
      meshNodes.motherboard = group;
    }

    function buildCpuMesh(cpu) {
      if (meshNodes.cpu) benchGroup.remove(meshNodes.cpu);
      const group = new THREE.Group();
      const isAm5 = cpu.socket === 'am5' || cpu.socket === 0;

      // Green or Blue High-Density Substrate PCB
      const sub = new THREE.Mesh(
        new THREE.BoxGeometry(34, 1.8, 34),
        new THREE.MeshStandardMaterial({ color: isAm5 ? 0x064e3b : 0x1e3a8a, roughness: 0.4 })
      );
      sub.position.set(0, 19.8, -25);

      // Nickel-Plated Copper Integrated Heat Spreader (IHS)
      const ihs = new THREE.Mesh(
        new THREE.BoxGeometry(28, 2.8, 28),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.12 })
      );
      ihs.position.set(0, 21.8, -25);
      ihs.castShadow = true;

      // Octagonal Chamfer Lip on AM5 IHS
      const ihsEmboss = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.5, 22),
        new THREE.MeshStandardMaterial({ color: 0xcfd6e4, metalness: 0.92, roughness: 0.18 })
      );
      ihsEmboss.position.set(0, 23.3, -25);

      group.add(sub, ihs, ihsEmboss);
      benchGroup.add(group);
      meshNodes.cpu = group;
    }

    function buildRamMesh(ram) {
      if (meshNodes.ram) benchGroup.remove(meshNodes.ram);
      const group = new THREE.Group();
      const isTitanium = ram.id && ram.id.includes('titanium');
      const heatSpreaderMat = new THREE.MeshStandardMaterial({
        color: isTitanium ? 0x1e2433 : 0x141822,
        metalness: 0.95,
        roughness: 0.18
      });

      // Dual High-Speed DDR5 Memory Modules
      [ 34, 46 ].forEach(x => {
        const stick = new THREE.Group();

        // Forged Aluminum Heatspreader
        const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 28, 76), heatSpreaderMat);
        body.position.set(x, 33, -25);
        body.castShadow = true;
        stick.add(body);

        // CNC Micro-Fin Top Crown Bar
        const topFin = new THREE.Mesh(
          new THREE.BoxGeometry(4.2, 5, 78),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.96, roughness: 0.12 })
        );
        topFin.position.set(x, 48, -25);
        stick.add(topFin);

        // Multi-Zone Addressable RGB Diffuser Lightbar
        const rgbColor = 0xe2e8f0;
        const diffuser = new THREE.Mesh(
          new THREE.BoxGeometry(4.4, 4, 76),
          new THREE.MeshStandardMaterial({ color: rgbColor, roughness: 0.1, emissive: rgbColor, emissiveIntensity: 0.7 })
        );
        diffuser.position.set(x, 49.5, -25);
        stick.add(diffuser);

        // Gold DIMM Edge Contacts
        const goldPins = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 3, 72),
          new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.1 })
        );
        goldPins.position.set(x, 18, -25);
        stick.add(goldPins);

        group.add(stick);
      });

      benchGroup.add(group);
      meshNodes.ram = group;
    }

    function buildGpuMesh(gpu) {
      if (meshNodes.gpu) benchGroup.remove(meshNodes.gpu);
      meshNodes.gpuFanList = [];
      meshNodes.gpuHeatpipes = [];
      const group = new THREE.Group();

      const length = Math.max(160, Math.min(185, (gpu.lengthMm || 304) * 0.56));
      const gpuOriginX = -45;
      const gpuCenterX = gpuOriginX + length / 2;
      const isFounders = gpu.visualStyle === 'founders_hourglass' || (gpu.id && (gpu.id.includes('fe') || gpu.id.includes('rtx_4080s')));
      const isStrix = gpu.visualStyle === 'rog_strix_triple' || (gpu.id && gpu.id === 'gpu_rtx_4090');

      // 1. Gold-Plated PCIe 5.0 x16 Connector Blade (Plugs cleanly into SafeSlot at Y = 18.5, Z = 32)
      const pcieBlade = new THREE.Mesh(
        new THREE.BoxGeometry(85, 4.5, 2.4),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.12 })
      );
      pcieBlade.position.set(8, 18.5, 32);
      group.add(pcieBlade);

      // 2. Stainless Steel 3-Slot I/O Expansion Bracket (Locks to rear frame at X = -45.5)
      const bracketMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.15 });
      const ioBracket = new THREE.Mesh(new THREE.BoxGeometry(2.4, 54, 42), bracketMat);
      ioBracket.position.set(gpuOriginX - 0.5, 49, 32);
      ioBracket.castShadow = true;
      group.add(ioBracket);

      // Video Display Ports (3x DP 1.4a, 1x HDMI 2.1)
      for (let dp = 0; dp < 3; dp++) {
        const dpCutout = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 5.5, 11),
          new THREE.MeshStandardMaterial({ color: 0x090b10, metalness: 0.92 })
        );
        dpCutout.position.set(gpuOriginX - 0.5, 36 + dp * 11, 23);
        group.add(dpCutout);
      }
      const hdmiCutout = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 5, 9.5),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95 })
      );
      hdmiCutout.position.set(gpuOriginX - 0.5, 41, 41);
      group.add(hdmiCutout);

      // 3. Multi-Layer Matte Black GPU Circuit Board (PCB)
      const gpuPcb = new THREE.Mesh(
        new THREE.BoxGeometry(length - 4, 46, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x101319, roughness: 0.55, metalness: 0.25 })
      );
      gpuPcb.position.set(gpuCenterX, 49, 21);
      gpuPcb.castShadow = true;
      group.add(gpuPcb);

      // 4. Aluminum Heatsink Fin Array & Sintered Copper Heatpipe Core
      const finStackMat = new THREE.MeshStandardMaterial({ color: 0xc8ceda, metalness: 0.94, roughness: 0.22 });
      const finBlock = new THREE.Mesh(new THREE.BoxGeometry(length - 10, 44, 20), finStackMat);
      finBlock.position.set(gpuCenterX, 49, 32);
      finBlock.castShadow = true;
      group.add(finBlock);

      // 32 Precision Heatsink Fin Plates Visible Through Intake Vents
      for (let f = 0; f < 32; f++) {
        const finPlate = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 45, 21),
          new THREE.MeshStandardMaterial({ color: 0xa4acbc, metalness: 0.96, roughness: 0.16 })
        );
        finPlate.position.set(gpuOriginX + 6 + f * ((length - 14) / 32), 49, 32);
        group.add(finPlate);
      }

      // Sintered Copper Heatpipes (5 polished copper heatpipes running through fins)
      const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.98, roughness: 0.12 });
      [-14, -7, 0, 7, 14].forEach(yOff => {
        const heatpipe = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, length - 8, 16), copperMat);
        heatpipe.rotation.z = Math.PI / 2;
        heatpipe.position.set(gpuCenterX, 49 + yOff, 32);
        group.add(heatpipe);
        meshNodes.gpuHeatpipes.push(heatpipe);
      });

      // 5. Sculpted Armor Shroud Framing (Completely Open Fan Apertures - Zero Z-Clipping!)
      const shroudMat = new THREE.MeshStandardMaterial({
        color: 0x181e28,
        metalness: 0.88,
        roughness: 0.25
      });
      const shroudAccentMat = new THREE.MeshStandardMaterial({
        color: 0x222a38,
        metalness: 0.92,
        roughness: 0.18
      });

      const fanCount = 3;
      const fanSpacing = (length - 14) / fanCount;
      const fanRadius = 15.2;

      // Fan X center coordinates
      const fanCenters = [];
      for (let i = 0; i < fanCount; i++) {
        fanCenters.push(gpuOriginX + 7 + fanSpacing * (i + 0.5));
      }

      // Left Shroud Wing (from I/O bracket to fan 1)
      const leftWingWidth = (fanCenters[0] - fanRadius - 0.5) - gpuOriginX;
      if (leftWingWidth > 2) {
        const leftWing = new THREE.Mesh(new THREE.BoxGeometry(leftWingWidth, 48, 4.0), shroudMat);
        leftWing.position.set(gpuOriginX + leftWingWidth / 2, 49, 44.5);
        leftWing.castShadow = true;
        group.add(leftWing);
      }

      // Right Shroud Wing (from fan 3 to tail end)
      const rightWingStart = fanCenters[2] + fanRadius + 0.5;
      const rightWingWidth = (gpuOriginX + length) - rightWingStart;
      if (rightWingWidth > 2) {
        const rightWing = new THREE.Mesh(new THREE.BoxGeometry(rightWingWidth, 48, 4.0), shroudMat);
        rightWing.position.set(rightWingStart + rightWingWidth / 2, 49, 44.5);
        rightWing.castShadow = true;
        group.add(rightWing);

        // Angular Geometric Cutouts on Tail Shroud
        for (let v = 0; v < 3; v++) {
          const tailVent = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 28, 4.4),
            new THREE.MeshStandardMaterial({ color: 0x090b10, metalness: 0.8 })
          );
          tailVent.position.set(rightWingStart + 5 + v * 4.5, 49, 44.5);
          tailVent.rotation.z = 0.25;
          group.add(tailVent);
        }
      }

      // Top Armor Bar (above all 3 fans)
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(length, 7.5, 4.2), shroudAccentMat);
      topBar.position.set(gpuCenterX, 69.25, 44.5);
      topBar.castShadow = true;
      group.add(topBar);

      // Bottom Armor Bar (below all 3 fans)
      const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(length, 7.5, 4.2), shroudAccentMat);
      bottomBar.position.set(gpuCenterX, 28.75, 44.5);
      bottomBar.castShadow = true;
      group.add(bottomBar);

      // Vertical Support Bridges between Fan 1 & 2, and Fan 2 & 3
      for (let s = 0; s < 2; s++) {
        const strutX = (fanCenters[s] + fanCenters[s + 1]) / 2;
        const strutWidth = (fanCenters[s + 1] - fanRadius) - (fanCenters[s] + fanRadius);
        const strut = new THREE.Mesh(new THREE.BoxGeometry(Math.max(3.0, strutWidth), 34, 4.0), shroudMat);
        strut.position.set(strutX, 49, 44.5);
        strut.castShadow = true;
        group.add(strut);
      }

      // Aerodynamic Chamfered Cowl Lip along top and bottom
      const cowlTop = new THREE.Mesh(new THREE.BoxGeometry(length, 2.5, 23), shroudAccentMat);
      cowlTop.position.set(gpuCenterX, 72.5, 33.5);
      cowlTop.castShadow = true;
      const cowlBottom = new THREE.Mesh(new THREE.BoxGeometry(length, 2.5, 23), shroudAccentMat);
      cowlBottom.position.set(gpuCenterX, 25.5, 33.5);
      cowlBottom.castShadow = true;
      group.add(cowlTop, cowlBottom);

      // 6. TRUE 3D PHYSICAL AXIAL-TECH FANS WITH AERODYNAMIC CURVED SICKLE BLADES
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x141a24,
        metalness: 0.88,
        roughness: 0.18,
        side: THREE.DoubleSide
      });
      const hubMat = new THREE.MeshStandardMaterial({
        color: 0x0e1219,
        metalness: 0.94,
        roughness: 0.14
      });
      const emblemMat = new THREE.MeshStandardMaterial({
        color: 0x242d3c,
        metalness: 0.98,
        roughness: 0.10
      });
      const cowlRingMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.96,
        roughness: 0.14
      });

      // Construct high-detail sickle airfoil blade shape
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(4.6, -1.8);
      bladeShape.quadraticCurveTo(fanRadius * 0.48, -3.2, fanRadius - 0.7, -1.2);
      bladeShape.lineTo(fanRadius - 0.7, 1.6);
      bladeShape.quadraticCurveTo(fanRadius * 0.48, 3.5, 4.6, 2.0);
      bladeShape.closePath();

      const extrudeConfig = {
        steps: 1,
        depth: 0.65,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.2,
        bevelSegments: 2
      };
      const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, extrudeConfig);

      for (let i = 0; i < fanCount; i++) {
        const fanPosX = fanCenters[i];

        // Recessed Dark Intake Well Cavity (open ended directly to heatsink fins)
        const wellCavity = new THREE.Mesh(
          new THREE.CylinderGeometry(fanRadius + 0.3, fanRadius + 0.3, 6, 36, 1, true),
          new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.8, side: THREE.DoubleSide })
        );
        wellCavity.rotation.x = Math.PI / 2;
        wellCavity.position.set(fanPosX, 49, 43.5);
        group.add(wellCavity);

        // Polished Chamfered Outer Cowl Ring
        const cowlRing = new THREE.Mesh(new THREE.TorusGeometry(fanRadius + 0.5, 1.3, 16, 48), cowlRingMat);
        cowlRing.position.set(fanPosX, 49, 46.8);
        group.add(cowlRing);

        // 3D Rotating Fan Assembly Group
        const fanGroup = new THREE.Group();

        // Central Motor Hub Cylinder
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 3.2, 32), hubMat);
        hub.rotation.x = Math.PI / 2;
        hub.position.z = 1.0;
        fanGroup.add(hub);

        // Brushed Metallic Emblem Disc on Center Hub
        const emblem = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.4, 32), emblemMat);
        emblem.rotation.x = Math.PI / 2;
        emblem.position.z = 2.7;
        fanGroup.add(emblem);

        // Outer Axial-Tech Barrier Rim Connecting Blade Tips (Zero turbulence, authentic RTX 40-series design)
        const outerRim = new THREE.Mesh(
          new THREE.TorusGeometry(fanRadius - 0.6, 0.75, 12, 48),
          new THREE.MeshStandardMaterial({ color: 0x161c28, metalness: 0.85, roughness: 0.22 })
        );
        outerRim.position.z = 1.2;
        fanGroup.add(outerRim);

        // 9 Aerodynamic 3D Sickle Airfoil Blades with Realistic Pitch Twist
        const bladeCount = 9;
        for (let b = 0; b < bladeCount; b++) {
          const bladeArm = new THREE.Group();
          bladeArm.rotation.z = (b * Math.PI * 2) / bladeCount;

          const bladeMesh = new THREE.Mesh(bladeGeom, bladeMat);
          // Realistic 32-degree aerodynamic axial airflow pitch
          bladeMesh.rotation.x = 0.55;
          bladeMesh.position.z = 0.6;
          bladeArm.add(bladeMesh);
          fanGroup.add(bladeArm);
        }

        // Fan positioned cleanly in the unobstructed aperture (Z = 46.2)
        fanGroup.position.set(fanPosX, 49, 46.2);
        group.add(fanGroup);
        meshNodes.gpuFanList.push(fanGroup);
      }

      // 7. Full-Length Brushed Titanium Reinforcement Backplate
      const backplate = new THREE.Mesh(
        new THREE.BoxGeometry(length, 46, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x222634, metalness: 0.92, roughness: 0.22 })
      );
      backplate.position.set(gpuCenterX, 49, 19.5);
      backplate.castShadow = true;

      // Flow-Through Cutouts at Card Tail End (RTX 40-Series signature cooling vent)
      for (let c = 0; c < 4; c++) {
        const vent = new THREE.Mesh(
          new THREE.BoxGeometry(5.5, 30, 2.2),
          new THREE.MeshStandardMaterial({ color: 0x0c0e14 })
        );
        vent.position.set(gpuOriginX + length - 32 + c * 7.5, 49, 19.5);
        group.add(vent);
      }
      group.add(backplate);

      // 8. Dynamic Illuminated "GEFORCE RTX" Side Lightbar in Electric Lime
      const lightbarMat = new THREE.MeshStandardMaterial({
        color: 0x10f06a,
        emissive: 0x10f06a,
        emissiveIntensity: 0.75,
        roughness: 0.1
      });
      meshNodes.gpuLogoMat = lightbarMat;
      const sideLightbar = new THREE.Mesh(new THREE.BoxGeometry(75, 4.2, 3.0), lightbarMat);
      sideLightbar.position.set(gpuCenterX - 10, 73.5, 33);
      group.add(sideLightbar);

      // 9. 12V-2x6 Modular Power Connector & Braided Cable Arc to Deck Grommet
      const pwrSocket = new THREE.Mesh(
        new THREE.BoxGeometry(16, 5.5, 7.5),
        new THREE.MeshStandardMaterial({ color: 0x090b10, roughness: 0.5 })
      );
      pwrSocket.position.set(gpuCenterX + 35, 73.5, 27);
      group.add(pwrSocket);

      // Natural Braided Cable Arc (Curves cleanly downward into deck grommet at 55, 9, 50)
      const cableCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(gpuCenterX + 35, 73.5, 27),
        new THREE.Vector3(gpuCenterX + 37, 60, 35),
        new THREE.Vector3(gpuCenterX + 34, 35, 45),
        new THREE.Vector3(55, 9, 50)
      ]);
      const pwrCable = new THREE.Mesh(
        new THREE.TubeGeometry(cableCurve, 28, 3.2, 12, false),
        new THREE.MeshStandardMaterial({ color: 0x181c26, roughness: 0.75, metalness: 0.25 })
      );
      pwrCable.castShadow = true;
      group.add(pwrCable);

      // Stealth Anodized Aluminum Cable Combs
      [0.25, 0.65].forEach(t => {
        const pt = cableCurve.getPoint(t);
        const comb = new THREE.Mesh(
          new THREE.BoxGeometry(9, 2.5, 5.5),
          new THREE.MeshStandardMaterial({ color: 0x090b10, metalness: 0.95, roughness: 0.15 })
        );
        comb.position.copy(pt);
        group.add(comb);
      });

      benchGroup.add(group);
      meshNodes.gpu = group;
    }

    function buildCoolerMesh(cooler) {
      if (meshNodes.cooler) benchGroup.remove(meshNodes.cooler);
      meshNodes.coolerFanList = [];
      const group = new THREE.Group();
      const isAir = cooler.coolerType === 'air' || cooler.coolerType === 0;

      if (isAir) {
        const towerMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.22 });
        [-16, 16].forEach(x => {
          const finStack = new THREE.Mesh(new THREE.BoxGeometry(24, 62, 54), towerMat);
          finStack.position.set(x, 52, -25);
          finStack.castShadow = true;
          group.add(finStack);
        });

        [-8, 24].forEach(x => {
          const fanFrame = new THREE.Mesh(new THREE.BoxGeometry(8, 54, 54), new THREE.MeshStandardMaterial({ color: 0x181b24, roughness: 0.4 }));
          fanFrame.position.set(x, 52, -25);
          fanFrame.castShadow = true;
          group.add(fanFrame);
        });
      } else {
        // AIO Pump Block with Circular Housing
        const pumpBody = new THREE.Mesh(
          new THREE.CylinderGeometry(20, 20, 20, 48),
          new THREE.MeshStandardMaterial({ color: 0x161a26, metalness: 0.9, roughness: 0.25 })
        );
        pumpBody.position.set(0, 31.5, -25);
        pumpBody.castShadow = true;
        group.add(pumpBody);

        // Circular OLED Screen Display
        const lcdTex = createAioLcdTexture();
        const screenMesh = new THREE.Mesh(
          new THREE.CircleGeometry(16, 48),
          new THREE.MeshBasicMaterial({ map: lcdTex, side: THREE.DoubleSide })
        );
        screenMesh.rotation.x = -Math.PI / 2;
        screenMesh.position.set(0, 41.7, -25);
        group.add(screenMesh);
        meshNodes.aioScreenMesh = screenMesh;

        // Metallic Bezel Trim Ring
        const bezel = new THREE.Mesh(
          new THREE.TorusGeometry(18, 1.8, 16, 48),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.12 })
        );
        bezel.rotation.x = Math.PI / 2;
        bezel.position.set(0, 41.5, -25);
        group.add(bezel);

        // 360mm Radiator Mounted Flush Under Top Ceiling (Properly Grounded Chassis!)
        const radiator = new THREE.Mesh(
          new THREE.BoxGeometry(185, 20, 52),
          new THREE.MeshStandardMaterial({ color: 0x12151f, metalness: 0.8, roughness: 0.3 })
        );
        radiator.position.set(0, 189, -22);
        radiator.castShadow = true;
        group.add(radiator);

        // 3x 120mm Radiator Fans Facing Downward with Glowing Halo Rings
        for (let rf = -1; rf <= 1; rf++) {
          const fanFrame = new THREE.Mesh(new THREE.BoxGeometry(52, 10, 52), new THREE.MeshStandardMaterial({ color: 0x161a25, roughness: 0.5 }));
          fanFrame.position.set(rf * 56, 174, -22);
          fanFrame.castShadow = true;

          const halo = new THREE.Mesh(new THREE.TorusGeometry(20, 1.4, 12, 32), new THREE.MeshStandardMaterial({ color: 0x10f06a, emissive: 0x10f06a, emissiveIntensity: 0.55 }));
          halo.rotation.x = Math.PI / 2;
          halo.position.set(rf * 56, 169, -22);
          group.add(fanFrame, halo);
          meshNodes.coolerFanList.push(halo);
        }

        // Realistic Naturally Curved Braided Coolant Tubes
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0x1c212d, roughness: 0.75, metalness: 0.2 });
        const curve1 = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-10, 35, -25),
          new THREE.Vector3(-26, 68, -26),
          new THREE.Vector3(-55, 125, -28),
          new THREE.Vector3(-78, 178, -22)
        ]);
        const tube1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 40, 3.8, 12, false), tubeMat);
        tube1.castShadow = true;

        const curve2 = new THREE.CatmullRomCurve3([
          new THREE.Vector3(10, 35, -25),
          new THREE.Vector3(2, 72, -20),
          new THREE.Vector3(-40, 130, -24),
          new THREE.Vector3(-78, 178, -28)
        ]);
        const tube2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 40, 3.8, 12, false), tubeMat);
        tube2.castShadow = true;

        group.add(tube1, tube2);

        // Rotary Compression Metal Fittings
        const elbowMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.1 });
        [-10, 10].forEach(ex => {
          const elbow = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 7, 16), elbowMat);
          elbow.position.set(ex, 34, -25);
          group.add(elbow);
        });

        [-22, -28].forEach(ez => {
          const radFitting = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 7, 16), elbowMat);
          radFitting.position.set(-78, 178, ez);
          group.add(radFitting);
        });
      }

      benchGroup.add(group);
      meshNodes.cooler = group;
    }

    function buildPsuMesh(psu) {
      if (meshNodes.psu) benchGroup.remove(meshNodes.psu);
      const group = new THREE.Group();

      // PSU Chassis Unit (Installed strictly in the lower basement beneath the deck floor)
      const psuBox = new THREE.Mesh(
        new THREE.BoxGeometry(84, 16, 78),
        new THREE.MeshStandardMaterial({ color: 0x131723, metalness: 0.88, roughness: 0.32 })
      );
      psuBox.position.set(-75, -1, 65);
      psuBox.castShadow = true;
      group.add(psuBox);

      // Metallic Spec Emblem / Badge (Visible through lower cutout window)
      const psuBadge = new THREE.Mesh(
        new THREE.BoxGeometry(28, 8, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 })
      );
      psuBadge.position.set(-75, -1, 104.5);
      group.add(psuBadge);

      // Rear AC Power Socket & Rocker Switch
      const acInlet = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 6, 12),
        new THREE.MeshStandardMaterial({ color: 0x090b10, metalness: 0.9 })
      );
      acInlet.position.set(-117.2, -1, 65);
      const rockerSwitch = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 5, 4),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
      );
      rockerSwitch.position.set(-117.2, -1, 55);
      group.add(acInlet, rockerSwitch);

      // Braided Modular ATX Cable Harness (Routes up through deck grommet into motherboard)
      const atxCable = new THREE.Mesh(
        new THREE.CylinderGeometry(5.5, 5.5, 34, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
      );
      atxCable.position.set(-35, 12, 50);
      group.add(atxCable);

      benchGroup.add(group);
      meshNodes.psu = group;
    }

    function buildGlassPanel() {
      if (meshNodes.glassPanel) {
        benchGroup.remove(meshNodes.glassPanel);
        meshNodes.glassPanel = null;
      }
      if (showGlass) {
        const glassGeo = new THREE.BoxGeometry(2.5, 195, 255);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.35,
          roughness: 0.04,
          metalness: 0.1,
          transmission: 0.92,
          reflectivity: 0.85,
          ior: 1.52
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(122, 98, 0);
        glass.castShadow = true;

        const screwMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
        [ [-110, 180], [110, 180], [-110, 15], [110, 15] ].forEach(([gz, gy]) => {
          const screw = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 7, 16), screwMat);
          screw.rotation.z = Math.PI / 2;
          screw.position.set(124, gy, gz);
          glass.add(screw);
        });

        benchGroup.add(glass);
        meshNodes.glassPanel = glass;
      }
    }

    // 3D Spatial Labels (Default OFF, non-blocking)
    const labelAnchors = [
      { id: 'gpu', name: 'GPU - GRAPHICS CARD', pos: new THREE.Vector3(41, 75, 46), compKey: 'gpu' },
      { id: 'cpu', name: 'CPU - PROCESSOR', pos: new THREE.Vector3(0, 28, -25), compKey: 'cpu' },
      { id: 'cooler', name: 'AIO PUMP OLED', pos: new THREE.Vector3(0, 50, -25), compKey: 'cooler' },
      { id: 'ram', name: 'DDR5 MEMORY', pos: new THREE.Vector3(40, 56, -25), compKey: 'memory' },
      { id: 'psu', name: 'PSU POWER SUPPLY', pos: new THREE.Vector3(-75, -1, 65), compKey: 'psu' }
    ];

    function createSpatialLabels() {
      const container = document.getElementById('labels-container');
      container.innerHTML = '';
      labelAnchors.forEach(anc => {
        const div = document.createElement('div');
        div.className = 'part-label-tag';
        div.id = 'label-' + anc.id;
        div.innerHTML =
          '<div class="part-label-content">' +
            '<span class="part-label-dot"></span>' +
            '<span class="part-label-text">' + anc.name + '</span>' +
          '</div>' +
          '<div class="part-label-arrow"></div>';
        container.appendChild(div);
      });
    }
    createSpatialLabels();

    function updateSpatialLabels() {
      const container = document.getElementById('labels-container');
      if (!showLabels || wireframeMode) {
        container.style.display = 'none';
        return;
      }
      container.style.display = 'block';

      labelAnchors.forEach(anc => {
        const el = document.getElementById('label-' + anc.id);
        if (!el) return;

        const targetPos = anc.pos.clone();
        if (exploded) {
          if (anc.id === 'gpu') targetPos.z += 90 * explodeProgress;
          if (anc.id === 'cooler') targetPos.y += 60 * explodeProgress;
          if (anc.id === 'ram') targetPos.x += 40 * explodeProgress;
          if (anc.id === 'psu') targetPos.y -= 35 * explodeProgress;
        }

        const screenPos = targetPos.clone().project(camera);
        if (screenPos.z > 1) {
          el.style.opacity = '0';
          return;
        }

        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.opacity = '1';

        const comp = activeBuild[anc.compKey];
        const textSpan = el.querySelector('.part-label-text');
        if (comp && textSpan) {
          textSpan.textContent = comp.name;
        }
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('interact-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.style.opacity = '1';
      setTimeout(() => { toast.style.opacity = '0'; }, 2200);
    }

    function focusOnAnchor(anc) {
      const targetPos = anc.pos.clone();
      const lookPos = new THREE.Vector3(targetPos.x, targetPos.y - 10, targetPos.z);
      const camTarget = new THREE.Vector3(targetPos.x + 80, targetPos.y + 60, targetPos.z + 90);
      smoothTransitionCamera(camTarget, lookPos);
    }

    // 3D Raycasting & Cursor Inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let clickOrigin = { x: 0, y: 0 };
    const inspectChip = document.getElementById('cursor-inspect-chip');
    const chipTitle = document.getElementById('chip-title');
    const chipSub = document.getElementById('chip-sub');

    renderer.domElement.addEventListener('pointerdown', (e) => {
      clickOrigin = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('pointermove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(benchGroup.children, true);
      if (intersects.length > 0) {
        let hit = intersects[0].object;
        let identified = false;

        if (hit === meshNodes.aioScreenMesh || (meshNodes.cooler && meshNodes.cooler.children.includes(hit))) {
          chipTitle.textContent = activeBuild.cooler ? activeBuild.cooler.name : 'AIO Liquid Cooler';
          chipSub.textContent = 'Click to cycle OLED display telemetry';
          identified = true;
        } else if (meshNodes.gpu && (hit === meshNodes.gpu || meshNodes.gpu.children.includes(hit))) {
          chipTitle.textContent = activeBuild.gpu ? activeBuild.gpu.name : 'Graphics Card';
          chipSub.textContent = 'Click to focus 3D inspection';
          identified = true;
        } else if (meshNodes.ram && (hit === meshNodes.ram || meshNodes.ram.children.includes(hit))) {
          chipTitle.textContent = activeBuild.memory ? activeBuild.memory.name : 'DDR5 Memory';
          chipSub.textContent = 'Click to focus 3D inspection';
          identified = true;
        } else if (meshNodes.glassPanel && (hit === meshNodes.glassPanel || meshNodes.glassPanel.children.includes(hit))) {
          chipTitle.textContent = 'Tempered Glass Panel';
          chipSub.textContent = 'Click to open/remove side panel';
          identified = true;
        }

        if (identified) {
          inspectChip.style.display = 'block';
          inspectChip.style.left = e.clientX + 'px';
          inspectChip.style.top = e.clientY + 'px';
          return;
        }
      }
      inspectChip.style.display = 'none';
    });

    renderer.domElement.addEventListener('pointerleave', () => {
      inspectChip.style.display = 'none';
    });

    renderer.domElement.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - clickOrigin.x, e.clientY - clickOrigin.y);
      if (dist > 6) return; // Orbit/drag gesture, not a click

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(benchGroup.children, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        
        // Did user click on AIO screen or pump?
        if (hit === meshNodes.aioScreenMesh || (meshNodes.cooler && meshNodes.cooler.children.includes(hit))) {
          aioDisplayMetric = (aioDisplayMetric + 1) % 3;
          updateAioLcdDisplay();
          const metricNames = ['CPU Core Temp', 'Liquid Coolant Temp', 'Peak Power & Efficiency'];
          showToast('AIO OLED Display: ' + metricNames[aioDisplayMetric]);
          return;
        }

        // Did user click on Glass panel?
        if (hit === meshNodes.glassPanel || (meshNodes.glassPanel && meshNodes.glassPanel.children.includes(hit))) {
          showGlass = !showGlass;
          buildGlassPanel();
          document.getElementById('btn-glass')?.classList.toggle('active', showGlass);
          showToast(showGlass ? 'Tempered Glass Panel Mounted' : 'Tempered Glass Panel Detached');
          return;
        }

        // Did user click on GPU?
        if (meshNodes.gpu && (hit === meshNodes.gpu || meshNodes.gpu.children.includes(hit))) {
          showToast('Inspecting: ' + (activeBuild.gpu ? activeBuild.gpu.name : 'Graphics Card'));
          const anc = labelAnchors.find(a => a.id === 'gpu');
          if (anc) focusOnAnchor(anc);
          return;
        }

        // Did user click on RAM?
        if (meshNodes.ram && (hit === meshNodes.ram || meshNodes.ram.children.includes(hit))) {
          showToast('Inspecting: ' + (activeBuild.memory ? activeBuild.memory.name : 'DDR5 Memory'));
          const anc = labelAnchors.find(a => a.id === 'ram');
          if (anc) focusOnAnchor(anc);
          return;
        }
      }
    });

    // API Sync: Load Catalog & Live Prices
    async function loadCatalog() {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch('/api/components'),
          fetch('/api/live-prices').catch(() => null)
        ]);
        allComponents = await cRes.json();
        if (pRes) {
          const pData = await pRes.json();
          liveMarketQuotes = pData.quotes || {};
        }
        renderChosenRigView();
        renderCatalog();
        renderBuildSpecView();
        renderMarketDealsView();
        renderThermalBenchView();
      } catch (err) {
        console.error('Failed to load components', err);
      }
    }

    // Render View 0: Dedicated "MY RIG / CHOSEN SETUP" Panel (Requested by User)
    function renderChosenRigView() {
      const container = document.getElementById('chosen-rig-container');
      if (!container) return;

      const slots = [
        { key: 'cpu', label: 'Processor (CPU)', icon: 'cpu', cat: 'cpu' },
        { key: 'gpu', label: 'Graphics Card (GPU)', icon: 'gpu', cat: 'gpu' },
        { key: 'motherboard', label: 'Motherboard', icon: 'mb', cat: 'mb' },
        { key: 'memory', label: 'DDR5 Memory (RAM)', icon: 'ram', cat: 'ram' },
        { key: 'cooler', label: 'CPU Cooler', icon: 'cooler', cat: 'cooler' },
        { key: 'storage', label: 'NVMe M.2 Storage', icon: 'ssd', cat: 'storage' },
        { key: 'psu', label: 'Power Supply (PSU)', icon: 'psu', cat: 'psu' },
        { key: 'chassis', label: 'Chassis Frame (Case)', icon: 'chassis', cat: 'chassis' }
      ];

      let installedCount = 0;
      let totalCost = 0;
      let totalWatts = 0;
      let cardsHtml = '';

      slots.forEach(slot => {
        const comp = activeBuild[slot.key];
        if (comp) {
          installedCount++;
          const q = liveMarketQuotes[comp.id];
          const partCost = (applyRealMarketPrices && q && q.realPrice) ? q.realPrice : comp.priceUsd;
          totalCost += partCost;
          totalWatts += comp.tdpWatts || 0;

          const imgUrl = REAL_PRODUCT_IMAGES[comp.id] || CATEGORY_FALLBACK_IMAGES[slot.key] || CATEGORY_FALLBACK_IMAGES.graphics_card;

          cardsHtml += \`
            <div class="chosen-slot-card">
              <div class="part-img-box" style="width: 52px; height: 52px; border-radius: 6px;">
                <img src="\${imgUrl}" alt="\${comp.name}" class="real-part-img" onerror="this.onerror=null; this.src='\${CATEGORY_FALLBACK_IMAGES[slot.key]}';" />
              </div>
              <div style="flex: 1; min-width: 0;">
                <div class="chosen-slot-label">\${slot.label}</div>
                <div class="chosen-slot-name">\${comp.brand} \${comp.name}</div>
                <div class="chosen-slot-sub">\${comp.tdpWatts ? comp.tdpWatts + 'W TDP' : (comp.psuWattage ? comp.psuWattage + 'W' : 'Hardware Cleared')}</div>
              </div>
              <div class="chosen-slot-price">\$\${partCost}</div>
              <div class="chosen-btn-grp">
                <button class="mini-icon-btn" onclick="inspectComponentById('\${comp.id}')" title="Inspect in 3D">3D</button>
                <button class="mini-icon-btn" onclick="openCatalogForCategory('\${slot.cat}')" title="Change Part">CHANGE</button>
                <button class="mini-icon-btn remove" onclick="removeSlotPart('\${slot.key}')" title="Remove Part">✕</button>
              </div>
            </div>
          \`;
        } else {
          cardsHtml += \`
            <div class="chosen-slot-card empty-slot">
              <div class="part-img-box" style="width: 52px; height: 52px; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px dashed rgba(255,255,255,0.2);">
                <span style="font-size: 18px; color: var(--text-dim); font-weight: 300;">+</span>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div class="chosen-slot-label" style="color: var(--text-muted);">\${slot.label}</div>
                <div class="chosen-slot-name" style="color: var(--text-dim);">Slot Empty</div>
                <div class="chosen-slot-sub">Click to select component</div>
              </div>
              <button class="mini-icon-btn" onclick="openCatalogForCategory('\${slot.cat}')" style="background: var(--accent-cyan); color: #000; border-color: var(--accent-cyan); font-weight: 800;">+ CHOOSE</button>
            </div>
          \`;
        }
      });

      // Update badge counts with animation
      const prevInstalled = window._currentInstalledCount !== undefined ? window._currentInstalledCount : 0;
      window._currentInstalledCount = installedCount;

      const badgeNumEl = document.getElementById('badge-rig-count');
      if (badgeNumEl) {
        animateRollingNumber(badgeNumEl, prevInstalled, installedCount, 300, v => Math.round(v));
      }
      const reopenNumEl = document.getElementById('reopen-badge-rig-count');
      if (reopenNumEl) {
        animateRollingNumber(reopenNumEl, prevInstalled, installedCount, 300, v => Math.round(v));
      }

      container.innerHTML = \`
        <div class="chosen-summary-card" style="background: rgba(16, 240, 106, 0.08); border: 1px solid rgba(16, 240, 106, 0.28); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-family: var(--font-display); font-size: 12px; font-weight: 800; color: #10f06a; letter-spacing: 0.6px; text-transform: uppercase;">ACTIVE HARDWARE RIG</div>
              <div style="font-family: var(--font-mono); font-size: 10px; color: #94a3b8; margin-top: 2px;">\${installedCount} of 8 Core Components Configured</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 800; color: #ffffff;">\\$\${totalCost.toLocaleString()}</div>
              <div style="font-family: var(--font-mono); font-size: 10.5px; color: #10f06a; font-weight: 700;">\${totalWatts}W Peak Load</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
            <button class="mini-icon-btn" onclick="loadHighEndPreset()" style="background: #10f06a; color: #040805; font-weight: 800; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer;">FLAGSHIP PRESET</button>
            <button class="mini-icon-btn" onclick="loadSweetSpotPreset()" style="background: rgba(255, 255, 255, 0.08); color: #ffffff; border: 1px solid var(--border-panel); padding: 6px 12px; border-radius: 5px; cursor: pointer;">SWEET SPOT</button>
            <button class="mini-icon-btn remove" onclick="clearAllParts()" style="background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 12px; border-radius: 5px; cursor: pointer; margin-left: auto;">RESET ALL</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          \${cardsHtml}
        </div>
      \`;
    }

    window.removeSlotPart = function(slotKey) {
      if (activeBuild[slotKey]) {
        const name = activeBuild[slotKey].name;
        activeBuild[slotKey] = null;
        update3DScene();
        syncBuildAnalysis();
        renderChosenRigView();
        renderCatalog();
        renderBuildSpecView();
        showToast('Removed ' + name);
      }
    };

    window.openCatalogForCategory = function(cat) {
      // Switch to catalog tab and filter by category
      document.querySelectorAll('.tab-switch-btn').forEach(b => b.classList.remove('active'));
      const catTabBtn = document.querySelector('.tab-switch-btn[data-tab="catalog"]');
      if (catTabBtn) catTabBtn.classList.add('active');

      activeTab = 'catalog';
      document.getElementById('view-chosen').style.display = 'none';
      document.getElementById('view-catalog').style.display = 'flex';
      document.getElementById('view-build').style.display = 'none';
      document.getElementById('view-market').style.display = 'none';
      document.getElementById('view-thermal').style.display = 'none';

      // Set category filter
      activeCategory = cat;
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === cat);
      });
      renderCatalog();
    };

    window.inspectComponentById = function(id) {
      const comp = allComponents.find(c => c.id === id);
      if (comp) inspectComponent(comp);
    };

    window.clearAllParts = function() {
      for (const k of Object.keys(activeBuild)) activeBuild[k] = null;
      update3DScene();
      syncBuildAnalysis();
      renderChosenRigView();
      renderCatalog();
      renderBuildSpecView();
      showToast('All hardware uninstalled');
    };

    window.loadHighEndPreset = function() {
      activeBuild.cpu = allComponents.find(c => c.id === 'cpu_7800x3d') || allComponents.find(c => c.id === 'cpu_7950x3d');
      activeBuild.motherboard = allComponents.find(c => c.id === 'mb_b650e') || allComponents.find(c => c.id === 'mb_x670e_aorus');
      activeBuild.gpu = allComponents.find(c => c.id === 'gpu_rtx_4090') || allComponents.find(c => c.id === 'gpu_rtx_4080s');
      activeBuild.memory = allComponents.find(c => c.id === 'ram_dominator_titanium_64gb');
      activeBuild.cooler = allComponents.find(c => c.id === 'cooler_icue_titan_360');
      activeBuild.psu = allComponents.find(c => c.id === 'psu_rm1000x_shift');
      activeBuild.storage = allComponents.find(c => c.id === 'ssd_samsung_990pro');
      activeBuild.chassis = allComponents.find(c => c.id === 'case_5000d_airflow');
      update3DScene();
      syncBuildAnalysis();
      renderChosenRigView();
      renderCatalog();
      showToast('Loaded Flagship RTX 4090 + 7800X3D Preset');
    };

    window.loadSweetSpotPreset = function() {
      activeBuild.cpu = allComponents.find(c => c.id === 'cpu_7600x');
      activeBuild.motherboard = allComponents.find(c => c.id === 'mb_b650_tomahawk') || allComponents.find(c => c.id === 'mb_b650e');
      activeBuild.gpu = allComponents.find(c => c.id === 'gpu_rtx_4070s') || allComponents.find(c => c.id === 'gpu_rtx_4070_ti_s');
      activeBuild.memory = allComponents.find(c => c.id === 'ram_vengeance_rgb_32gb') || allComponents.find(c => c.id === 'ram_trident_32gb');
      activeBuild.cooler = allComponents.find(c => c.id === 'cooler_peerless_120') || allComponents.find(c => c.id === 'cooler_nh_d15');
      activeBuild.psu = allComponents.find(c => c.id === 'psu_corsair_750w');
      activeBuild.storage = allComponents.find(c => c.id === 'ssd_sn850x') || allComponents.find(c => c.id === 'ssd_samsung_990pro');
      activeBuild.chassis = allComponents.find(c => c.id === 'case_4000d_airflow');
      update3DScene();
      syncBuildAnalysis();
      renderChosenRigView();
      renderCatalog();
      showToast('Loaded Sweet-Spot 1440p Gaming Preset');
    };

    // Render Catalog with Real Product Photographic Images
    function renderCatalog() {
      const feed = document.getElementById('component-feed');
      if (!feed) return;
      feed.innerHTML = '';

      const query = (document.getElementById('part-search-input')?.value || '').toLowerCase().trim();
      const sortBy = document.getElementById('part-sort-select')?.value || 'featured';

      const kindMap = { cpu: 'processor', gpu: 'graphics_card', mb: 'motherboard', ram: 'memory', storage: 'storage', psu: 'power_supply', cooler: 'cooler', chassis: 'chassis' };
      
      let filtered = allComponents.filter(c => {
        const kStr = typeof c.kind === 'string' ? c.kind.toLowerCase() : ['processor','graphics_card','motherboard','memory','storage','power_supply','cooler','chassis'][c.kind];
        if (activeCategory !== 'all' && kStr !== kindMap[activeCategory]) return false;
        if (query) {
          const matchName = (c.name || '').toLowerCase().includes(query);
          const matchBrand = (c.brand || '').toLowerCase().includes(query);
          const matchBadge = (c.imageBadge || '').toLowerCase().includes(query);
          if (!matchName && !matchBrand && !matchBadge) return false;
        }
        return true;
      });

      if (sortBy === 'price-asc') filtered.sort((a, b) => a.priceUsd - b.priceUsd);
      else if (sortBy === 'price-desc') filtered.sort((a, b) => b.priceUsd - a.priceUsd);
      else if (sortBy === 'power') filtered.sort((a, b) => (b.tdpWatts || b.psuWattage || 0) - (a.tdpWatts || a.psuWattage || 0));

      filtered.forEach(c => {
        const card = document.createElement('div');
        const kStr = typeof c.kind === 'string' ? c.kind.toLowerCase() : ['processor','graphics_card','motherboard','memory','storage','power_supply','cooler','chassis'][c.kind];
        const slotKeyMap = { processor: 'cpu', graphics_card: 'gpu', motherboard: 'motherboard', memory: 'memory', storage: 'storage', power_supply: 'psu', cooler: 'cooler', chassis: 'chassis' };
        const slotKey = slotKeyMap[kStr] || 'cpu';
        const isInstalled = activeBuild[slotKey] && activeBuild[slotKey].id === c.id;

        card.className = 'part-card' + (isInstalled ? ' installed' : '');

        const bLower = (c.brand || '').toLowerCase();
        let brandClass = 'part-brand-badge';
        if (bLower.includes('amd')) brandClass += ' brand-amd';
        else if (bLower.includes('intel')) brandClass += ' brand-intel';
        else if (bLower.includes('nvidia')) brandClass += ' brand-nvidia';
        else if (bLower.includes('corsair')) brandClass += ' brand-corsair';
        else if (bLower.includes('asus')) brandClass += ' brand-asus';

        let specsHtml = '';
        if (c.coreCount) specsHtml += '<span class="spec-pill">' + c.coreCount + ' CORES</span>';
        if (c.boostClockMhz) specsHtml += '<span class="spec-pill">' + c.boostClockMhz + ' MHz</span>';
        if (c.vramGb) specsHtml += '<span class="spec-pill">' + c.vramGb + 'GB VRAM</span>';
        if (c.tdpWatts) specsHtml += '<span class="spec-pill">' + c.tdpWatts + 'W TDP</span>';
        if (c.psuWattage) specsHtml += '<span class="spec-pill">' + c.psuWattage + 'W POWER</span>';
        if (c.lengthMm) specsHtml += '<span class="spec-pill">' + c.lengthMm + 'mm LEN</span>';
        if (c.heightMm) specsHtml += '<span class="spec-pill">' + c.heightMm + 'mm H</span>';

        // Real Product Photographic Image with Category Fallback
        const realImgUrl = REAL_PRODUCT_IMAGES[c.id] || CATEGORY_FALLBACK_IMAGES[kStr] || CATEGORY_FALLBACK_IMAGES.graphics_card;
        const fallbackImgUrl = CATEGORY_FALLBACK_IMAGES[kStr] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80';

        const quote = liveMarketQuotes[c.id] || {};
        let priceHtml = '<span class="part-price-badge">$' + c.priceUsd + '</span>';
        if (quote && quote.realPrice) {
          const deltaClass = quote.deltaUsd > 0 ? 'delta-scalp' : (quote.deltaUsd < 0 ? 'delta-discount' : 'delta-neutral');
          const deltaSign = quote.deltaUsd > 0 ? '+' : '';
          priceHtml =
            '<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">' +
              '<span class="part-price-badge" style="' + (applyRealMarketPrices ? 'color: #34d399;' : '') + '">$' + (applyRealMarketPrices ? quote.realPrice : c.priceUsd) + '</span>' +
              '<span class="market-delta-pill ' + deltaClass + '">MKT: $' + quote.realPrice + ' (' + deltaSign + quote.deltaUsd + ')</span>' +
            '</div>';
        }
        const stockText = quote.matchedName
          ? 'MATCHED: ' + quote.matchedName.toUpperCase().slice(0, 32) + '...'
          : (quote.retailerSource ? quote.retailerSource.toUpperCase() : 'PCPARTPICKER OPEN DATASET');

        card.innerHTML =
          '<div class="part-main-row">' +
            '<div class="part-img-box">' +
              '<img src="' + realImgUrl + '" alt="' + c.name + '" class="real-part-img" onerror="this.onerror=null; this.src=\\'' + fallbackImgUrl + '\\';" />' +
            '</div>' +
            '<div class="part-info-col">' +
              '<div class="part-top-row">' +
                '<span class="' + brandClass + '">' + c.brand + '</span>' +
                priceHtml +
              '</div>' +
              '<div class="part-name-title">' + c.name + '</div>' +
              '<div class="part-tagline-text">' + (c.imageBadge || '') + '</div>' +
              '<div class="stock-tag">' + stockText + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="part-specs-row">' + specsHtml + '</div>' +
          '<div class="part-actions-row">' +
            '<button class="action-btn primary btn-install ' + (isInstalled ? 'installed-btn' : '') + '">' + (isInstalled ? 'Remove' : 'Install Part') + '</button>' +
            '<button class="action-btn btn-inspect">Inspect 3D</button>' +
          '</div>';

        card.querySelector('.btn-install').onclick = () => toggleInstall(c);
        card.querySelector('.btn-inspect').onclick = () => inspectComponent(c);
        feed.appendChild(card);
      });
    }

    // Render View 2: Active Build Spec Sheet
    function renderBuildSpecView() {
      const container = document.getElementById('spec-sheet-container');
      if (!container) return;

      const installedKeys = ['cpu', 'motherboard', 'memory', 'gpu', 'cooler', 'storage', 'psu', 'chassis'];
      let partsHtml = '';
      let totalWatts = 0;
      let totalCost = 0;

      installedKeys.forEach(k => {
        const comp = activeBuild[k];
        if (comp) {
          const q = liveMarketQuotes[comp.id];
          const partCost = (applyRealMarketPrices && q && q.realPrice) ? q.realPrice : comp.priceUsd;
          totalCost += partCost;
          totalWatts += comp.tdpWatts || 0;
          partsHtml +=
            '<div class="spec-row">' +
              '<span class="spec-key">' + k.toUpperCase() + ': ' + comp.name + '</span>' +
              '<span class="spec-val" style="' + (applyRealMarketPrices && q && q.realPrice ? 'color: #34d399;' : '') + '">$' + partCost + '</span>' +
            '</div>';
        } else {
          partsHtml +=
            '<div class="spec-row">' +
              '<span class="spec-key" style="color: var(--text-muted);">' + k.toUpperCase() + ': Not Installed</span>' +
              '<span class="spec-val" style="color: var(--text-muted);">-</span>' +
            '</div>';
        }
      });

      const gpuLen = activeBuild.gpu ? activeBuild.gpu.lengthMm : 0;
      const caseMaxGpu = activeBuild.chassis ? activeBuild.chassis.lengthMm : 360;
      const gpuClearancePass = gpuLen <= caseMaxGpu;

      const coolerH = activeBuild.cooler ? activeBuild.cooler.heightMm : 0;
      const caseMaxCooler = activeBuild.chassis ? activeBuild.chassis.heightMm : 170;
      const coolerPass = coolerH <= caseMaxCooler;

      const psuCap = activeBuild.psu ? activeBuild.psu.psuWattage : 0;
      const psuPass = psuCap >= totalWatts + 150;

      container.innerHTML =
        '<div class="spec-section-card">' +
          '<div class="spec-section-header">' +
            '<span>Installed Hardware</span>' +
            '<span>$' + totalCost + ' MSRP</span>' +
          '</div>' +
          partsHtml +
        '</div>' +

        '<div class="spec-section-card">' +
          '<div class="spec-section-header">' +
            '<span>Physical Clearances & Safety</span>' +
            '<span>Verified</span>' +
          '</div>' +
          '<div class="spec-row">' +
            '<span class="spec-key">GPU Length (' + gpuLen + 'mm vs Max ' + caseMaxGpu + 'mm)</span>' +
            '<span class="' + (gpuClearancePass ? 'clearance-pass' : 'clearance-fail') + '">' + (gpuClearancePass ? 'Pass' : 'Clearance Alert') + '</span>' +
          '</div>' +
          '<div class="spec-row">' +
            '<span class="spec-key">Cooler Height (' + coolerH + 'mm vs Max ' + caseMaxCooler + 'mm)</span>' +
            '<span class="' + (coolerPass ? 'clearance-pass' : 'clearance-fail') + '">' + (coolerPass ? 'Pass' : 'Height Alert') + '</span>' +
          '</div>' +
          '<div class="spec-row">' +
            '<span class="spec-key">PSU Wattage Headroom (' + psuCap + 'W vs ' + totalWatts + 'W TDP)</span>' +
            '<span class="' + (psuPass ? 'clearance-pass' : 'clearance-fail') + '">' + (psuPass ? 'Pass - Safe Headroom' : 'Upgrade PSU') + '</span>' +
          '</div>' +
        '</div>' +

        '<div style="display: flex; gap: 8px;">' +
          '<button class="action-btn" id="btn-export-spec">Copy Build Summary</button>' +
          '<button class="action-btn primary" onclick="clearAllParts()">Reset Build</button>' +
        '</div>';

      document.getElementById('btn-export-spec')?.addEventListener('click', () => {
        let text = 'VIRTUAL PC BUILD SPEC SHEET\\n==========================\\n';
        installedKeys.forEach(k => {
          const comp = activeBuild[k];
          if (comp) text += k.toUpperCase() + ': ' + comp.brand + ' ' + comp.name + ' ($' + comp.priceUsd + ')\\n';
        });
        text += '\\nTOTAL ESTIMATED MSRP: $' + totalCost + '\\nPEAK DRAW: ' + totalWatts + 'W\\n';
        navigator.clipboard.writeText(text);
        showToast('Build summary copied to clipboard');
      });
    }

    function epForKind(kind) {
      const map = {
        processor: 'cpu.json',
        graphics_card: 'video-card.json',
        motherboard: 'motherboard.json',
        memory: 'memory.json',
        storage: 'internal-hard-drive.json',
        power_supply: 'power-supply.json',
        cooler: 'cpu-cooler.json',
        chassis: 'case.json'
      };
      return map[kind] || 'cpu.json';
    }

    async function executeLiveBrowserCrawl() {
      if (isCrawlingLive) return;
      isCrawlingLive = true;
      const tStart = new Date().toLocaleTimeString();
      crawlerTerminalLogs.push('\\n[' + tStart + '] CONNECTING TO OFFICIAL OPEN PC HARDWARE DATASETS (GITHUB RAW)...');
      renderMarketDealsView();

      const endpoints = [
        { kind: 'processor', name: 'cpu.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/cpu.json' },
        { kind: 'graphics_card', name: 'video-card.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/video-card.json' },
        { kind: 'motherboard', name: 'motherboard.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/motherboard.json' },
        { kind: 'memory', name: 'memory.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/memory.json' },
        { kind: 'storage', name: 'internal-hard-drive.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/internal-hard-drive.json' },
        { kind: 'power_supply', name: 'power-supply.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/power-supply.json' },
        { kind: 'cooler', name: 'cpu-cooler.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/cpu-cooler.json' },
        { kind: 'chassis', name: 'case.json', url: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/case.json' }
      ];

      const datasets = {};
      let totalPartsFetched = 0;

      for (const ep of endpoints) {
        try {
          const t0 = performance.now();
          const res = await fetch(ep.url);
          const data = await res.json();
          const elapsed = Math.round(performance.now() - t0);
          datasets[ep.kind] = data;
          totalPartsFetched += data.length;
          crawlerTerminalLogs.push('[HTTP ' + res.status + '] ' + ep.name + ' -> ' + data.length.toLocaleString() + ' items parsed in ' + elapsed + 'ms');
          renderMarketDealsView();
        } catch (err) {
          crawlerTerminalLogs.push('[WARN] Fetch failed for ' + ep.name + ': ' + err.message);
          renderMarketDealsView();
        }
      }

      let matchedCount = 0;
      allComponents.forEach(c => {
        const list = datasets[c.kind] || [];
        const cleanName = c.name.toLowerCase();
        const brandLower = c.brand.toLowerCase();
        const idKey = c.id.replace(/^(cpu_|gpu_|mb_|ram_|ssd_|psu_|cooler_|case_)/, '').toLowerCase();

        let candidates = list.filter(item => {
          if (!item.name || !item.price || item.price <= 0) return false;
          const itemName = item.name.toLowerCase();
          const chipset = (item.chipset || '').toLowerCase();
          const idTokens = idKey.split('_').filter(t => t.length >= 2);
          if (idTokens.every(tok => itemName.includes(tok) || chipset.includes(tok))) return true;

          const nameTokens = cleanName.split(/[\\s\\-]+/).filter(t => t.length >= 3 && !['edition','gaming','series','super','plus','pro'].includes(t));
          const modelNum = nameTokens.find(t => /\\d+/.test(t));
          if (modelNum && !(itemName.includes(modelNum) || chipset.includes(modelNum))) return false;
          return nameTokens.filter(t => itemName.includes(t) || chipset.includes(t)).length >= 2;
        });

        let bestMatch = null;
        if (candidates.length > 0) {
          bestMatch = candidates.find(item => item.name.toLowerCase().includes(brandLower)) || candidates[0];
        }

        if (bestMatch) {
          matchedCount++;
          const scrapedPrice = typeof bestMatch.price === 'number' ? Math.round(bestMatch.price) : Math.round(parseFloat(bestMatch.price));
          const delta = scrapedPrice - c.priceUsd;
          const deltaPct = parseFloat(((delta / c.priceUsd) * 100).toFixed(1));

          liveMarketQuotes[c.id] = {
            id: c.id,
            matchedName: bestMatch.name,
            realPrice: scrapedPrice,
            basePrice: c.priceUsd,
            deltaUsd: delta,
            deltaPct: deltaPct,
            retailerSource: 'PCPartPicker Live Scraped Index',
            datasetUrl: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/' + epForKind(c.kind),
            inStock: true,
            lastCrawledAt: new Date().toISOString(),
            rawMatch: bestMatch
          };
          crawlerTerminalLogs.push('[MATCH] ' + c.brand + ' ' + c.name + ' -> $' + scrapedPrice + ' (MSRP $' + c.priceUsd + ', ' + (delta >= 0 ? '+' : '') + delta + ')');
        }
      });

      crawlerTerminalLogs.push('[COMPLETE] Live scrape finished. ' + totalPartsFetched.toLocaleString() + ' real parts processed. ' + matchedCount + ' catalog parts matched.');
      isCrawlingLive = false;
      renderMarketDealsView();
      renderCatalog();
      renderChosenRigView();
      syncBuildAnalysis();
    }

    // Render View 3: Live Market Deals
    function renderMarketDealsView() {
      const container = document.getElementById('market-view-container');
      if (!container) return;

      let quotesHtml = '';
      const installed = Object.values(activeBuild).filter(Boolean);
      const itemsToTrack = installed.length > 0 ? installed : allComponents.slice(0, 10);

      itemsToTrack.forEach(c => {
        const q = liveMarketQuotes[c.id] || {
          realPrice: c.priceUsd,
          basePrice: c.priceUsd,
          deltaUsd: 0,
          deltaPct: 0,
          retailerSource: 'PCPartPicker Live Scraped Index',
          matchedName: c.name,
          datasetUrl: 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/' + epForKind(c.kind)
        };

        const deltaClass = q.deltaUsd > 0 ? 'delta-scalp' : (q.deltaUsd < 0 ? 'delta-discount' : 'delta-neutral');
        const deltaLabel = q.deltaUsd > 0
          ? '+' + q.deltaUsd + ' USD (+' + q.deltaPct + '%) [Market Scalped]'
          : (q.deltaUsd < 0 ? q.deltaUsd + ' USD (' + q.deltaPct + '%) [Retail Discount]' : '0 USD (Reference MSRP)');

        const isRawExpanded = rawJsonExpanded[c.id];
        const rawJsonBlock = isRawExpanded
          ? '<pre class="crawler-raw-json">' + JSON.stringify(q.rawMatch || q, null, 2) + '</pre>'
          : '';

        quotesHtml +=
          '<div class="part-card" style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">' +
              '<div>' +
                '<span class="part-brand-badge" style="font-size: 9px; padding: 1px 5px;">' + c.brand + '</span>' +
                '<div style="font-size: 13px; font-weight: 800; color: #fff; margin-top: 3px;">' + c.name + '</div>' +
                '<div style="font-family: var(--font-mono); font-size: 10px; color: #84cc16; margin-top: 2px;">' +
                  'MATCHED: ' + (q.matchedName || c.name) +
                '</div>' +
              '</div>' +
              '<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">' +
                '<div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); text-decoration: line-through;">MSRP $' + c.priceUsd + '</div>' +
                '<div style="font-family: var(--font-mono); font-size: 15px; font-weight: 800; color: #34d399;">$' + (q.realPrice || c.priceUsd) + '</div>' +
                '<span class="market-delta-pill ' + deltaClass + '">' + deltaLabel + '</span>' +
              '</div>' +
            '</div>' +

            '<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; font-family: var(--font-mono); font-size: 10px;">' +
              '<span style="color: var(--text-dim);">SOURCE: <span style="color: #cbd5e1;">' + (q.retailerSource || 'PCPartPicker Live Scraped Index') + '</span></span>' +
              '<div style="display: flex; gap: 6px;">' +
                '<button class="action-btn btn-inspect-raw" data-id="' + c.id + '" style="padding: 3px 8px; font-size: 9px;">' + (isRawExpanded ? 'Hide Raw JSON' : 'Inspect Raw Data') + '</button>' +
                '<a href="' + (q.datasetUrl || 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/' + epForKind(c.kind)) + '" target="_blank" rel="noopener" class="action-btn" style="padding: 3px 8px; font-size: 9px; text-decoration: none; display: inline-block;">View Dataset</a>' +
              '</div>' +
            '</div>' +
            rawJsonBlock +
          '</div>';
      });

      const logText = crawlerTerminalLogs.slice(-15).join('\\n');

      container.innerHTML =
        '<div class="crawler-status-box">' +
          '<div class="crawler-header-row">' +
            '<div class="crawler-info">' +
              '<span class="crawler-title">Live Hardware Price Tracker</span>' +
              '<span class="crawler-sub">Open Source Dataset: docyx/pc-part-dataset (45,951 Live Retail Records)</span>' +
            '</div>' +
            '<span class="market-delta-pill delta-discount">' + (isCrawlingLive ? 'Crawling in Browser...' : 'Live Feed Active') + '</span>' +
          '</div>' +
          '<div class="crawler-btn-group">' +
            '<button class="crawler-action-btn ' + (isCrawlingLive ? '' : 'active-green') + '" id="btn-live-browser-crawl">' +
              (isCrawlingLive ? 'Downloading Live Data...' : 'Fetch Live Prices') +
            '</button>' +
            '<button class="crawler-action-btn" id="btn-sync-backend-prices">Sync API Prices</button>' +
            '<button class="crawler-action-btn ' + (applyRealMarketPrices ? 'active-green' : '') + '" id="btn-toggle-apply-market">' +
              (applyRealMarketPrices ? 'Active: Using Live Market Prices' : 'Apply Live Prices to Build') +
            '</button>' +
          '</div>' +
          '<div class="crawler-log-box" id="crawler-log-box">' + logText + '</div>' +
        '</div>' +

        '<div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">' +
          '<span style="font-family: var(--font-sans); font-size: 12px; font-weight: 700; color: #fff;">' +
            (installed.length > 0 ? 'Installed Build Hardware (' + installed.length + ')' : 'Tracked Hardware Deals') +
          '</span>' +
          '<span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">Live Retail Data</span>' +
        '</div>' +

        '<div style="display: flex; flex-direction: column; gap: 8px;">' +
          quotesHtml +
        '</div>';

      const logBox = document.getElementById('crawler-log-box');
      if (logBox) logBox.scrollTop = logBox.scrollHeight;

      document.getElementById('btn-live-browser-crawl')?.addEventListener('click', () => {
        executeLiveBrowserCrawl();
      });

      document.getElementById('btn-sync-backend-prices')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = 'Syncing...';
        try {
          const res = await fetch('/api/live-prices');
          const data = await res.json();
          liveMarketQuotes = data.quotes || {};
          crawlerTerminalLogs.push('[' + new Date().toLocaleTimeString() + '] Synced authentic quotes from API endpoint (' + Object.keys(liveMarketQuotes).length + ' parts matched).');
          renderMarketDealsView();
          renderCatalog();
          renderChosenRigView();
          syncBuildAnalysis();
        } catch {
          btn.textContent = 'Sync Failed';
        }
      });

      document.getElementById('btn-toggle-apply-market')?.addEventListener('click', () => {
        applyRealMarketPrices = !applyRealMarketPrices;
        crawlerTerminalLogs.push('[CONFIG] Real Scraped Market Pricing on Build: ' + (applyRealMarketPrices ? 'ENABLED' : 'DISABLED'));
        syncBuildAnalysis();
        renderBuildSpecView();
        renderChosenRigView();
        renderCatalog();
        renderMarketDealsView();
      });

      container.querySelectorAll('.btn-inspect-raw').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          rawJsonExpanded[id] = !rawJsonExpanded[id];
          renderMarketDealsView();
        });
      });
    }

    // Render View 4: Thermal & Acoustics Bench
    function renderThermalBenchView() {
      const container = document.getElementById('thermal-bench-container');
      if (!container) return;

      const idleDb = 22.4;
      const loadDb = stressActive ? 42.8 : (selectedFanProfile === 'silent' ? 24.1 : 31.5);

      container.innerHTML =
        '<div class="spec-section-card">' +
          '<div class="spec-section-header">' +
            '<span>Fan Acoustic Profile</span>' +
            '<span>' + selectedFanProfile.toUpperCase() + '</span>' +
          '</div>' +
          '<div style="display: flex; gap: 6px;">' +
            '<button class="action-btn ' + (selectedFanProfile === 'silent' ? 'primary' : '') + '" data-fan="silent">Silent (800 RPM)</button>' +
            '<button class="action-btn ' + (selectedFanProfile === 'balanced' ? 'primary' : '') + '" data-fan="balanced">Balanced (1420 RPM)</button>' +
            '<button class="action-btn ' + (selectedFanProfile === 'extreme' ? 'primary' : '') + '" data-fan="extreme">Extreme (2750 RPM)</button>' +
          '</div>' +
          '<div class="spec-row" style="margin-top: 8px;">' +
            '<span class="spec-key">Chassis Sound Pressure (Idle)</span>' +
            '<span class="spec-val">' + idleDb + ' dBA (Whisper Quiet)</span>' +
          '</div>' +
          '<div class="spec-row" style="margin-top: 8px;">' +
            '<span class="spec-key">Chassis Sound Pressure (Peak Load)</span>' +
            '<span class="spec-val">' + loadDb + ' dBA</span>' +
          '</div>' +
        '</div>' +

        '<div class="spec-section-card">' +
          '<div class="spec-section-header">' +
            '<span>Live Junction Telemetry</span>' +
            '<span>' + (stressActive ? '100% Load' : 'Normal') + '</span>' +
          '</div>' +
          '<div class="spec-row">' +
            '<span class="spec-key">CPU Tdie Junction</span>' +
            '<span class="spec-val" style="color: ' + (currentCpuTemp > 80 ? '#ef4444' : '#10f06a') + ';">' + currentCpuTemp + '°C</span>' +
          '</div>' +
          '<div class="spec-row">' +
            '<span class="spec-key">GPU Core Temperature</span>' +
            '<span class="spec-val" style="color: ' + (currentGpuTemp > 75 ? '#ef4444' : '#10f06a') + ';">' + currentGpuTemp + '°C</span>' +
          '</div>' +
          '<div class="spec-row">' +
            '<span class="spec-key">GPU Hotspot Junction</span>' +
            '<span class="spec-val">' + (currentGpuTemp + 11) + '°C</span>' +
          '</div>' +
          '<div class="spec-row">' +
            '<span class="spec-key">VRM MOS Temperature</span>' +
            '<span class="spec-val">46°C</span>' +
          '</div>' +
          '<div class="spec-row">' +
            '<span class="spec-key">Liquid Coolant Reservoir</span>' +
            '<span class="spec-val">34°C</span>' +
          '</div>' +
        '</div>';

      container.querySelectorAll('[data-fan]').forEach(btn => {
        btn.onclick = () => {
          selectedFanProfile = btn.dataset.fan;
          updateAioLcdDisplay();
          renderThermalBenchView();
        };
      });
    }

    // Toggle Install
    function toggleInstall(comp) {
      const kStr = typeof comp.kind === 'string' ? comp.kind.toLowerCase() : ['processor','graphics_card','motherboard','memory','storage','power_supply','cooler','chassis'][comp.kind];
      const slotKeyMap = { processor: 'cpu', graphics_card: 'gpu', motherboard: 'motherboard', memory: 'memory', storage: 'storage', power_supply: 'psu', cooler: 'cooler', chassis: 'chassis' };
      const slotKey = slotKeyMap[kStr] || 'cpu';

      if (activeBuild[slotKey] && activeBuild[slotKey].id === comp.id) {
        activeBuild[slotKey] = null;
        showToast('Removed ' + comp.name);
      } else {
        activeBuild[slotKey] = comp;
        showToast('Installed ' + comp.name);
      }
      update3DScene();
      syncBuildAnalysis();
      renderChosenRigView();
      renderCatalog();
      renderBuildSpecView();
      renderMarketDealsView();
    }

    function inspectComponent(comp) {
      const kStr = typeof comp.kind === 'string' ? comp.kind.toLowerCase() : ['processor','graphics_card','motherboard','memory','storage','power_supply','cooler','chassis'][comp.kind];
      const slotKeyMap = { processor: 'cpu', graphics_card: 'gpu', motherboard: 'motherboard', memory: 'memory', storage: 'storage', power_supply: 'psu', cooler: 'cooler', chassis: 'chassis' };
      const slotKey = slotKeyMap[kStr] || 'cpu';
      const anc = labelAnchors.find(a => a.compKey === slotKey);
      if (anc) focusOnAnchor(anc);
      showToast('Viewing ' + comp.name);
    }

    function update3DScene() {
      if (activeBuild.motherboard) buildMotherboardMesh(activeBuild.motherboard);
      else if (meshNodes.motherboard) { benchGroup.remove(meshNodes.motherboard); meshNodes.motherboard = null; }

      if (activeBuild.cpu) buildCpuMesh(activeBuild.cpu);
      else if (meshNodes.cpu) { benchGroup.remove(meshNodes.cpu); meshNodes.cpu = null; }

      if (activeBuild.memory) buildRamMesh(activeBuild.memory);
      else if (meshNodes.ram) { benchGroup.remove(meshNodes.ram); meshNodes.ram = null; }

      if (activeBuild.gpu) buildGpuMesh(activeBuild.gpu);
      else if (meshNodes.gpu) { benchGroup.remove(meshNodes.gpu); meshNodes.gpu = null; }

      if (activeBuild.cooler) buildCoolerMesh(activeBuild.cooler);
      else if (meshNodes.cooler) { benchGroup.remove(meshNodes.cooler); meshNodes.cooler = null; }

      if (activeBuild.psu) buildPsuMesh(activeBuild.psu);
      else if (meshNodes.psu) { benchGroup.remove(meshNodes.psu); meshNodes.psu = null; }

      buildGlassPanel();
    }

    async function syncBuildAnalysis() {
      const payload = {};
      for (const [k, v] of Object.entries(activeBuild)) {
        if (v) payload[k] = v.id;
      }
      payload.resolution = currentResolution;

      const vRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const vData = await vRes.json();
      let displayCost = vData.totalCostUsd;
      if (applyRealMarketPrices) {
        let realTotal = 0;
        for (const [k, v] of Object.entries(activeBuild)) {
          if (v) {
            const q = liveMarketQuotes[v.id];
            realTotal += (q && q.realPrice) ? q.realPrice : v.priceUsd;
          }
        }
        displayCost = realTotal;
      }

      // Animate Top Telemetry Numbers Smoothly
      const prevCost = window._currentDisplayCost !== undefined ? window._currentDisplayCost : 0;
      window._currentDisplayCost = displayCost;
      const telemCostEl = document.getElementById('telem-cost');
      if (applyRealMarketPrices) {
        animateRollingNumber(telemCostEl, prevCost, displayCost, 450, v => '<span style="color:#34d399;" title="Calculated from authentic live scraped market prices">$' + Math.round(v).toLocaleString() + '</span>');
      } else {
        animateRollingNumber(telemCostEl, prevCost, displayCost, 450, v => '$' + Math.round(v).toLocaleString());
      }

      const prevWatts = window._currentDisplayWatts !== undefined ? window._currentDisplayWatts : 0;
      window._currentDisplayWatts = vData.estimatedPeakWatts;
      animateRollingNumber(document.getElementById('telem-power'), prevWatts, vData.estimatedPeakWatts, 450, v => Math.round(v));

      const badge = document.getElementById('compat-status-btn');
      if (vData.isCompatible) {
        badge.className = 'compat-badge';
        badge.textContent = 'Clearances Verified';
      } else {
        badge.className = 'compat-badge incompatible';
        badge.textContent = vData.errors.length + ' Clearance Violations';
      }

      const pRes = await fetch('/api/power', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const pData = await pRes.json();

      const prevCpuTemp = window._currentCpuTemp !== undefined ? window._currentCpuTemp : 28;
      window._currentCpuTemp = pData.cpuLoadTempC;
      currentCpuTemp = pData.cpuLoadTempC;
      animateRollingNumber(document.getElementById('telem-thermal-cpu'), prevCpuTemp, pData.cpuLoadTempC, 450, v => Math.round(v));

      const prevGpuTemp = window._currentGpuTemp !== undefined ? window._currentGpuTemp : 28;
      window._currentGpuTemp = pData.gpuLoadTempC;
      currentGpuTemp = pData.gpuLoadTempC;
      animateRollingNumber(document.getElementById('telem-thermal-gpu'), prevGpuTemp, pData.gpuLoadTempC, 450, v => Math.round(v));
      updateAioLcdDisplay();

      const bRes = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      currentBenchmarkList = await bRes.json();
      renderBenchmarks();
    }

    // Render Steam Benchmarks with Interactive Cursor Momentum Pan
    function renderBenchmarks() {
      const grid = document.getElementById('game-grid');
      if (!grid) return;

      const query = (document.getElementById('game-search-input')?.value || '').toLowerCase().trim();

      const filtered = currentBenchmarkList.filter(g => {
        if (!query) return true;
        return (g.gameName || '').toLowerCase().includes(query) || (g.qualityPreset || '').toLowerCase().includes(query);
      });

      const existingCards = {};
      grid.querySelectorAll('.game-card').forEach(c => {
        if (c.dataset.game) existingCards[c.dataset.game] = c;
      });

      grid.innerHTML = '';

      filtered.forEach(g => {
        const steamMeta = STEAM_GAME_ASSETS[g.gameName] || {
          header: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80'
        };

        const low1 = g.low1pctFps ?? g.low1PctFps ?? Math.round(g.avgFps * 0.74);
        const prevCard = existingCards[g.gameName];
        const prevFps = prevCard ? (prevCard._prevFps || g.avgFps) : Math.round(g.avgFps * 0.75);
        const prevLow1 = prevCard ? (prevCard._prevLow1 || low1) : Math.round(low1 * 0.75);

        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.game = g.gameName;
        card._prevFps = g.avgFps;
        card._prevLow1 = low1;
        card._prevGpu = g.gpuBottleneckPct;

        card.innerHTML =
          '<div class="game-banner-box">' +
            '<img src="' + steamMeta.header + '" alt="' + g.gameName + '" />' +
            '<span class="game-preset-tag">' + (g.qualityPreset || 'Ultra') + '</span>' +
          '</div>' +
          '<div class="game-meta-box">' +
            '<div class="game-title" title="' + g.gameName + '">' + g.gameName + '</div>' +
            '<div class="game-fps-row">' +
              '<div class="game-fps"><span class="fps-num">' + prevFps + '</span><span class="game-fps-unit">FPS</span></div>' +
              '<span class="game-badge-load">' + g.gpuBottleneckPct + '% GPU</span>' +
            '</div>' +
            '<div class="game-sub">' +
              '<div class="bench-sub-stat"><span class="stat-lbl">1% LOW</span> <span class="stat-val low1-val">' + prevLow1 + ' FPS</span></div>' +
              '<div class="bench-sub-stat"><span class="stat-lbl">STATUS</span> <span class="stat-val">' + (g.gpuBottleneckPct > 88 ? 'OPTIMAL' : 'BALANCED') + '</span></div>' +
            '</div>' +
            '<div class="bottle-bar"><div class="bottle-fill" style="width: ' + g.gpuBottleneckPct + '%"></div></div>' +
          '</div>';

        grid.appendChild(card);

        const bImg = card.querySelector('.game-banner-box img');
        if (bImg) {
          bImg.onerror = function() {
            this.onerror = null;
            this.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80';
          };
        }

        const fpsEl = card.querySelector('.fps-num');
        const low1El = card.querySelector('.low1-val');
        animateRollingNumber(fpsEl, prevFps, g.avgFps, 420, v => Math.round(v));
        animateRollingNumber(low1El, prevLow1, low1, 420, v => Math.round(v) + ' FPS');
      });
    }

    // Sleek Custom Floating Carousel Chevrons
    document.getElementById('tray-nav-left')?.addEventListener('click', () => {
      gameGrid.scrollBy({ left: -360, behavior: 'smooth' });
    });
    document.getElementById('tray-nav-right')?.addEventListener('click', () => {
      gameGrid.scrollBy({ left: 360, behavior: 'smooth' });
    });

    // Panel Closing and Expanding (Requested by User!)
    const sidebar = document.getElementById('workstation-sidebar');
    const benchTray = document.getElementById('benchmark-tray');
    const reopenSidebarBtn = document.getElementById('btn-reopen-sidebar');
    const reopenBenchBtn = document.getElementById('btn-reopen-bench');
    const spatialHud = document.getElementById('spatial-hud');
    const viewportTools = document.getElementById('viewport-tools');

    document.getElementById('btn-close-sidebar')?.addEventListener('click', () => {
      sidebar.classList.add('collapsed');
      reopenSidebarBtn.style.display = 'flex';
      spatialHud.classList.add('expanded');
      benchTray.classList.add('expanded');
      viewportTools.classList.add('full-width');
      showToast('Sidebar collapsed for full 3D view');
    });

    reopenSidebarBtn.addEventListener('click', () => {
      sidebar.classList.remove('collapsed');
      reopenSidebarBtn.style.display = 'none';
      spatialHud.classList.remove('expanded');
      benchTray.classList.remove('expanded');
      viewportTools.classList.remove('full-width');
    });

    document.getElementById('btn-close-bench')?.addEventListener('click', () => {
      benchTray.classList.add('collapsed');
      reopenBenchBtn.style.display = 'flex';
      showToast('Gaming Telemetry collapsed');
    });

    reopenBenchBtn.addEventListener('click', () => {
      benchTray.classList.remove('collapsed');
      reopenBenchBtn.style.display = 'none';
    });

    // Search and Input Listeners
    document.getElementById('part-search-input')?.addEventListener('input', renderCatalog);
    document.getElementById('part-sort-select')?.addEventListener('change', renderCatalog);
    document.getElementById('game-search-input')?.addEventListener('input', renderBenchmarks);

    // Panel Switcher Tabs
    document.querySelectorAll('.tab-switch-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.tab-switch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;

        const views = ['chosen', 'catalog', 'build', 'market', 'thermal'];
        views.forEach(v => {
          const el = document.getElementById('view-' + v);
          if (el) {
            if (activeTab === v) {
              el.style.display = 'flex';
              el.classList.remove('tab-entering');
              void el.offsetWidth;
              el.classList.add('tab-entering');
            } else {
              el.style.display = 'none';
            }
          }
        });

        if (activeTab === 'chosen') renderChosenRigView();
        if (activeTab === 'catalog') renderCatalog();
        if (activeTab === 'build') renderBuildSpecView();
        if (activeTab === 'market') renderMarketDealsView();
        if (activeTab === 'thermal') renderThermalBenchView();
      };
    });

    // Toggle Floating Bottom FPS Benchmarks from Viewport Toolbar
    document.getElementById('btn-quick-bench')?.addEventListener('click', () => {
      const bTray = document.getElementById('benchmark-tray');
      const bReopen = document.getElementById('btn-reopen-bench');
      if (bTray) {
        if (bTray.classList.contains('collapsed')) {
          bTray.classList.remove('collapsed');
          if (bReopen) bReopen.style.display = 'none';
        } else {
          bTray.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // Category Nav
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        renderCatalog();
      };
    });

    // Resolution Buttons
    document.querySelectorAll('.res-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentResolution = btn.dataset.res;
        syncBuildAnalysis();
      };
    });

    // Lighting Presets
    document.querySelectorAll('[data-light]').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('[data-light]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLightMode = btn.dataset.light;

        if (activeLightMode === 'studio') {
          ambientLight.color.setHex(0xffffff);
          ambientLight.intensity = 1.4;
          keyLight.color.setHex(0xfefefe);
          keyLight.intensity = 2.0;
          rimLight.color.setHex(0xf1f5f9);
          rimLight.intensity = 1.1;
          scene.background.setHex(0x07090e);
        } else if (activeLightMode === 'ice') {
          ambientLight.color.setHex(0xe2e8f0);
          ambientLight.intensity = 1.3;
          keyLight.color.setHex(0xffffff);
          keyLight.intensity = 2.0;
          rimLight.color.setHex(0x93c5fd);
          rimLight.intensity = 1.2;
          scene.background.setHex(0x060910);
        } else if (activeLightMode === 'stealth') {
          ambientLight.color.setHex(0x94a3b8);
          ambientLight.intensity = 0.8;
          keyLight.color.setHex(0xd1d5db);
          keyLight.intensity = 1.4;
          rimLight.color.setHex(0x475569);
          rimLight.intensity = 0.7;
          scene.background.setHex(0x040507);
        }
      };
    });

    // Smooth Animated Camera Angle Presets
    document.getElementById('btn-cam-iso').onclick = () => {
      smoothTransitionCamera(new THREE.Vector3(240, 180, 290), new THREE.Vector3(0, 42, 0));
      controls.autoRotate = false;
      document.getElementById('btn-auto-rotate').classList.remove('active');
    };
    document.getElementById('btn-cam-front').onclick = () => {
      smoothTransitionCamera(new THREE.Vector3(0, 50, 410), new THREE.Vector3(0, 50, 0));
      controls.autoRotate = false;
      document.getElementById('btn-auto-rotate').classList.remove('active');
    };
    document.getElementById('btn-cam-top').onclick = () => {
      smoothTransitionCamera(new THREE.Vector3(0, 430, 0.1), new THREE.Vector3(0, 30, 0));
      controls.autoRotate = false;
      document.getElementById('btn-auto-rotate').classList.remove('active');
    };
    document.getElementById('btn-cam-side').onclick = () => {
      smoothTransitionCamera(new THREE.Vector3(420, 50, 0), new THREE.Vector3(0, 50, 0));
      controls.autoRotate = false;
      document.getElementById('btn-auto-rotate').classList.remove('active');
    };
    document.getElementById('btn-auto-rotate').onclick = (e) => {
      controls.autoRotate = !controls.autoRotate;
      controls.autoRotateSpeed = 2.0;
      e.target.classList.toggle('active', controls.autoRotate);
    };

    // Smooth Animated Zoom Buttons & Distance Range Slider
    const zoomSlider = document.getElementById('cam-zoom-slider');
    document.getElementById('btn-zoom-in').onclick = () => {
      const curDist = camera.position.distanceTo(controls.target);
      const newDist = Math.max(controls.minDistance, curDist * 0.75);
      const dir = camera.position.clone().sub(controls.target).normalize();
      const newPos = controls.target.clone().addScaledVector(dir, newDist);
      smoothTransitionCamera(newPos, controls.target);
    };
    document.getElementById('btn-zoom-out').onclick = () => {
      const curDist = camera.position.distanceTo(controls.target);
      const newDist = Math.min(controls.maxDistance, curDist * 1.30);
      const dir = camera.position.clone().sub(controls.target).normalize();
      const newPos = controls.target.clone().addScaledVector(dir, newDist);
      smoothTransitionCamera(newPos, controls.target);
    };
    zoomSlider.addEventListener('input', () => {
      const targetDist = parseFloat(zoomSlider.value);
      const dir = camera.position.clone().sub(controls.target).normalize();
      const newPos = controls.target.clone().addScaledVector(dir, targetDist);
      smoothTransitionCamera(newPos, controls.target);
    });

    // Reset Camera
    document.getElementById('btn-reset-cam').onclick = () => {
      smoothTransitionCamera(new THREE.Vector3(240, 180, 290), new THREE.Vector3(0, 42, 0));
      controls.autoRotate = false;
      document.getElementById('btn-auto-rotate').classList.remove('active');
    };

    // Toggle Labels Button & Hotkey L
    function toggleLabelsState() {
      showLabels = !showLabels;
      const btn = document.getElementById('btn-toggle-labels');
      btn.textContent = showLabels ? 'LABELS: ON' : 'LABELS: OFF';
      btn.classList.toggle('active-cyan', showLabels);
      showToast(showLabels ? '3D Floating Part Labels Shown' : '3D Part Labels Hidden');
    }
    document.getElementById('btn-toggle-labels').onclick = toggleLabelsState;
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'l' || e.key === 'L') {
        toggleLabelsState();
      }
    });

    // Exploded View
    document.getElementById('btn-explode').onclick = (e) => {
      exploded = !exploded;
      e.target.classList.toggle('active', exploded);
    };

    // Wireframe
    document.getElementById('btn-wireframe').onclick = (e) => {
      wireframeMode = !wireframeMode;
      e.target.classList.toggle('active', wireframeMode);
      benchGroup.traverse(node => {
        if (node.isMesh && node !== basePlate && node !== meshNodes.glassPanel && node !== meshNodes.aioScreenMesh) {
          node.material.wireframe = wireframeMode;
        }
      });
    };

    // Thermal Heatmap
    document.getElementById('btn-thermal').onclick = (e) => {
      thermalMode = !thermalMode;
      e.target.classList.toggle('active', thermalMode);
      benchGroup.traverse(node => {
        if (node.isMesh && node !== basePlate && node !== meshNodes.glassPanel && node !== meshNodes.aioScreenMesh) {
          if (thermalMode) {
            node.userData.originalMat = node.material;
            const heatColor = currentCpuTemp > 80 ? 0xef4444 : currentCpuTemp > 65 ? 0xf59e0b : 0x22c55e;
            node.material = new THREE.MeshBasicMaterial({ color: heatColor, wireframe: false });
          } else if (node.userData.originalMat) {
            node.material = node.userData.originalMat;
          }
        }
      });
    };

    // Side Glass Toggle
    document.getElementById('btn-glass').onclick = (e) => {
      showGlass = !showGlass;
      e.target.classList.toggle('active', showGlass);
      buildGlassPanel();
      showToast(showGlass ? 'Mounted Smoked Tempered Glass' : 'Removed Tempered Glass');
    };

    // Stress Test (Compact text so it never overflows)
    document.getElementById('btn-stress').onclick = (e) => {
      stressActive = !stressActive;
      e.target.classList.toggle('active', stressActive);
      e.target.textContent = stressActive ? 'STRESSING' : 'STRESS 100%';

      const prevCpu = currentCpuTemp;
      const prevGpu = currentGpuTemp;

      if (stressActive) {
        currentCpuTemp = 82;
        currentGpuTemp = 74;
        if (meshNodes.gpuLogoMat) {
          meshNodes.gpuLogoMat.color.setHex(0xef4444);
          meshNodes.gpuLogoMat.emissive.setHex(0xef4444);
        }
      } else {
        currentCpuTemp = 36;
        currentGpuTemp = 32;
        if (meshNodes.gpuLogoMat) {
          meshNodes.gpuLogoMat.color.setHex(0x10f06a);
          meshNodes.gpuLogoMat.emissive.setHex(0x10f06a);
        }
      }
      animateRollingNumber(document.getElementById('telem-thermal-cpu'), prevCpu, currentCpuTemp, 400, v => Math.round(v));
      animateRollingNumber(document.getElementById('telem-thermal-gpu'), prevGpu, currentGpuTemp, 400, v => Math.round(v));
      updateAioLcdDisplay();
      if (activeTab === 'thermal') renderThermalBenchView();
    };

    // Animation Loop with Smooth Camera Dampening
    let lastTime = performance.now();
    function animate() {
      requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isCameraTransitioning) {
        camera.position.lerp(targetCameraPos, 0.08);
        controls.target.lerp(targetCameraTarget, 0.08);
        controls.update();
        if (camera.position.distanceTo(targetCameraPos) < 0.6 && controls.target.distanceTo(targetCameraTarget) < 0.6) {
          camera.position.copy(targetCameraPos);
          controls.target.copy(targetCameraTarget);
          isCameraTransitioning = false;
        }
      } else {
        controls.update();
      }

      // Sync Zoom Slider with Current Camera Distance
      const curDist = camera.position.distanceTo(controls.target);
      if (Math.abs(parseFloat(zoomSlider.value) - curDist) > 3) {
        zoomSlider.value = Math.round(curDist);
      }

      const targetExplode = exploded ? 1 : 0;
      explodeProgress += (targetExplode - explodeProgress) * 0.12;

      if (meshNodes.gpu) meshNodes.gpu.position.z = 90 * explodeProgress;
      if (meshNodes.cooler) meshNodes.cooler.position.y = 60 * explodeProgress;
      if (meshNodes.ram) meshNodes.ram.position.x = 40 * explodeProgress;
      if (meshNodes.psu) meshNodes.psu.position.y = -35 * explodeProgress;

      const fanSpeed = stressActive ? 0.45 : (selectedFanProfile === 'silent' ? 0.05 : 0.09);
      meshNodes.gpuFanList.forEach(f => f.rotation.z += fanSpeed);

      if (meshNodes.coolerFanList.length > 0) {
        const pulse = Math.sin(now * 0.003) * 0.2 + 0.6;
        meshNodes.coolerFanList.forEach(h => {
          if (h.material) h.material.emissiveIntensity = pulse;
        });
      }

      updateSpatialLabels();
      renderer.render(scene, camera);
    }
    animate();

    window.onresize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Bootstrap Initial System Rig
    loadCatalog().then(() => {
      const cpu = allComponents.find(c => c.id === 'cpu_7800x3d') || allComponents.find(c => c.id === 'cpu_7950x3d');
      const mb = allComponents.find(c => c.id === 'mb_b650e') || allComponents.find(c => c.id === 'mb_x670e_hero');
      const gpu = allComponents.find(c => c.id === 'gpu_rtx_4080s') || allComponents.find(c => c.id === 'gpu_rtx_4090');
      const ram = allComponents.find(c => c.id === 'ram_dominator_titanium_64gb') || allComponents.find(c => c.id === 'ram_trident_32gb');
      const cooler = allComponents.find(c => c.id === 'cooler_icue_titan_360') || allComponents.find(c => c.id === 'cooler_arctic_360');
      const psu = allComponents.find(c => c.id === 'psu_rm1000x_shift') || allComponents.find(c => c.id === 'psu_seasonic_1000w');
      const storage = allComponents.find(c => c.id === 'ssd_samsung_990pro');
      const chassis = allComponents.find(c => c.id === 'case_5000d_airflow') || allComponents.find(c => c.id === 'case_o11_evo');

      if (cpu) activeBuild.cpu = cpu;
      if (mb) activeBuild.motherboard = mb;
      if (gpu) activeBuild.gpu = gpu;
      if (ram) activeBuild.memory = ram;
      if (cooler) activeBuild.cooler = cooler;
      if (psu) activeBuild.psu = psu;
      if (storage) activeBuild.storage = storage;
      if (chassis) activeBuild.chassis = chassis;

      update3DScene();
      syncBuildAnalysis();
      renderChosenRigView();
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(targetPath, htmlContent, 'utf8');
console.log('Successfully written updated web/index.html with collapsible panels, My Rig tab, real photos, and no bottom scrollbar! Length:', htmlContent.length);
