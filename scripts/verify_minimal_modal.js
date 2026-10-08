import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9556;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_minimal_modal'
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

  // --- 1. MOBILE VIEW (390 x 844) ---
  console.log('Navigating to Food Log on mobile...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Click '+' on Roti card
  await evaluateScript(`
    (() => {
      const titles = Array.from(document.querySelectorAll('h4'));
      const rotiTitle = titles.find(t => t.textContent && t.textContent.includes('Roti'));
      if (rotiTitle) {
        const card = rotiTitle.closest('div[class*="group"]');
        if (card) {
          const plusBtn = card.querySelector('button[title="Add food (adjust portion)"]');
          if (plusBtn) plusBtn.click();
        }
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));

  const mobileModalShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_minimal_portion_modal.png`, Buffer.from(mobileModalShot.data, 'base64'));
  console.log('Saved mobile_minimal_portion_modal.png');

  // Switch to grams mode on mobile
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const gramsBtn = btns.find(b => b.textContent && b.textContent.includes('Grams'));
      if (gramsBtn) gramsBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const mobileGramsShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_minimal_modal_grams_mode.png`, Buffer.from(mobileGramsShot.data, 'base64'));
  console.log('Saved mobile_minimal_modal_grams_mode.png');

  // --- 2. DESKTOP VIEW (1280 x 800) ---
  console.log('Navigating to Food Log on desktop...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Click '+' on Roti card on desktop
  await evaluateScript(`
    (() => {
      const titles = Array.from(document.querySelectorAll('h4'));
      const rotiTitle = titles.find(t => t.textContent && t.textContent.includes('Roti'));
      if (rotiTitle) {
        const card = rotiTitle.closest('div[class*="group"]');
        if (card) {
          const plusBtn = card.querySelector('button[title="Add food (adjust portion)"]');
          if (plusBtn) plusBtn.click();
        }
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));

  const desktopModalShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_minimal_portion_modal.png`, Buffer.from(desktopModalShot.data, 'base64'));
  console.log('Saved desktop_minimal_portion_modal.png');

  ws.close();
  chromeProc.kill();
  console.log('All minimal modal screenshots captured successfully!');
}

run().catch(console.error);
