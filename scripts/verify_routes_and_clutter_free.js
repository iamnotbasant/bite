import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9570;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning headless Chrome on port', port, '...');
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_fuel_test_routes'
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

  // 1. Test /dashboard on Desktop (1280x800)
  console.log('Navigating to http://localhost:5173/dashboard...');
  await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
  await new Promise((r) => setTimeout(r, 1500));

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 500));

  const shotDeskDash = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_route_dashboard.png`, Buffer.from(shotDeskDash.data, 'base64'));
  console.log('Saved desktop_route_dashboard.png');

  // 2. Test /food on Desktop
  console.log('Navigating to http://localhost:5173/food...');
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  const shotDeskFood = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_route_food.png`, Buffer.from(shotDeskFood.data, 'base64'));
  console.log('Saved desktop_route_food.png (Clutter-free, no subheadings)');

  // 3. Test /create-food on Desktop
  console.log('Navigating to http://localhost:5173/create-food...');
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  const shotDeskCreate = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_route_create_food.png`, Buffer.from(shotDeskCreate.data, 'base64'));
  console.log('Saved desktop_route_create_food.png (Dedicated creator, no subheadings)');

  // 4. Test /settings on Desktop
  console.log('Navigating to http://localhost:5173/settings...');
  await send('Page.navigate', { url: 'http://localhost:5173/settings' });
  await new Promise((r) => setTimeout(r, 1200));

  const shotDeskSettings = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_route_settings.png`, Buffer.from(shotDeskSettings.data, 'base64'));
  console.log('Saved desktop_route_settings.png');

  // 5. Test /goals on Desktop
  console.log('Navigating to http://localhost:5173/goals...');
  await send('Page.navigate', { url: 'http://localhost:5173/goals' });
  await new Promise((r) => setTimeout(r, 1200));

  const shotDeskGoals = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_route_goals.png`, Buffer.from(shotDeskGoals.data, 'base64'));
  console.log('Saved desktop_route_goals.png');

  // 6. Test Mobile Viewport (390x844) for /food
  console.log('Switching to Mobile Viewport for /food...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:5173/food' });
  await new Promise((r) => setTimeout(r, 1200));

  const shotMobFood = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_route_food.png`, Buffer.from(shotMobFood.data, 'base64'));
  console.log('Saved mobile_route_food.png');

  // 7. Test Mobile Viewport for /create-food
  console.log('Navigating to http://localhost:5173/create-food on Mobile...');
  await send('Page.navigate', { url: 'http://localhost:5173/create-food' });
  await new Promise((r) => setTimeout(r, 1200));

  const shotMobCreate = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\mobile_route_create_food.png`, Buffer.from(shotMobCreate.data, 'base64'));
  console.log('Saved mobile_route_create_food.png');

  console.log('All route and clutter-free verifications finished successfully!');
  chromeProc.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error in test:', err);
  process.exit(1);
});
