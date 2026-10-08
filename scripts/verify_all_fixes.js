import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9558;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_fixes'
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

  // --- MOBILE VIEWS (390 x 844) ---
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  // 1. Mobile Dashboard (Verify clean header without duplicate settings, gauge, and compact radar bars)
  await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
  await new Promise((r) => setTimeout(r, 1400));
  const shotDash = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_dashboard.png`, Buffer.from(shotDash.data, 'base64'));

  // 2. Mobile Food Log (Verify "Food Log" title, tabs first, contextual search)
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotFood = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_food_log.png`, Buffer.from(shotFood.data, 'base64'));

  // Switch to Saved Meals
  await evaluateScript(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const mealsTab = tabs.find(t => t.textContent && t.textContent.includes('Saved Meals'));
      if (mealsTab) mealsTab.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));
  const shotSavedMeals = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_saved_meals.png`, Buffer.from(shotSavedMeals.data, 'base64'));

  // Switch to Quick Tab (Verify search bar is hidden)
  await evaluateScript(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const quickTab = tabs.find(t => t.textContent && t.textContent.includes('Quick'));
      if (quickTab) quickTab.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));
  const shotQuick = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_quick_add_no_search.png`, Buffer.from(shotQuick.data, 'base64'));

  // 3. Mobile Goals View (Verify live macro ratio distribution & balanced status)
  await send('Page.navigate', { url: 'http://localhost:5173/goals' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotGoals = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_goals_balancer.png`, Buffer.from(shotGoals.data, 'base64'));

  // 4. Mobile Create Food with Image Upload
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotCreateFood = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_create_food_image.png`, Buffer.from(shotCreateFood.data, 'base64'));

  // 5. Mobile Stats View
  await send('Page.navigate', { url: 'http://localhost:5173/stats' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotMobileStats = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats.png`, Buffer.from(shotMobileStats.data, 'base64'));

  // --- DESKTOP VIEWS (1280 x 800) ---
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Desktop Dashboard (Verify gauge and straight radar bars)
  await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
  await new Promise((r) => setTimeout(r, 1400));
  const shotDesktopDash = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_dashboard.png`, Buffer.from(shotDesktopDash.data, 'base64'));

  // Desktop Stats View
  await send('Page.navigate', { url: 'http://localhost:5173/stats' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotDesktopStats = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_stats.png`, Buffer.from(shotDesktopStats.data, 'base64'));

  // Desktop Create Food View
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotDesktopCreateFood = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_create_food_image.png`, Buffer.from(shotDesktopCreateFood.data, 'base64'));

  // Desktop Food Log (Verify no redundant dashboard button)
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotDesktopFood = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_food_log.png`, Buffer.from(shotDesktopFood.data, 'base64'));

  // Desktop Goals (Verify live distribution bar on desktop)
  await send('Page.navigate', { url: 'http://localhost:5173/goals' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotDesktopGoals = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_goals.png`, Buffer.from(shotDesktopGoals.data, 'base64'));

  ws.close();
  chromeProc.kill();
  console.log('All verification screenshots captured successfully!');
}

run().catch(console.error);
