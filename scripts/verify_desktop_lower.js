import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9580;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_stats_lower'
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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/stats' });
  await new Promise((r) => setTimeout(r, 2000));

  // Scroll to Hourly Cadence Heatmap & Pebble Pie
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 1600, behavior: 'instant' });
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  let shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_stats_cadence.png`, Buffer.from(shot1.data, 'base64'));
  console.log('Saved verified_desktop_stats_cadence.png');

  // Scroll to Daily Calorie Breakdown & Calorie Journaling Ritual Heatmap
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 3800, behavior: 'instant' });
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  let shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_stats_breakdown.png`, Buffer.from(shot2.data, 'base64'));
  console.log('Saved verified_desktop_stats_breakdown.png');

  ws.close();
  chromeProc.kill();
  console.log('Done!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
