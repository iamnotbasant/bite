import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9579;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_stats_minimal'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const pages = await res.json();
      const page = pages.find((p) => p.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    chromeProc.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = reqId++;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  // Mobile Viewport matching iPhone (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/stats' });
  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 1: Mobile Stats Top View (Checking 4 Metric Cards & Top Bar)
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats_minimal_top.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved verified_mobile_stats_minimal_top.png');

  // Scroll 1: Petal & Mosaic
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 900, behavior: 'instant' });
      const el = document.querySelector('.overflow-y-auto');
      if (el) el.scrollTop = 900;
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  let shotScroll = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats_minimal_middle.png`, Buffer.from(shotScroll.data, 'base64'));
  console.log('Saved verified_mobile_stats_minimal_middle.png');

  // Scroll 2: Hourly Cadence Heatmap & Pebble Pie
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 2200, behavior: 'instant' });
      const el = document.querySelector('.overflow-y-auto');
      if (el) el.scrollTop = 2200;
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  let shotCadence = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats_minimal_cadence.png`, Buffer.from(shotCadence.data, 'base64'));
  console.log('Saved verified_mobile_stats_minimal_cadence.png');

  // Scroll 3: Calorie Breakdown Bar Chart and Heatmap
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 3200, behavior: 'instant' });
      const el = document.querySelector('.overflow-y-auto');
      if (el) el.scrollTop = 3200;
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  let shotBreakdown = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats_minimal_breakdown.png`, Buffer.from(shotBreakdown.data, 'base64'));
  console.log('Saved verified_mobile_stats_minimal_breakdown.png');

  // Desktop Viewport (1280x800)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 0, behavior: 'instant' });
      const el = document.querySelector('.overflow-y-auto');
      if (el) el.scrollTop = 0;
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  let shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_stats_minimal.png`, Buffer.from(shotDesktop.data, 'base64'));
  console.log('Saved verified_desktop_stats_minimal.png');

  ws.close();
  chromeProc.kill();
  console.log('Stats minimal verification completed successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
