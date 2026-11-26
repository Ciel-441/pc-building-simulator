const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'web', 'client');
const targetPath = path.join(__dirname, '..', 'web', 'index.html');

const css = fs.readFileSync(path.join(clientDir, 'styles.css'), 'utf8');
const thumbsJs = fs.readFileSync(path.join(clientDir, 'thumbnails.js'), 'utf8');
const sceneJs = fs.readFileSync(path.join(clientDir, 'scene3d.js'), 'utf8');
const modelsJs = fs.readFileSync(path.join(clientDir, 'models3d.js'), 'utf8');
const appJs = fs.readFileSync(path.join(clientDir, 'app.js'), 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PC Hardware Architect - 3D Rig Simulation & Performance Lab</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%2306090e'/><rect x='6' y='6' width='20' height='20' rx='3' fill='none' stroke='%2310f06a' stroke-width='2.5'/><rect x='11' y='11' width='10' height='10' fill='%2310f06a'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
${css}
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

  <!-- Floating Re-Open Pills -->
  <button class="floating-reopen-btn right-edge" id="btn-reopen-sidebar">
    <span>HARDWARE RIG</span>
    <span class="rig-counter-badge" id="reopen-rig-badge"><span class="badge-num" id="reopen-badge-rig-count">8</span><span class="badge-sep">/</span><span class="badge-total">8</span></span>
  </button>
  <button class="floating-reopen-btn bottom-edge" id="btn-reopen-bench">
    <span>GAMING BENCHMARKS</span>
    <span class="reopen-badge">FPS</span>
  </button>

  <!-- Telemetry Header -->
  <div class="spatial-hud" id="spatial-hud">
    <div class="hud-header">
      <div class="brand-cluster">
        <div class="brand-logo-badge">RIG STUDIO</div>
        <div class="brand-text-wrap">
          <div class="brand-title">PC Hardware Architect</div>
          <div class="brand-tag">Interactive 3D Rig &amp; Telemetry</div>
        </div>
      </div>
      <div class="telemetry-row">
        <div class="telem-item">
          <span class="telem-lbl">Est. Price</span>
          <span class="telem-val" id="telem-cost">$0</span>
        </div>
        <div class="telem-item">
          <span class="telem-lbl">Peak Draw</span>
          <span class="telem-val"><span id="telem-power">50</span><span class="telem-unit">W</span></span>
        </div>
        <div class="telem-item">
          <span class="telem-lbl">CPU / GPU</span>
          <span class="telem-val"><span id="telem-thermal-cpu">48</span><span class="telem-unit">°C</span><span class="telem-sep">/</span><span id="telem-thermal-gpu">60</span><span class="telem-unit">°C</span></span>
        </div>
        <div class="telem-item">
          <span class="telem-lbl">Acoustics</span>
          <span class="telem-val"><span id="telem-noise">36</span><span class="telem-unit">dBA</span></span>
        </div>
        <button class="compat-badge" id="compat-status-btn" title="Click to inspect compatibility &amp; clearances">VERIFIED</button>
        <button class="tool-btn help-pill-btn" id="btn-help-shortcuts" title="Keyboard Shortcuts (H)">?</button>
      </div>
    </div>

    <div class="compat-popover" id="compat-popover">
      <div class="compat-pop-head">
        <span class="compat-pop-title" id="compat-pop-title">System Verification</span>
        <button class="panel-close-btn" id="btn-close-compat-pop" aria-label="Close Compatibility Details">✕</button>
      </div>
      <div class="compat-pop-list" id="compat-pop-list"></div>
    </div>
  </div>

  <!-- 3D Viewport Controls Dock -->
  <div class="viewport-tools" id="viewport-tools">
    <div class="tool-group" id="cam-preset-group">
      <button class="tool-btn active" id="btn-cam-iso">ISO</button>
      <button class="tool-btn" id="btn-cam-front">FRONT</button>
      <button class="tool-btn" id="btn-cam-top">TOP</button>
      <button class="tool-btn" id="btn-cam-side">SIDE</button>
      <button class="tool-btn" id="btn-auto-rotate">ORBIT</button>
    </div>

    <div class="tool-group">
      <button class="tool-btn zoom-btn" id="btn-zoom-in">+</button>
      <div class="zoom-slider-wrap">
        <input type="range" id="cam-zoom-slider" min="60" max="850" value="380" step="5" />
      </div>
      <button class="tool-btn zoom-btn" id="btn-zoom-out">-</button>
      <button class="tool-btn" id="btn-reset-cam">RESET</button>
    </div>

    <div class="tool-group">
      <button class="tool-btn" id="btn-toggle-labels">LABELS: OFF</button>
      <button class="tool-btn" id="btn-case">CASE: OFF</button>
      <button class="tool-btn" id="btn-gpu-mount">GPU: HORIZ</button>
      <button class="tool-btn" id="btn-explode">EXPLODE</button>
      <button class="tool-btn" id="btn-wireframe">WIRE</button>
      <button class="tool-btn" id="btn-thermal">HEATMAP</button>
      <button class="tool-btn stress-btn" id="btn-stress">STRESS 100%</button>
    </div>

    <div class="tool-group">
      <button class="tool-btn active" data-light="studio">STUDIO</button>
      <button class="tool-btn" data-light="ice">ICE</button>
      <button class="tool-btn" data-light="stealth">STEALTH</button>
      <div class="rgb-sync-bar" id="rgb-sync-group" title="Synchronize 3D Hardware RGB Lighting">
        <span class="rgb-sync-lbl">RGB</span>
        <button class="rgb-swatch active" data-rgb="#10f06a" style="background:#10f06a;" aria-label="Emerald RGB"></button>
        <button class="rgb-swatch" data-rgb="#38bdf8" style="background:#38bdf8;" aria-label="Cyan RGB"></button>
        <button class="rgb-swatch" data-rgb="#ef4444" style="background:#ef4444;" aria-label="Crimson RGB"></button>
        <button class="rgb-swatch" data-rgb="#f59e0b" style="background:#f59e0b;" aria-label="Gold RGB"></button>
        <button class="rgb-swatch" data-rgb="#e2e8f0" style="background:#e2e8f0;" aria-label="White RGB"></button>
        <button class="rgb-swatch rgb-rainbow" data-rgb="rainbow" aria-label="Rainbow Cycle RGB"></button>
      </div>
      <button class="tool-btn" id="btn-quick-bench" style="color:var(--accent-emerald);">FPS TRAY</button>
    </div>
  </div>

  <!-- Workstation Multi-Panel Sidebar -->
  <div class="workstation-sidebar" id="workstation-sidebar">
    <div class="sidebar-header-bar">
      <div class="panel-switcher-tabs">
        <button class="tab-switch-btn active" data-tab="chosen">My Rig <span class="rig-counter-badge" id="tab-chosen-badge"><span class="badge-num" id="badge-rig-count">8</span><span class="badge-sep">/</span><span class="badge-total">8</span></span></button>
        <button class="tab-switch-btn" data-tab="catalog">Catalog</button>
        <button class="tab-switch-btn" data-tab="games">Games</button>
        <button class="tab-switch-btn" data-tab="build">Specs</button>
        <button class="tab-switch-btn" data-tab="market">Deals</button>
        <button class="tab-switch-btn" data-tab="thermal">Thermals</button>
      </div>
      <button class="panel-close-btn" id="btn-close-sidebar" aria-label="Close Sidebar">✕</button>
    </div>

    <div class="panel-view" id="view-chosen">
      <div class="chosen-rig-container" id="chosen-rig-container"></div>
    </div>

    <div class="panel-view" id="view-catalog" style="display: none;">
      <div class="catalog-search-bar">
        <input type="text" class="search-input" id="part-search-input" placeholder="Search name, socket, DDR5, TDP..." />
        <button class="compat-filter-btn" id="btn-filter-compat" title="Show only parts compatible with current rig">FIT ONLY</button>
        <select class="sort-select" id="part-sort-select">
          <option value="featured">Featured</option>
          <option value="price-asc">Price Low</option>
          <option value="price-desc">Price High</option>
          <option value="power">Power</option>
        </select>
      </div>
      <div class="category-nav" id="category-nav">
        <button class="cat-btn active" data-cat="all">All</button>
        <button class="cat-btn" data-cat="cpu">CPU</button>
        <button class="cat-btn" data-cat="gpu">GPU</button>
        <button class="cat-btn" data-cat="mb">Board</button>
        <button class="cat-btn" data-cat="ram">RAM</button>
        <button class="cat-btn" data-cat="cooler">Cooler</button>
        <button class="cat-btn" data-cat="storage">SSD</button>
        <button class="cat-btn" data-cat="psu">PSU</button>
        <button class="cat-btn" data-cat="chassis">Case</button>
      </div>
      <div class="component-feed" id="component-feed"></div>
    </div>

    <div class="panel-view" id="view-games" style="display: none;">
      <div class="sidebar-bench-container">
        <div class="sidebar-bench-header">
          <div class="sidebar-search-row">
            <input type="text" class="search-input" id="sidebar-game-search" placeholder="Search games or Steam Store..." />
          </div>
          <div class="sidebar-res-row">
            <button class="sidebar-res-btn" data-res="1080p">1080p FHD</button>
            <button class="sidebar-res-btn active" data-res="1440p">1440p QHD</button>
            <button class="sidebar-res-btn" data-res="4k">4K UHD</button>
          </div>
        </div>
        <div class="bench-kpi-grid">
          <div class="bench-kpi-card">
            <span class="bench-kpi-lbl">Target</span>
            <span class="bench-kpi-val" id="bench-kpi-tier">1440P ULTRA</span>
          </div>
          <div class="bench-kpi-card">
            <span class="bench-kpi-lbl">Mean FPS</span>
            <span class="bench-kpi-val tabular" id="bench-kpi-avg">--</span>
          </div>
          <div class="bench-kpi-card">
            <span class="bench-kpi-lbl">Bottleneck</span>
            <span class="bench-kpi-val tabular" id="bench-kpi-headroom">--</span>
          </div>
        </div>
        <div class="sidebar-game-feed" id="sidebar-game-list"></div>
      </div>
    </div>

    <div class="panel-view" id="view-build" style="display: none;">
      <div class="spec-sheet-container" id="spec-sheet-container"></div>
    </div>

    <div class="panel-view" id="view-market" style="display: none;">
      <div class="market-view-container" id="market-view-container"></div>
    </div>

    <div class="panel-view" id="view-thermal" style="display: none;">
      <div class="spec-sheet-container" id="thermal-bench-container"></div>
    </div>
  </div>

  <!-- Bottom Gaming Benchmark Tray -->
  <div class="benchmark-tray" id="benchmark-tray">
    <div class="tray-header">
      <div class="tray-title-cluster">
        <div class="tray-title">GAMING BENCHMARKS</div>
        <div class="tray-subtitle">40 Titles + Live Steam Search</div>
      </div>
      <div class="game-search-box">
        <input type="text" class="game-search-input" id="game-search-input" placeholder="Filter games (Cyberpunk, CS2)..." />
      </div>
      <div class="tray-right-controls">
        <div class="res-toggles">
          <button class="res-btn" data-res="1080p">1080p</button>
          <button class="res-btn active" data-res="1440p">1440p</button>
          <button class="res-btn" data-res="4k">4K</button>
        </div>
        <div class="tray-carousel-nav">
          <button class="tray-header-nav-btn" id="tray-nav-left" aria-label="Previous Games">‹</button>
          <button class="tray-header-nav-btn" id="tray-nav-right" aria-label="Next Games">›</button>
        </div>
        <button class="panel-close-btn" id="btn-close-bench" aria-label="Hide Gaming Benchmarks">✕</button>
      </div>
    </div>
    <div class="game-carousel-wrap">
      <div class="game-grid" id="game-grid"></div>
    </div>
  </div>

  <script>
${thumbsJs}
${sceneJs}
${modelsJs}
${appJs}
  </script>
</body>
</html>
`;

fs.writeFileSync(targetPath, htmlContent, 'utf8');
console.log('Generated web/index.html cleanly (' + htmlContent.length + ' bytes)');
