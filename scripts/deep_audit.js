import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9557;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function runAudit() {
  console.log('Spawning Chrome for deep audit on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_deep_audit'
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
  const consoleLogs = [];
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = reqId++;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          consoleLogs.push({ type: msg.params.type, args: msg.params.args.map((a) => a.value) });
        }
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
    const res = await send('Runtime.evaluate', { expression: script, returnByValue: true });
    return res.result ? res.result.value : null;
  }

  const auditResults = {
    desktop: {},
    mobile: {},
    consoleErrors: [],
    overflowBugs: [],
    redundancies: []
  };

  const pagesToTest = [
    { name: 'dashboard', url: 'http://localhost:5173/dashboard' },
    { name: 'food_hub', url: 'http://localhost:5173/food' },
    { name: 'create_food_p1', url: 'http://localhost:5173/create-food' },
    { name: 'goals', url: 'http://localhost:5173/goals' },
    { name: 'settings', url: 'http://localhost:5173/settings' },
  ];

  // ================= 1. DESKTOP AUDIT (1280 x 800) =================
  console.log('--- RUNNING DESKTOP AUDIT ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  for (const pageItem of pagesToTest) {
    await send('Page.navigate', { url: pageItem.url });
    await new Promise((r) => setTimeout(r, 1000));

    // Check layout overflow
    const overflow = await evaluateScript(`
      ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        bodyBg: window.getComputedStyle(document.body).backgroundColor
      })
    `);

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const filename = `audit_desktop_${pageItem.name}.png`;
    fs.writeFileSync(`${artifactDir}\\${filename}`, Buffer.from(shot.data, 'base64'));

    auditResults.desktop[pageItem.name] = {
      overflow,
      screenshot: filename
    };

    if (overflow.hasHorizontalOverflow) {
      auditResults.overflowBugs.push({ viewport: 'desktop', page: pageItem.name, overflow });
    }
  }

  // Also check Page 2 of Create Food on Desktop
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 800));
  await evaluateScript(`
    (() => {
      const inputs = document.querySelectorAll('input');
      if (inputs[0]) {
        inputs[0].value = 'Oats Porridge';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Next'));
      if (nextBtn) nextBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));
  const shotP2Desktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\audit_desktop_create_food_p2.png`, Buffer.from(shotP2Desktop.data, 'base64'));
  auditResults.desktop.create_food_p2 = { screenshot: 'audit_desktop_create_food_p2.png' };

  // ================= 2. MOBILE AUDIT (390 x 844) =================
  console.log('--- RUNNING MOBILE AUDIT ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  for (const pageItem of pagesToTest) {
    await send('Page.navigate', { url: pageItem.url });
    await new Promise((r) => setTimeout(r, 1000));

    const overflow = await evaluateScript(`
      ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        bodyBg: window.getComputedStyle(document.body).backgroundColor
      })
    `);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const filename = `audit_mobile_${pageItem.name}.png`;
    fs.writeFileSync(`${artifactDir}\\${filename}`, Buffer.from(shot.data, 'base64'));

    auditResults.mobile[pageItem.name] = {
      overflow,
      screenshot: filename
    };

    if (overflow.hasHorizontalOverflow) {
      auditResults.overflowBugs.push({ viewport: 'mobile', page: pageItem.name, overflow });
    }
  }

  // Check Page 2 of Create Food on Mobile
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 800));
  await evaluateScript(`
    (() => {
      const inputs = document.querySelectorAll('input');
      if (inputs[0]) {
        inputs[0].value = 'Oats Porridge';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Next'));
      if (nextBtn) nextBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));
  const shotP2Mobile = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\audit_mobile_create_food_p2.png`, Buffer.from(shotP2Mobile.data, 'base64'));
  auditResults.mobile.create_food_p2 = { screenshot: 'audit_mobile_create_food_p2.png' };

  // ================= 3. DETAILED UI INSPECTION ON SPECIFIC COMPONENTS =================
  // A. Check FoodHub tabs on Desktop & Mobile
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 800));

  // Switch to My Foods
  await evaluateScript(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const myFoodsTab = tabs.find(t => t.textContent && t.textContent.includes('My Foods'));
      if (myFoodsTab) myFoodsTab.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));
  const shotMyFoods = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\audit_mobile_food_hub_my_foods.png`, Buffer.from(shotMyFoods.data, 'base64'));

  // Switch to My Meals
  await evaluateScript(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const mealsTab = tabs.find(t => t.textContent && t.textContent.includes('My Meals'));
      if (mealsTab) mealsTab.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));
  const shotMyMeals = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\audit_mobile_food_hub_my_meals.png`, Buffer.from(shotMyMeals.data, 'base64'));

  // Switch to Quick Add
  await evaluateScript(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const quickTab = tabs.find(t => t.textContent && t.textContent.includes('Quick'));
      if (quickTab) quickTab.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));
  const shotQuickAdd = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\audit_mobile_food_hub_quick_add.png`, Buffer.from(shotQuickAdd.data, 'base64'));

  auditResults.consoleErrors = consoleLogs.filter(l => l.type === 'error');

  fs.writeFileSync(`${artifactDir}\\audit_results.json`, JSON.stringify(auditResults, null, 2));
  console.log('Saved audit_results.json and all screenshots!');

  ws.close();
  chromeProc.kill();
}

runAudit().catch(console.error);
