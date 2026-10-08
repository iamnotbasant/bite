import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9575;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning headless Chrome on port', port, '...');
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_fuel_test_upgraded_creator'
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

  // Helper function to set React inputs safely
  async function evaluateScript(script) {
    return await send('Runtime.evaluate', { expression: script, returnByValue: true });
  }

  // 1. Desktop Test for /create-food Step 1
  console.log('Navigating to http://localhost:5173/create-food on Desktop (1280x800)...');
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 400));

  // Fill sample data in Step 1
  await evaluateScript(`
    (() => {
      function setReactInput(input, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(input, val);
        else input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputs = Array.from(document.querySelectorAll('input'));
      const descInput = inputs.find(i => i.placeholder && i.placeholder.includes('chom'));
      if (descInput) setReactInput(descInput, 'Paneer Tikka Roll');

      const brandInput = inputs.find(i => i.placeholder && i.placeholder.includes('roti, Amul'));
      if (brandInput) setReactInput(brandInput, 'Homemade');
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const shotDeskStep1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_create_food_upgraded_step1.png`, Buffer.from(shotDeskStep1.data, 'base64'));
  console.log('Saved desktop_create_food_upgraded_step1.png');

  // Move to Step 2
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent && b.textContent.includes('Continue to Nutrition') || b.textContent.trim() === 'Next');
      if (nextBtn) nextBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));

  // Fill Step 2 Macros: Protein 24g, Carbs 35g, Fat 12g -> auto-calc calories!
  await evaluateScript(`
    (() => {
      function setReactInput(input, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(input, val);
        else input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputs = Array.from(document.querySelectorAll('input'));
      // Protein
      const pInput = inputs.find(i => i.parentElement && i.parentElement.innerHTML.includes('g') && i.placeholder === '0');
      if (pInput) setReactInput(pInput, '24');
      // Next input Carbs
      const allZeroInputs = inputs.filter(i => i.placeholder === '0');
      if (allZeroInputs[0]) setReactInput(allZeroInputs[0], '24');
      if (allZeroInputs[1]) setReactInput(allZeroInputs[1], '35');
      if (allZeroInputs[2]) setReactInput(allZeroInputs[2], '12');
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));

  const shotDeskStep2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_create_food_upgraded_step2.png`, Buffer.from(shotDeskStep2.data, 'base64'));
  console.log('Saved desktop_create_food_upgraded_step2.png');

  // 2. Mobile Test for /create-food (390x844)
  console.log('Switching to Mobile Viewport (390x844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 400));

  const shotMobStep2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_create_food_upgraded_step2.png`, Buffer.from(shotMobStep2.data, 'base64'));
  console.log('Saved mobile_create_food_upgraded_step2.png');

  // Go back to Step 1 on Mobile
  await evaluateScript(`
    (() => {
      const step1Btn = Array.from(document.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('1. Details'));
      if (step1Btn) step1Btn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));

  const shotMobStep1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_create_food_upgraded_step1.png`, Buffer.from(shotMobStep1.data, 'base64'));
  console.log('Saved mobile_create_food_upgraded_step1.png');

  console.log('All upgraded create food screenshots captured successfully!');
  chromeProc.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error in script:', err);
  process.exit(1);
});
