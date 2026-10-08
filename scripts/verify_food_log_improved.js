import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9566;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_food_log_improved'
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

  // 1. Desktop Test for /food
  console.log('1. Testing /food on Desktop (1280x850)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Capture Desktop Frequent Foods view
  const shotDeskList = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_frequent_foods_view.png`, Buffer.from(shotDeskList.data, 'base64'));
  console.log('Saved desktop_frequent_foods_view.png');

  // Click on Roti card to open the clean portion modal
  await evaluateScript(`
    (() => {
      const titles = Array.from(document.querySelectorAll('h4'));
      const rotiTitle = titles.find(t => t.textContent && t.textContent.includes('Roti'));
      if (rotiTitle) {
        rotiTitle.closest('div[class*="cursor-pointer"]').click();
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));

  // Capture Desktop Roti modal
  const shotDeskModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_clean_portion_modal.png`, Buffer.from(shotDeskModal.data, 'base64'));
  console.log('Saved desktop_clean_portion_modal.png');

  // 2. Mobile Viewport (390 x 844)
  console.log('2. Testing /food on Mobile (390x844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Capture Mobile Frequent Foods list
  const shotMobList = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_frequent_foods_view.png`, Buffer.from(shotMobList.data, 'base64'));
  console.log('Saved mobile_frequent_foods_view.png');

  // Click on Milk card to open the clean portion modal
  await evaluateScript(`
    (() => {
      const titles = Array.from(document.querySelectorAll('h4'));
      const milkTitle = titles.find(t => t.textContent && t.textContent.includes('Milk'));
      if (milkTitle) {
        milkTitle.closest('div[class*="cursor-pointer"]').click();
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));

  // Capture Mobile Milk modal
  const shotMobModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_clean_portion_modal.png`, Buffer.from(shotMobModal.data, 'base64'));
  console.log('Saved mobile_clean_portion_modal.png');

  ws.close();
  chromeProc.kill();
  console.log('All verification captures completed!');
}

run().catch(console.error);
