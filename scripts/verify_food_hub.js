import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9555;

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_fuel_test_hub_2'
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

  // Navigate directly
  console.log('Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise((r) => setTimeout(r, 1500));

  // Set device viewport to 390x844 (iPhone 14)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 500));

  // Check title
  const titleRes = await send('Runtime.evaluate', { expression: 'document.title' });
  console.log('Page Title:', titleRes?.result?.value);

  // 1. Click "+" on Breakfast to open FoodHubModal
  console.log('Clicking to open FoodHubModal...');
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const addBtn = document.querySelector('button[title*="Add Breakfast"]') || document.querySelector('button[title*="Add"]');
        if (addBtn) {
          addBtn.click();
          return 'Clicked Add button: ' + addBtn.title;
        }
        return 'No button found';
      })()
    `,
  });
  console.log('Click result:', clickRes?.result?.value);
  await new Promise((r) => setTimeout(r, 800));

  // Capture Browse view screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_browse.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved food_hub_browse.png (bytes:', shot1.data.length, ')');

  // 2. Click on "Oats with Banana" inside modal to open detail serving view
  console.log('Clicking on Oats with Banana inside modal to open detail view...');
  const detailClickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (!modal) return 'No modal found';
        const item = Array.from(modal.querySelectorAll('h4')).find(h => h.textContent.includes('Oats with Banana'));
        if (item) {
          item.closest('div.group').click();
          return 'Clicked ' + item.textContent;
        }
        return 'Oats not found in modal';
      })()
    `,
  });
  console.log('Detail click result:', detailClickRes?.result?.value);
  await new Promise((r) => setTimeout(r, 800));

  // Capture Detail view screenshot
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_detail.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved food_hub_detail.png (bytes:', shot2.data.length, ')');

  // 3. Click Back, then click "Create a Food" card
  console.log('Testing Create Food view...');
  await send('Runtime.evaluate', {
    expression: `
      const backBtn = document.querySelector('button[title="Back to search"]');
      if (backBtn) backBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 500));

  await send('Runtime.evaluate', {
    expression: `
      const modal = document.querySelector('.fixed.inset-0');
      const cards = Array.from(modal.querySelectorAll('h4'));
      const createCard = cards.find(h => h.textContent.includes('Create a Food'));
      if (createCard) createCard.closest('div').click();
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  // Capture Create Food form screenshot
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_create.png', Buffer.from(shot3.data, 'base64'));
  console.log('Saved food_hub_create.png (bytes:', shot3.data.length, ')');

  ws.close();
  chromeProc.kill();
  console.log('Done verifying!');
}

run().catch((e) => console.error(e));
