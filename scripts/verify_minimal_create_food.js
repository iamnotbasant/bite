import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9599;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_minimal_create_food'
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

  // 1. Desktop Test for /create-food Step 1
  console.log('1. Loading /create-food on Desktop (1280x800)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Click Food Name input and type
  await evaluateScript(`document.querySelectorAll('input')[0].focus()`);
  await send('Input.insertText', { text: 'Tandoori Roti' });
  await new Promise((r) => setTimeout(r, 200));

  // Click Description input and type
  await evaluateScript(`document.querySelectorAll('input')[1].focus()`);
  await send('Input.insertText', { text: 'Homemade whole wheat without ghee' });
  await new Promise((r) => setTimeout(r, 200));

  const shotDeskStep1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_minimal_create_food_step1.png`, Buffer.from(shotDeskStep1.data, 'base64'));
  console.log('Saved desktop_minimal_create_food_step1.png');

  // Click Next Button (Proceed to Nutrition)
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent && b.textContent.includes('Proceed to Nutrition'));
      if (nextBtn) nextBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));

  // Type Calories
  await evaluateScript(`document.querySelectorAll('input')[0].focus()`);
  await send('Input.insertText', { text: '240' });
  await new Promise((r) => setTimeout(r, 150));

  // Type Protein
  await evaluateScript(`document.querySelectorAll('input')[1].focus()`);
  await send('Input.insertText', { text: '8' });
  await new Promise((r) => setTimeout(r, 150));

  // Type Carbs
  await evaluateScript(`document.querySelectorAll('input')[2].focus()`);
  await send('Input.insertText', { text: '48' });
  await new Promise((r) => setTimeout(r, 150));

  // Type Fat
  await evaluateScript(`document.querySelectorAll('input')[3].focus()`);
  await send('Input.insertText', { text: '2' });
  await new Promise((r) => setTimeout(r, 200));

  const shotDeskStep2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_minimal_create_food_step2.png`, Buffer.from(shotDeskStep2.data, 'base64'));
  console.log('Saved desktop_minimal_create_food_step2.png');

  // 2. Mobile Viewport (390x844)
  console.log('2. Loading /create-food on Mobile (390x844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  await evaluateScript(`document.querySelectorAll('input')[0].focus()`);
  await send('Input.insertText', { text: 'Paneer Bhurji' });
  await new Promise((r) => setTimeout(r, 200));

  const shotMobStep1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_minimal_create_food_step1.png`, Buffer.from(shotMobStep1.data, 'base64'));
  console.log('Saved mobile_minimal_create_food_step1.png');

  ws.close();
  chromeProc.kill();
  console.log('All minimal screenshots captured successfully!');
}

run().catch(console.error);
