import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9577;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_ml_servings'
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

  // 1. Desktop Test for ml unit selection & toggle in /create-food
  console.log('1. Testing /create-food on Desktop (1280x850)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Type Food Name: "Banana Shake"
  await evaluateScript(`document.querySelectorAll('input')[0].focus()`);
  await send('Input.insertText', { text: 'Banana Protein Shake' });
  await new Promise((r) => setTimeout(r, 200));

  // Click "glass" preset button
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const glassBtn = btns.find(b => b.textContent && b.textContent.trim() === 'glass');
      if (glassBtn) glassBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  // Capture Desktop with 'glass' (250 ml) selected
  const shotDeskGlass = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_create_food_ml_selected.png`, Buffer.from(shotDeskGlass.data, 'base64'));
  console.log('Saved desktop_create_food_ml_selected.png');

  // Test explicitly toggling between 'g' and 'ml'
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const gBtn = btns.find(b => b.textContent && b.textContent.trim() === 'g');
      if (gBtn) gBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 300));

  // Capture Desktop with 'g' toggled
  const shotDeskGToggled = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_create_food_g_toggled.png`, Buffer.from(shotDeskGToggled.data, 'base64'));
  console.log('Saved desktop_create_food_g_toggled.png');

  // Switch back to ml for liquid
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const mlBtn = btns.find(b => b.textContent && b.textContent.trim() === 'ml');
      if (mlBtn) mlBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 300));

  // 2. Mobile Viewport (390 x 844)
  console.log('2. Testing /create-food on Mobile (390x844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Click 'ml' preset
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const mlBtn = btns.find(b => b.textContent && b.textContent.trim() === 'ml');
      if (mlBtn) mlBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const shotMobMl = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_create_food_ml_selected.png`, Buffer.from(shotMobMl.data, 'base64'));
  console.log('Saved mobile_create_food_ml_selected.png');

  // 3. Test Food Hub Modal for Milk (Volume in ml)
  console.log('3. Testing /food Milk logging modal...');
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Find and click on Milk card
  await evaluateScript(`
    (() => {
      const titles = Array.from(document.querySelectorAll('h4'));
      const milkTitle = titles.find(t => t.textContent && t.textContent.includes('Milk'));
      if (milkTitle) {
        milkTitle.closest('div[class*="cursor-pointer"]').click();
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));

  const shotMilkModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_food_hub_milk_modal.png`, Buffer.from(shotMilkModal.data, 'base64'));
  console.log('Saved mobile_food_hub_milk_modal.png');

  ws.close();
  chromeProc.kill();
  console.log('All verification captures completed!');
}

run().catch(console.error);
