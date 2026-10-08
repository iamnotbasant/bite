import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9559;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_analytics'
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
    console.error('Failed to get page debugger URL');
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
  await send('DOM.enable');

  async function evaluateScript(script) {
    return await send('Runtime.evaluate', { expression: script, returnByValue: true });
  }

  // --- DESKTOP VIEW (1280 x 950) ---
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 950,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/stats' });
  await new Promise((r) => setTimeout(r, 2000));

  // Scroll to HourlyCadenceHeatmap
  await evaluateScript(`
    (() => {
      const el = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Hourly Meal'));
      if (el) {
        el.scrollIntoView({ block: 'start' });
        const scrollers = Array.from(document.querySelectorAll('*')).filter(node => {
          const style = window.getComputedStyle(node);
          return (style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
        });
        scrollers.forEach(s => {
          const rect = el.getBoundingClientRect();
          const sRect = s.getBoundingClientRect();
          s.scrollTop += (rect.top - sRect.top) - 20;
        });
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 800));
  const shotDesktopHeatmap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_cadence_heatmap.png`, Buffer.from(shotDesktopHeatmap.data, 'base64'));

  // Scroll to PebblePieChart
  await evaluateScript(`
    (() => {
      const el = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Pebble Distribution'));
      if (el) {
        el.scrollIntoView({ block: 'start' });
        const scrollers = Array.from(document.querySelectorAll('*')).filter(node => {
          const style = window.getComputedStyle(node);
          return (style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
        });
        scrollers.forEach(s => {
          const rect = el.getBoundingClientRect();
          const sRect = s.getBoundingClientRect();
          s.scrollTop += (rect.top - sRect.top) - 20;
        });
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 800));
  const shotDesktopPebble = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_pebble_pie.png`, Buffer.from(shotDesktopPebble.data, 'base64'));

  // Full Stats View capture
  const fullStatsDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_stats_reference.png`, Buffer.from(fullStatsDesktop.data, 'base64'));

  // --- MOBILE VIEW (390 x 844) ---
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await new Promise((r) => setTimeout(r, 800));

  // Scroll to HourlyCadenceHeatmap on mobile
  await evaluateScript(`
    (() => {
      const el = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Hourly Meal'));
      if (el) {
        el.scrollIntoView({ block: 'start' });
        const scrollers = Array.from(document.querySelectorAll('*')).filter(node => {
          const style = window.getComputedStyle(node);
          return (style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
        });
        scrollers.forEach(s => {
          const rect = el.getBoundingClientRect();
          const sRect = s.getBoundingClientRect();
          s.scrollTop += (rect.top - sRect.top) - 20;
        });
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 800));
  const shotMobileHeatmap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_cadence_heatmap.png`, Buffer.from(shotMobileHeatmap.data, 'base64'));

  // Scroll to PebblePieChart on mobile
  await evaluateScript(`
    (() => {
      const el = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Pebble Distribution'));
      if (el) {
        el.scrollIntoView({ block: 'start' });
        const scrollers = Array.from(document.querySelectorAll('*')).filter(node => {
          const style = window.getComputedStyle(node);
          return (style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
        });
        scrollers.forEach(s => {
          const rect = el.getBoundingClientRect();
          const sRect = s.getBoundingClientRect();
          s.scrollTop += (rect.top - sRect.top) - 20;
        });
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 800));
  const shotMobilePebble = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_pebble_pie.png`, Buffer.from(shotMobilePebble.data, 'base64'));

  console.log('Screenshots saved successfully');
  chromeProc.kill();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
