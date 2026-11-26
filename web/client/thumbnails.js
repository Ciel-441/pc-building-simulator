// Deterministic, zero-network procedural SVG product art for every hardware item & Steam fallback banner
(function (global) {
  function escXml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function svgUri(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function cpuSvg(c) {
    const isAm5 = c.socket === 'am5';
    const isAm4 = c.socket === 'am4';
    const pcb = isAm5 || isAm4 ? '#064e3b' : '#1e3a8a';
    const pcbStroke = isAm5 || isAm4 ? '#10b981' : '#60a5fa';
    const model = escXml((c.name || '').replace(/^(AMD\s+Ryzen\s+|Intel\s+Core\s+)/i, '').slice(0, 11));
    const brand = isAm5 || isAm4 ? 'RYZEN' : 'INTEL CORE';
    const cutouts = isAm5
      ? '<rect x="18" y="21" width="6" height="4" fill="#d4af37"/><rect x="37" y="21" width="6" height="4" fill="#d4af37"/><rect x="57" y="21" width="6" height="4" fill="#d4af37"/><rect x="18" y="55" width="6" height="4" fill="#d4af37"/><rect x="37" y="55" width="6" height="4" fill="#d4af37"/><rect x="57" y="55" width="6" height="4" fill="#d4af37"/>'
      : '<rect x="20" y="18" width="40" height="44" rx="4" fill="#94a3b8"/>';

    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<defs><linearGradient id="ihs" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#64748b"/></linearGradient></defs>' +
      '<rect width="80" height="80" fill="#070b12"/>' +
      '<rect x="12" y="12" width="56" height="56" rx="5" fill="' + pcb + '" stroke="' + pcbStroke + '" stroke-width="1.5"/>' +
      cutouts +
      '<rect x="20" y="22" width="40" height="36" rx="4" fill="url(#ihs)" stroke="#475569" stroke-width="1"/>' +
      '<polygon points="22,24 27,24 22,29" fill="#eab308"/>' +
      '<text x="40" y="36" text-anchor="middle" font-family="monospace" font-size="6.5" font-weight="800" fill="#0f172a">' + brand + '</text>' +
      '<text x="40" y="47" text-anchor="middle" font-family="monospace" font-size="7.2" font-weight="900" fill="#0f172a">' + model + '</text>' +
      '<text x="40" y="55" text-anchor="middle" font-family="monospace" font-size="5" font-weight="700" fill="#334155">' + escXml((c.socket || '').toUpperCase()) + '</text>' +
      '</svg>'
    );
  }

  function gpuSvg(c) {
    const style = c.visualStyle || '';
    const isFe = style === 'founders_hourglass';
    const isRed = style === 'radeon_reference';
    const isBlue = style === 'triple_fan_translucent';
    const isDual = style === 'dual_fan_compact' || isFe;
    const accent = isRed ? '#ef4444' : isBlue ? '#38bdf8' : isFe ? '#e2e8f0' : '#10f06a';
    const bodyColor = isFe ? '#1e2430' : '#111622';
    const fans = isDual ? [28, 52] : [20, 40, 60];
    const fanR = isDual ? 10 : 8.2;
    let fanSvg = '';
    fans.forEach(fx => {
      fanSvg +=
        '<circle cx="' + fx + '" cy="40" r="' + fanR + '" fill="#06090f" stroke="#475569" stroke-width="1.3"/>' +
        '<circle cx="' + fx + '" cy="40" r="3" fill="' + (isBlue ? '#38bdf8' : '#334155') + '"/>' +
        '<path d="M' + fx + ',40 L' + (fx + fanR - 2) + ',37 M' + fx + ',40 L' + (fx - 3) + ',' + (40 + fanR - 2) + ' M' + fx + ',40 L' + (fx - fanR + 2) + ',38" stroke="#64748b" stroke-width="1.4"/>';
    });
    const hourglass = isFe
      ? '<path d="M8,26 L20,40 L8,54 M72,26 L60,40 L72,54" fill="none" stroke="#94a3b8" stroke-width="1.6"/>'
      : '';
    const tag = escXml((c.brand || 'GPU').toUpperCase() + (c.vramGb ? ' ' + c.vramGb + 'G' : ''));
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect width="80" height="80" fill="#070b12"/>' +
      '<rect x="6" y="23" width="68" height="34" rx="4" fill="' + bodyColor + '" stroke="#334155" stroke-width="1.5"/>' +
      '<rect x="14" y="21" width="52" height="3" rx="1" fill="' + accent + '"/>' +
      hourglass +
      fanSvg +
      '<rect x="18" y="57" width="24" height="3" fill="#d4af37"/>' +
      '<text x="40" y="15" text-anchor="middle" font-family="monospace" font-size="6.5" font-weight="800" fill="' + accent + '">' + tag + '</text>' +
      '</svg>'
    );
  }

  function mbSvg(c) {
    const isItx = c.formFactor === 'mini_itx';
    const isSilver = (c.colorway || '').includes('silver');
    const pcb = isSilver ? '#1e293b' : '#0d111a';
    const armor = isSilver ? '#cbd5e1' : '#263042';
    const accent = c.rgbLighting ? '#10f06a' : '#64748b';
    const w = isItx ? 42 : 48;
    const h = isItx ? 42 : 58;
    const x = (80 - w) / 2;
    const y = (80 - h) / 2;
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect width="80" height="80" fill="#070b12"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + pcb + '" stroke="#334155" stroke-width="1.5"/>' +
      '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="8" height="20" rx="1" fill="' + armor + '"/>' +
      '<rect x="' + (x + 13) + '" y="' + (y + 3) + '" width="20" height="6" rx="1" fill="' + armor + '"/>' +
      '<rect x="' + (x + 15) + '" y="' + (y + 13) + '" width="14" height="14" rx="1" fill="#1e293b" stroke="#94a3b8" stroke-width="1"/>' +
      '<rect x="' + (x + w - 10) + '" y="' + (y + 11) + '" width="2" height="18" fill="' + accent + '"/>' +
      '<rect x="' + (x + w - 6) + '" y="' + (y + 11) + '" width="2" height="18" fill="' + accent + '"/>' +
      '<rect x="' + (x + 10) + '" y="' + (y + h - 18) + '" width="26" height="3.5" fill="#cbd5e1"/>' +
      '<rect x="' + (x + w - 16) + '" y="' + (y + h - 14) + '" width="12" height="10" rx="1" fill="' + armor + '"/>' +
      '</svg>'
    );
  }

  function coolerSvg(c) {
    const isAir = c.coolerType === 'air';
    if (isAir) {
      const dark = (c.colorway || '').includes('black') || (c.colorway || '').includes('stealth');
      const fin = dark ? '#1f2937' : '#64748b';
      const cap = dark ? '#0f172a' : '#94a3b8';
      return svgUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
        '<rect width="80" height="80" fill="#070b12"/>' +
        '<rect x="17" y="16" width="18" height="42" rx="2" fill="' + fin + '" stroke="#475569"/>' +
        '<rect x="45" y="16" width="18" height="42" rx="2" fill="' + fin + '" stroke="#475569"/>' +
        '<rect x="16" y="14" width="20" height="5" rx="1" fill="' + cap + '"/>' +
        '<rect x="44" y="14" width="20" height="5" rx="1" fill="' + cap + '"/>' +
        '<path d="M24,58 L24,66 L56,66 L56,58" fill="none" stroke="#d97706" stroke-width="2.5"/>' +
        '<circle cx="40" cy="38" r="11" fill="#0b1019" stroke="#334155" stroke-width="1.5"/>' +
        '<circle cx="40" cy="38" r="3" fill="#475569"/>' +
        '</svg>'
      );
    }
    const accent = c.rgbLighting ? '#10f06a' : '#38bdf8';
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect width="80" height="80" fill="#070b12"/>' +
      '<rect x="10" y="12" width="60" height="16" rx="2" fill="#161d29" stroke="#334155"/>' +
      '<circle cx="23" cy="20" r="6" fill="#090d14" stroke="' + accent + '" stroke-width="1.2"/>' +
      '<circle cx="40" cy="20" r="6" fill="#090d14" stroke="' + accent + '" stroke-width="1.2"/>' +
      '<circle cx="57" cy="20" r="6" fill="#090d14" stroke="' + accent + '" stroke-width="1.2"/>' +
      '<path d="M18,28 C16,44 22,52 32,52 M24,28 C22,46 28,56 32,56" fill="none" stroke="#334155" stroke-width="3"/>' +
      '<circle cx="46" cy="54" r="14" fill="#111622" stroke="' + accent + '" stroke-width="2"/>' +
      '<text x="46" y="57" text-anchor="middle" font-family="monospace" font-size="8.5" font-weight="800" fill="#fff">360</text>' +
      '</svg>'
    );
  }

  function ramSvg(c) {
    const barColor = c.rgbLighting ? '#10f06a' : '#475569';
    const body = (c.colorway || '').includes('silver') ? '#94a3b8' : '#18202c';
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect width="80" height="80" fill="#070b12"/>' +
      '<rect x="22" y="13" width="13" height="52" rx="2" fill="' + body + '" stroke="#334155"/>' +
      '<rect x="44" y="13" width="13" height="52" rx="2" fill="' + body + '" stroke="#334155"/>' +
      '<rect x="22" y="13" width="13" height="5" rx="1" fill="' + barColor + '"/>' +
      '<rect x="44" y="13" width="13" height="5" rx="1" fill="' + barColor + '"/>' +
      '<rect x="24" y="65" width="9" height="3" fill="#d4af37"/>' +
      '<rect x="46" y="65" width="9" height="3" fill="#d4af37"/>' +
      '<text x="40" y="45" text-anchor="middle" font-family="monospace" font-size="7" font-weight="800" fill="#e2e8f0">' + escXml((c.memType || 'DDR5').toUpperCase()) + '</text>' +
      '</svg>'
    );
  }

  function ssdSvg(c) {
    const accent = c.rgbLighting ? '#10f06a' : '#38bdf8';
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect width="80" height="80" fill="#070b12"/>' +
      '<rect x="10" y="29" width="60" height="22" rx="2" fill="#131924" stroke="#334155" stroke-width="1.5"/>' +
      '<rect x="8" y="32" width="5" height="16" fill="#d4af37"/>' +
      '<rect x="18" y="34" width="44" height="12" rx="1" fill="#1e293b"/>' +
      '<line x1="20" y1="36" x2="60" y2="36" stroke="' + accent + '" stroke-width="1.5"/>' +
      '<text x="40" y="44" text-anchor="middle" font-family="monospace" font-size="6.2" font-weight="800" fill="#f8fafc">NVMe M.2</text>' +
      '</svg>'
    );
  }

  function psuSvg(c) {
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect width="80" height="80" fill="#070b12"/>' +
      '<rect x="12" y="18" width="56" height="44" rx="3" fill="#141924" stroke="#334155" stroke-width="1.5"/>' +
      '<circle cx="31" cy="40" r="14" fill="#080b10" stroke="#64748b" stroke-width="1.2"/>' +
      '<circle cx="31" cy="40" r="8" fill="none" stroke="#475569" stroke-width="1"/>' +
      '<circle cx="31" cy="40" r="3" fill="#d4af37"/>' +
      '<rect x="49" y="24" width="14" height="14" rx="2" fill="#090c12" stroke="#d4af37" stroke-width="1"/>' +
      '<text x="56" y="34" text-anchor="middle" font-family="monospace" font-size="6.5" font-weight="800" fill="#fef08a">80+</text>' +
      '<text x="56" y="54" text-anchor="middle" font-family="monospace" font-size="7.5" font-weight="800" fill="#10f06a">' + (c.psuWattage || 1000) + 'W</text>' +
      '</svg>'
    );
  }

  function caseSvg(c) {
    const id = c.id || '';
    const isNorth = id.includes('north');
    const isTerra = id.includes('terra');
    const isO11 = id.includes('o11');
    const fill = isTerra ? '#3f6254' : '#141923';
    const frontAccent = isNorth
      ? '<line x1="58" y1="16" x2="58" y2="62" stroke="#854d0e" stroke-width="2"/><line x1="62" y1="16" x2="62" y2="62" stroke="#713f12" stroke-width="2"/>'
      : isO11
      ? '<rect x="55" y="14" width="9" height="48" fill="rgba(56,189,248,0.16)" stroke="#475569"/>'
      : '<rect x="58" y="16" width="5" height="46" fill="#1e293b" stroke="#475569"/>';
    const interior = isTerra
      ? '<rect x="20" y="24" width="32" height="24" rx="2" fill="#0c121a" stroke="#64748b"/>'
      : '<rect x="19" y="18" width="34" height="40" rx="2" fill="#0a0f18" stroke="#38bdf8" stroke-opacity="0.35"/><circle cx="36" cy="36" r="6" fill="none" stroke="#10f06a" stroke-width="1.3"/>';
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect width="80" height="80" fill="#070b12"/>' +
      '<rect x="15" y="13" width="50" height="52" rx="4" fill="' + fill + '" stroke="#475569" stroke-width="1.5"/>' +
      interior +
      frontAccent +
      '<rect x="20" y="65" width="7" height="3" fill="#475569"/><rect x="53" y="65" width="7" height="3" fill="#475569"/>' +
      '</svg>'
    );
  }

  function getComponentThumbnail(comp) {
    if (!comp) return svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#070b12"/></svg>');
    const k = typeof comp.kind === 'string'
      ? comp.kind.toLowerCase()
      : ['processor', 'graphics_card', 'motherboard', 'memory', 'storage', 'power_supply', 'cooler', 'chassis'][comp.kind];
    if (k === 'processor') return cpuSvg(comp);
    if (k === 'graphics_card') return gpuSvg(comp);
    if (k === 'motherboard') return mbSvg(comp);
    if (k === 'cooler') return coolerSvg(comp);
    if (k === 'memory') return ramSvg(comp);
    if (k === 'storage') return ssdSvg(comp);
    if (k === 'power_supply') return psuSvg(comp);
    if (k === 'chassis') return caseSvg(comp);
    return gpuSvg(comp);
  }

  function getGameBannerFallback(gameName) {
    const title = escXml((gameName || 'BENCHMARK').slice(0, 26));
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
    const hue = Math.abs(hash) % 360;
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 90">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="hsl(' + hue + ',45%,14%)"/>' +
      '<stop offset="100%" stop-color="#06090f"/></linearGradient></defs>' +
      '<rect width="320" height="90" fill="url(#g)"/>' +
      '<circle cx="270" cy="24" r="56" fill="hsla(' + hue + ',80%,55%,0.12)"/>' +
      '<text x="16" y="48" font-family="sans-serif" font-size="14" font-weight="800" fill="#e2e8f0">' + title + '</text>' +
      '</svg>'
    );
  }

  global.HardwareThumbs = {
    getComponentThumbnail,
    getGameBannerFallback,
  };
})(window);
