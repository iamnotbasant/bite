import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9610;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_desktop_fullscreen_view'
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

  // 1. Desktop Test for /create-food (1280x800)
  console.log('1. Loading /create-food on Desktop (1280x800)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Type Food Name
  await evaluateScript(`document.querySelectorAll('input')[0].focus()`);
  await send('Input.insertText', { text: 'Tandoori Roti' });
  await new Promise((r) => setTimeout(r, 150));

  // Type Description
  await evaluateScript(`document.querySelectorAll('input')[1].focus()`);
  await send('Input.insertText', { text: 'Homemade whole wheat without ghee' });
  await new Promise((r) => setTimeout(r, 150));

  // Type Calories (Right Column)
  await evaluateScript(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const kcalInput = inputs.find(i => i.placeholder && i.placeholder.includes('240'));
      if (kcalInput) {
        kcalInput.focus();
      }
    })()
  `);
  await send('Input.insertText', { text: '240' });
  await new Promise((r) => setTimeout(r, 150));

  // Type Protein
  await evaluateScript(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const p = inputs.find(i => i.parentElement && i.parentElement.parentElement && i.parentElement.parentElement.textContent.includes('Protein') && i.type === 'number');
      if (p) p.focus();
    })()
  `);
  await send('Input.insertText', { text: '8' });
  await new Promise((r) => setTimeout(r, 150));

  // Type Carbs
  await evaluateScript(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const c = inputs.find(i => i.parentElement && i.parentElement.parentElement && i.parentElement.parentElement.textContent.includes('Carbs') && i.type === 'number');
      if (c) c.focus();
    })()
  `);
  await send('Input.insertText', { text: '48' });
  await new Promise((r) => setTimeout(r, 150));

  // Type Fat
  await evaluateScript(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const f = inputs.find(i => i.parentElement && i.parentElement.parentElement && i.parentElement.parentElement.textContent.includes('Total Fat') && i.type === 'number');
      if (f) f.focus();
    })()
  `);
  await send('Input.insertText', { text: '2' });
  await new Promise((r) => setTimeout(r, 250));

  const shotDesk = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_true_view_create_food.png`, Buffer.from(shotDesk.data, 'base64'));
  console.log('Saved desktop_true_view_create_food.png');

  // 2. Desktop High-Res (1600x900)
  console.log('2. Loading /create-food on Wide Desktop (1600x900)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 900,
    deviceScaleFactor: 1.25,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 400));
  const shotWide = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_wide_true_view_create_food.png`, Buffer.from(shotWide.data, 'base64'));
  console.log('Saved desktop_wide_true_view_create_food.png');

  // 3. Mobile Viewport (390x844)
  console.log('3. Loading /create-food on Mobile (390x844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1000));

  const shotMob = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_true_view_create_food.png`, Buffer.from(shotMob.data, 'base64'));
  console.log('Saved mobile_true_view_create_food.png');

  ws.close();
  chromeProc.kill();
  console.log('All true desktop screenshots captured successfully!');
}

run().catch(console.error);
