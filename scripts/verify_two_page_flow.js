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
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_two_page_flow'
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

  // ==========================================
  // 1. DESKTOP TEST (1280 x 850)
  // ==========================================
  console.log('1. Loading Desktop Page 1...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Focus and type Description
  await evaluateScript(`document.querySelectorAll('input')[0].focus()`);
  await send('Input.insertText', { text: 'Whole Wheat Roti' });
  await new Promise((r) => setTimeout(r, 200));

  // Focus Description / Notes
  await evaluateScript(`document.querySelectorAll('input')[1].focus()`);
  await send('Input.insertText', { text: 'Freshly made at home, no added oil' });
  await new Promise((r) => setTimeout(r, 200));

  // Capture Desktop Page 1
  const shotDesk1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_flow_page1.png`, Buffer.from(shotDesk1.data, 'base64'));
  console.log('Saved desktop_flow_page1.png');

  // Click Next Button (either top navbar Next or bottom CTA)
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent && b.textContent.trim().startsWith('Next'));
      if (nextBtn) nextBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));

  // Capture Desktop Page 2 (Nutrition Facts)
  const shotDesk2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_flow_page2_nutrition.png`, Buffer.from(shotDesk2.data, 'base64'));
  console.log('Saved desktop_flow_page2_nutrition.png');

  // Fill Calories = 104
  await evaluateScript(`document.querySelectorAll('input')[0].focus()`);
  await send('Input.insertText', { text: '104' });
  await new Promise((r) => setTimeout(r, 200));

  // Click Save to trigger "Add Nutrient Information" modal (because macros are 0)
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Save');
      if (saveBtn) saveBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));

  // Capture Desktop Modal
  const shotDeskModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_flow_step2_modal.png`, Buffer.from(shotDeskModal.data, 'base64'));
  console.log('Saved desktop_flow_step2_modal.png');

  // ==========================================
  // 2. MOBILE TEST (390 x 844)
  // ==========================================
  console.log('2. Loading Mobile Page 1...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  // Type Food Name
  await evaluateScript(`document.querySelectorAll('input')[0].focus()`);
  await send('Input.insertText', { text: 'Roti' });
  await new Promise((r) => setTimeout(r, 200));

  // Capture Mobile Page 1
  const shotMob1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_flow_page1.png`, Buffer.from(shotMob1.data, 'base64'));
  console.log('Saved mobile_flow_page1.png');

  // Click Next
  await evaluateScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent && b.textContent.trim().startsWith('Next'));
      if (nextBtn) nextBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));

  // Capture Mobile Page 2
  const shotMob2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_flow_page2_nutrition.png`, Buffer.from(shotMob2.data, 'base64'));
  console.log('Saved mobile_flow_page2_nutrition.png');

  ws.close();
  chromeProc.kill();
  console.log('Completed all captures!');
}

run().catch(console.error);
