import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9588;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_online_ready2'
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

  async function snap(name) {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${artifactDir}\\${name}.png`, Buffer.from(data, 'base64'));
    console.log(`Saved ${name}.png`);
  }

  // 1. Desktop Dashboard (1440x900)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
  await new Promise((r) => setTimeout(r, 2500));
  await snap('online_ready_desktop_dashboard');

  // 2. Mobile Dashboard (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
  await new Promise((r) => setTimeout(r, 2000));
  await snap('online_ready_mobile_dashboard');

  // 3. Desktop Goals with Micronutrient Targets
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/goals' });
  await new Promise((r) => setTimeout(r, 2000));
  await snap('online_ready_desktop_goals');

  // 4. Desktop Food Hub
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 2000));
  await snap('online_ready_desktop_foodhub');

  // 5. Desktop Create Food (Page 2)
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const input = document.querySelector('input[placeholder="e.g. Oats with Almond Milk, Boiled Eggs"]');
        if (input) {
          input.value = 'Protein Oats';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
        if (nextBtn) nextBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 1200));
  await snap('online_ready_desktop_createfood_p2');

  ws.close();
  chromeProc.kill();
  console.log('Done!');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
