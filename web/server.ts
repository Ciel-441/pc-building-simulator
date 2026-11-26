import http from 'http';
import fs from 'fs';
import path from 'path';
import { getAllComponents, getComponentById } from './src/hardwareDb.js';
import { verifyCompatibility } from './src/compatibility.js';
import { calculatePowerMetrics, calculateThermalMetrics } from './src/powerThermal.js';
import { simulateBenchmarks } from './src/benchmarkEngine.js';
import { BuildConfiguration, ComponentKind } from './src/types.js';

export function parseBuildFromJson(body: string): BuildConfiguration {
  const build: BuildConfiguration = {};
  const all = getAllComponents();

  for (const c of all) {
    if (body.includes(`"${c.id}"`)) {
      switch (c.kind) {
        case 'processor':
          build.cpu = c;
          break;
        case 'graphics_card':
          build.gpu = c;
          break;
        case 'motherboard':
          build.motherboard = c;
          break;
        case 'memory':
          build.memory = c;
          break;
        case 'storage':
          build.storage = c;
          break;
        case 'power_supply':
          build.psu = c;
          break;
        case 'cooler':
          build.cooler = c;
          break;
        case 'chassis':
          build.chassis = c;
          break;
      }
    }
  }

  try {
    const obj = JSON.parse(body);
    const slots: Array<[string, ComponentKind]> = [
      ['cpu', 'processor'],
      ['gpu', 'graphics_card'],
      ['motherboard', 'motherboard'],
      ['memory', 'memory'],
      ['storage', 'storage'],
      ['psu', 'power_supply'],
      ['cooler', 'cooler'],
      ['chassis', 'chassis'],
    ];
    for (const [slot, kind] of slots) {
      if (typeof obj[slot] === 'string') {
        const comp = getComponentById(obj[slot]);
        if (comp) {
          switch (kind) {
            case 'processor':
              build.cpu = comp;
              break;
            case 'graphics_card':
              build.gpu = comp;
              break;
            case 'motherboard':
              build.motherboard = comp;
              break;
            case 'memory':
              build.memory = comp;
              break;
            case 'storage':
              build.storage = comp;
              break;
            case 'power_supply':
              build.psu = comp;
              break;
            case 'cooler':
              build.cooler = comp;
              break;
            case 'chassis':
              build.chassis = comp;
              break;
          }
        }
      }
    }
  } catch {
    // substring match fallback already executed
  }

  return build;
}

export function handleRequest(
  method: string,
  url: string,
  body: string
): { status: number; contentType: string; body: string } {
  const m = method.toUpperCase();
  const cleanPath = url.split('?')[0];

  if (m === 'OPTIONS') {
    return { status: 200, contentType: 'text/plain', body: 'OK' };
  }

  if (m === 'GET' && (cleanPath === '/' || cleanPath === '/index.html')) {
    const htmlCandidates = [
      path.join(process.cwd(), 'web', 'index.html'),
      path.join(process.cwd(), 'index.html'),
    ];
    for (const p of htmlCandidates) {
      if (fs.existsSync(p)) {
        return {
          status: 200,
          contentType: 'text/html; charset=utf-8',
          body: fs.readFileSync(p, 'utf8'),
        };
      }
    }
    return {
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: `<!DOCTYPE html><html><head><title>PC Simulator [TypeScript Engine]</title></head><body><h1>PC Building Simulator TypeScript Engine</h1><p>API Running</p></body></html>`,
    };
  }

  if (m === 'GET' && cleanPath === '/health') {
    return {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'healthy', engine: 'PC Simulator [TypeScript]', version: '0.2.0' }),
    };
  }

  if (m === 'GET' && cleanPath === '/api/components') {
    return {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(getAllComponents()),
    };
  }

  if (m === 'POST' && cleanPath === '/api/verify') {
    const build = parseBuildFromJson(body);
    const rep = verifyCompatibility(build);
    return {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(rep),
    };
  }

  if (m === 'POST' && cleanPath === '/api/power') {
    const build = parseBuildFromJson(body);
    const pwr = calculatePowerMetrics(build);
    const therm = calculateThermalMetrics(build);
    return {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...pwr, ...therm }),
    };
  }

  if (m === 'POST' && cleanPath === '/api/benchmark') {
    const build = parseBuildFromJson(body);
    const resolution = body.includes('"4k"') || body.includes('"4K"')
      ? '4k'
      : body.includes('"1080p"') || body.includes('"1080P"')
      ? '1080p'
      : '1440p';
    const bench = simulateBenchmarks(build, resolution);
    return {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(bench),
    };
  }

  if (m === 'GET' && cleanPath === '/api/live-prices') {
    try {
      const candidates = [
        path.join(process.cwd(), 'scripts', 'authentic_market_data.json'),
        path.join(process.cwd(), 'web', 'authentic_market_data.json'),
        path.join(process.cwd(), 'src', 'authentic_market_data.json'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf8');
          return {
            status: 200,
            contentType: 'application/json',
            body: raw,
          };
        }
      }
    } catch (err) {
      console.error('Error reading authentic market data:', err);
    }
    return {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'live', quotes: {} }),
    };
  }

  return {
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Not Found' }),
  };
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
export const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    const { status, contentType, body: respBody } = handleRequest(
      req.method || 'GET',
      req.url || '/',
      body
    );
    res.writeHead(status, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(respBody);
  });
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`TypeScript Server running at http://127.0.0.1:${PORT}`);
  });
}
