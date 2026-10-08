import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9581;
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

  // 1. Mobile Viewport (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot 1: Mobile Food Log main screen (Confirm NO meal category bar)
  let shotList = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_food_hub_clean.png`, Buffer.from(shotList.data, 'base64'));
  console.log('Saved verified_mobile_food_hub_clean.png');

  // Click on the first food item button to open portion modal
  await send('Runtime.evaluate', {
    expression: `
      const addBtn = document.querySelector('button[title="Add food (adjust portion)"]');
      if (addBtn) {
        addBtn.click();
      } else {
        const item = document.querySelector('.space-y-2 > div.group');
        if (item) item.click();
      }
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Screenshot 2: Mobile Portion Modal showing Meal Category Pills and Time Field
  let shotModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_portion_modal_category_time.png`, Buffer.from(shotModal.data, 'base64'));
  console.log('Saved verified_mobile_portion_modal_category_time.png');

  // Test selecting "Dinner" and clearing time
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const dinnerBtn = btns.find(b => b.textContent && b.textContent.includes('Dinner'));
      if (dinnerBtn) dinnerBtn.click();
      
      const clearBtn = btns.find(b => b.textContent && b.textContent.includes('Clear (Leave blank)'));
      if (clearBtn) clearBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 3: Modal with Dinner selected and time blank
  let shotModalDinner = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_portion_modal_dinner_blank.png`, Buffer.from(shotModalDinner.data, 'base64'));
  console.log('Saved verified_mobile_portion_modal_dinner_blank.png');

  // 2. Desktop Viewport (1280x800)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 800));

  // Screenshot 4: Desktop view of modal
  let shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_portion_modal_category_time.png`, Buffer.from(shotDesktop.data, 'base64'));
  console.log('Saved verified_desktop_portion_modal_category_time.png');

  ws.close();
  chromeProc.kill();
  console.log('All verification screenshots captured successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
