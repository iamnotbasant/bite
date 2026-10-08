import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9558;

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_fuel_test_hub_full'
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

  // --- 1. MOBILE TESTS (390x844) ---
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 500));

  // Screenshot 1: Mobile Dashboard with Bottom Nav Bar
  const shotMobileDash = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\mobile_dashboard_with_bottom_nav.png', Buffer.from(shotMobileDash.data, 'base64'));
  console.log('Saved mobile_dashboard_with_bottom_nav.png');

  // Click "Food Hub" in bottom nav
  console.log('Clicking Food Hub in bottom nav...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const navBtns = Array.from(document.querySelectorAll('nav button'));
        const foodBtn = navBtns.find(b => b.textContent.includes('Food Hub'));
        if (foodBtn) foodBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 2: Dedicated Food Hub Page on Mobile
  const shotMobileHub = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_page_mobile.png', Buffer.from(shotMobileHub.data, 'base64'));
  console.log('Saved food_hub_page_mobile.png');

  // Switch to "My Meals" tab (Combos)
  console.log('Switching to My Meals tab...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tabBtns = Array.from(document.querySelectorAll('button'));
        const mealTab = tabBtns.find(b => b.textContent.trim() === 'My Meals');
        if (mealTab) mealTab.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 500));

  // Screenshot 3: My Meals Combo list
  const shotMobileMeals = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_my_meals_mobile.png', Buffer.from(shotMobileMeals.data, 'base64'));
  console.log('Saved food_hub_my_meals_mobile.png');

  // Switch to "All Foods" tab and click Oats to open Donut Ring Detail View
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tabBtns = Array.from(document.querySelectorAll('button'));
        const allTab = tabBtns.find(b => b.textContent.trim() === 'All Foods');
        if (allTab) allTab.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 500));

  console.log('Clicking Oats with Banana to view Circular Macro Donut Ring...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titles = Array.from(document.querySelectorAll('h4'));
        const oats = titles.find(t => t.textContent.includes('Oats'));
        if (oats) oats.closest('.group').click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 4: Donut Ring Detail View on Mobile
  const shotDonutRing = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_donut_ring_mobile.png', Buffer.from(shotDonutRing.data, 'base64'));
  console.log('Saved food_hub_donut_ring_mobile.png');

  // Scroll down to see full CTA button on mobile
  await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 150)' });
  await new Promise((r) => setTimeout(r, 400));
  const shotDonutRingScrolled = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_donut_ring_scrolled_mobile.png', Buffer.from(shotDonutRingScrolled.data, 'base64'));
  console.log('Saved food_hub_donut_ring_scrolled_mobile.png');

  // --- 2. DESKTOP TESTS (1280x800) ---
  console.log('Testing Desktop View...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 500));

  // Click Back to catalog, then capture desktop Food Hub
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const backBtn = document.querySelector('button[title="Back to Catalog"]');
        if (backBtn) backBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 5: Desktop Food Hub Page
  const shotDesktopHub = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273\\food_hub_page_desktop.png', Buffer.from(shotDesktopHub.data, 'base64'));
  console.log('Saved food_hub_page_desktop.png');

  ws.close();
  chromeProc.kill();
  console.log('All tests completed successfully!');
}

run().catch((e) => console.error(e));
