import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9555;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_plus_modal'
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

  console.log('Testing clicking + button on Paneer card...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Find the '+' button inside Paneer card specifically
  await evaluateScript(`
    (() => {
      const titles = Array.from(document.querySelectorAll('h4'));
      const paneerTitle = titles.find(t => t.textContent && t.textContent.includes('Paneer'));
      if (paneerTitle) {
        const card = paneerTitle.closest('div[class*="group"]');
        if (card) {
          const plusBtn = card.querySelector('button[title="Add food (adjust portion)"]');
          if (plusBtn) plusBtn.click();
        }
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));

  // Capture Screenshot of Modal opened from plus click
  const shotModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_plus_button_opened_modal.png`, Buffer.from(shotModal.data, 'base64'));
  console.log('Saved mobile_plus_button_opened_modal.png');

  ws.close();
  chromeProc.kill();
  console.log('Verification completed successfully!');
}

run().catch(console.error);
