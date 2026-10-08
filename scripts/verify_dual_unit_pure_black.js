import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9588;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_dual_unit_pure_black'
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
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 400));

  // Fill Step 1 details
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
      // Name
      const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Whole Wheat Roti'));
      if (nameInput) setReactInput(nameInput, 'Tandoori Roti');

      // Notes
      const notesInput = inputs.find(i => i.placeholder && i.placeholder.includes('Homemade whole wheat'));
      if (notesInput) setReactInput(notesInput, 'Homemade whole wheat without butter or ghee');

      // Weight
      const weightInput = inputs.find(i => i.placeholder === '100');
      if (weightInput) setReactInput(weightInput, '100');
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const shotDeskStep1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_create_food_dual_unit_step1.png`, Buffer.from(shotDeskStep1.data, 'base64'));
  console.log('Saved desktop_create_food_dual_unit_step1.png');

  // Proceed to Step 2
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const proceedBtn = btns.find(b => b.textContent && b.textContent.includes('Proceed to Nutrition Facts'));
      if (proceedBtn) proceedBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  // Fill Step 2 details (Calories: 240, Protein: 8, Carbs: 48, Fat: 2)
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
      const kcalInput = inputs.find(i => i.placeholder && i.placeholder.includes('240'));
      if (kcalInput) setReactInput(kcalInput, '240');

      const pInput = inputs.find(i => i.parentElement && i.parentElement.parentElement && i.parentElement.parentElement.textContent.includes('Protein') && i.type === 'number');
      if (pInput) setReactInput(pInput, '8');

      const cInput = inputs.find(i => i.parentElement && i.parentElement.parentElement && i.parentElement.parentElement.textContent.includes('Carbs') && i.type === 'number');
      if (cInput) setReactInput(cInput, '48');

      const fInput = inputs.find(i => i.parentElement && i.parentElement.parentElement && i.parentElement.parentElement.textContent.includes('Total Fat') && i.type === 'number');
      if (fInput) setReactInput(fInput, '2');
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const shotDeskStep2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_create_food_dual_unit_step2.png`, Buffer.from(shotDeskStep2.data, 'base64'));
  console.log('Saved desktop_create_food_dual_unit_step2.png');

  // Save the custom food
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.textContent && b.textContent.includes('Save Custom Food'));
      if (saveBtn) saveBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));

  // 2. Mobile Viewport (390x844) for /create-food
  console.log('2. Loading /create-food on Mobile (390x844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

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
      const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Whole Wheat Roti'));
      if (nameInput) setReactInput(nameInput, 'Paneer Bhurji');

      const notesInput = inputs.find(i => i.placeholder && i.placeholder.includes('Homemade whole wheat'));
      if (notesInput) setReactInput(notesInput, 'Cooked in 5g olive oil with tomatoes & green chillies');
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const shotMobStep1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_create_food_dual_unit_step1.png`, Buffer.from(shotMobStep1.data, 'base64'));
  console.log('Saved mobile_create_food_dual_unit_step1.png');

  // 3. Test Food Hub Modal with Dual Unit (Roti / 1 roti = 40g or 100g)
  console.log('3. Loading /food on Desktop to test dual-unit modal...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Click on Roti item to open modal
  await evaluateScript(`
    (() => {
      const heading = Array.from(document.querySelectorAll('h4')).find(h => h.textContent && h.textContent.includes('Roti'));
      if (heading) {
        const row = heading.closest('.group');
        if (row) row.click();
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 700));

  // Change to 2 rotis
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const twoXBtn = btns.find(b => b.textContent && b.textContent.trim() === '2x');
      if (twoXBtn) twoXBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const shotModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\food_hub_dual_unit_modal.png`, Buffer.from(shotModal.data, 'base64'));
  console.log('Saved food_hub_dual_unit_modal.png');

  ws.close();
  chromeProc.kill();
  console.log('Finished all screenshot captures successfully!');
}

run().catch(console.error);
