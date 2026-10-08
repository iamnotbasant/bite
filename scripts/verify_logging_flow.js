import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9556;

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_fuel_test_flow'
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

  console.log('Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise((r) => setTimeout(r, 1500));

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 500));

  // 1. Check initial calories
  const initCal = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const calElem = document.querySelector('.font-black.text-3xl') || document.querySelector('.font-mono.font-black');
        return calElem ? calElem.textContent : 'Not found';
      })()
    `
  });
  console.log('Initial Calories on screen:', initCal?.result?.value);

  // 2. Open Food Hub via header or meal button
  console.log('Opening Food Hub modal...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[title*="Add Breakfast"]') || document.querySelector('button[title*="Add"]');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));

  // 3. Create a custom food
  console.log('Navigating to Create a Food form...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.querySelector('.fixed.inset-0');
        const cards = Array.from(modal.querySelectorAll('h4'));
        const createCard = cards.find(h => h.textContent.includes('Create a Food'));
        if (createCard) createCard.closest('div').click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));

  console.log('Filling out custom food form with native setter...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        function setReactInput(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const modal = document.querySelector('.fixed.inset-0');
        const inputs = Array.from(modal.querySelectorAll('input'));
        const nameInput = inputs[0]; // Food Name
        const portionInput = inputs[1]; // Portion
        const calInput = inputs[2]; // Calories
        const proteinInput = inputs[3]; // Protein
        const carbsInput = inputs[4]; // Carbs
        const fatInput = inputs[5]; // Fat

        if (nameInput) setReactInput(nameInput, 'Paneer Bhurji Special');
        if (portionInput) setReactInput(portionInput, '1 plate (200g)');
        if (proteinInput) setReactInput(proteinInput, '24');
        if (carbsInput) setReactInput(carbsInput, '8');
        if (fatInput) setReactInput(fatInput, '18');
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));

  // Check auto-calculated calories
  const computedCal = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.querySelector('.fixed.inset-0');
        const inputs = Array.from(modal.querySelectorAll('input'));
        return inputs[2]?.value; // Calories
      })()
    `
  });
  console.log('Computed Calories for Paneer Bhurji Special (24*4 + 8*4 + 18*9 = 290):', computedCal?.result?.value);

  // 4. Click "Save & Log to BREAKFAST"
  console.log('Clicking Save & Log...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.querySelector('.fixed.inset-0');
        const buttons = Array.from(modal.querySelectorAll('button'));
        const saveLogBtn = buttons.find(b => b.textContent.includes('Save & Log'));
        if (saveLogBtn) saveLogBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 800));

  // Capture screenshot of My Foods tab with Toast
  const shotToast = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_my_foods_toast.png', Buffer.from(shotToast.data, 'base64'));
  console.log('Saved food_hub_my_foods_toast.png');

  // Close modal to see updated dashboard
  console.log('Closing modal...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const closeBtn = document.querySelector('button[title="Close"]');
        if (closeBtn) closeBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 800));

  // Check updated calories on dashboard
  const updatedCal = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const calElem = document.querySelector('.font-black.text-3xl') || document.querySelector('.font-mono.font-black');
        return calElem ? calElem.textContent : 'Not found';
      })()
    `
  });
  console.log('Updated Calories on Dashboard after logging:', updatedCal?.result?.value);

  // Capture updated mobile dashboard screenshot
  const shotDashboard = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\mobile_dashboard_after_custom_log.png', Buffer.from(shotDashboard.data, 'base64'));
  console.log('Saved mobile_dashboard_after_custom_log.png');

  ws.close();
  chromeProc.kill();
  console.log('Done verifying logging flow!');
}

run().catch((e) => console.error(e));
