import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9576;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_meal_modal'
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

  // Mobile Viewport (iPhone 390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
  await new Promise((r) => setTimeout(r, 2000));

  // Scroll down to Breakfast / Meals section
  await send('Runtime.evaluate', {
    expression: `
      document.querySelector('h3')?.scrollIntoView({ block: 'start' });
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 1: Mobile meal card alignment (Checking the right-side gap fix)
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_meal_card_alignment.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved verified_mobile_meal_card_alignment.png');

  // Click on the first food item ("Oats with Banana" or any meal card)
  await send('Runtime.evaluate', {
    expression: `
      const card = Array.from(document.querySelectorAll('h4')).find(h => h.innerText.includes('Oats') || h.innerText.includes('Egg'))?.closest('div[role=\"button\"]');
      if (card) { card.click(); }
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  // Screenshot 2: Modal Open (View Nutrition & Provenance)
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_meal_detail_modal.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved verified_mobile_meal_detail_modal.png');

  // Click "Edit" in the modal
  await send('Runtime.evaluate', {
    expression: `
      const editBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Edit'));
      if (editBtn) { editBtn.click(); }
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 3: Modal Edit Mode
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_meal_edit_mode.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved verified_mobile_meal_edit_mode.png');

  ws.close();
  chromeProc.kill();
  console.log('All meal detail screenshots captured!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
