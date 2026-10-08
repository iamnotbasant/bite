import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9577;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_food_log'
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

  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 1: Mobile Food Log View
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_food_log_uncluttered.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved verified_mobile_food_log_uncluttered.png');

  // Switch to "My Foods" tab
  await send('Runtime.evaluate', {
    expression: `
      const myFoodsTab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('My Foods'));
      if (myFoodsTab) myFoodsTab.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  let shotMyFoods = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_food_log_my_foods.png`, Buffer.from(shotMyFoods.data, 'base64'));
  console.log('Saved verified_mobile_food_log_my_foods.png');

  // Switch back to "Frequent" tab and open portion modal on first food
  await send('Runtime.evaluate', {
    expression: `
      const freqTab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Frequent'));
      if (freqTab) freqTab.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  // Click on the first food item
  await send('Runtime.evaluate', {
    expression: `
      const firstFood = document.querySelector('h4')?.closest('div.group');
      if (firstFood) firstFood.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  let shotModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_food_log_portion_modal.png`, Buffer.from(shotModal.data, 'base64'));
  console.log('Saved verified_mobile_food_log_portion_modal.png');

  // Desktop Viewport Check (1280x800)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1500));
  let shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_food_log.png`, Buffer.from(shotDesktop.data, 'base64'));
  console.log('Saved verified_desktop_food_log.png');

  ws.close();
  chromeProc.kill();
  console.log('Verification completed successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
