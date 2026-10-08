import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9582;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_uncluttered_stats'
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

  // 1. Mobile Viewport (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/stats' });
  await new Promise((r) => setTimeout(r, 1800));

  // Shot 1: Mobile All Insights view (top with segmented pills and section 1)
  let shotAll = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats_uncluttered_all.png`, Buffer.from(shotAll.data, 'base64'));
  console.log('Saved verified_mobile_stats_uncluttered_all.png');

  // Click on "Diet & Macros" pill
  const r1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('[data-section="nutrition"]');
        if (btn) { btn.scrollIntoView(); btn.click(); return 'clicked nutrition'; }
        return 'no nutrition';
      })()
    `,
  });
  console.log('Eval 1:', r1?.result?.value);
  await new Promise((r) => setTimeout(r, 700));

  // Shot 2: Mobile Diet & Macros category view (focused on Petal Radar & Pebble Pie)
  let shotDiet = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats_uncluttered_diet.png`, Buffer.from(shotDiet.data, 'base64'));
  console.log('Saved verified_mobile_stats_uncluttered_diet.png');

  // Click on "Habits & Streak" pill
  const r2 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('[data-section="habits"]');
        if (btn) { btn.scrollIntoView(); btn.click(); return 'clicked habits'; }
        return 'no habits';
      })()
    `,
  });
  console.log('Eval 2:', r2?.result?.value);
  await new Promise((r) => setTimeout(r, 700));

  // Shot 3: Mobile Habits & Streak category view (streamlined Rex arena & cadence)
  let shotHabits = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats_uncluttered_habits.png`, Buffer.from(shotHabits.data, 'base64'));
  console.log('Saved verified_mobile_stats_uncluttered_habits.png');

  // Click on "Calorie Trends" pill
  const r3 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('[data-section="trends"]');
        if (btn) { btn.scrollIntoView(); btn.click(); return 'clicked trends'; }
        return 'no trends';
      })()
    `,
  });
  console.log('Eval 3:', r3?.result?.value);
  await new Promise((r) => setTimeout(r, 700));

  // Shot 4: Mobile Trends category view
  let shotTrends = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_mobile_stats_uncluttered_trends.png`, Buffer.from(shotTrends.data, 'base64'));
  console.log('Saved verified_mobile_stats_uncluttered_trends.png');

  // 2. Desktop Viewport (1280x800)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });

  // Switch back to "All Insights"
  await send('Runtime.evaluate', {
    expression: `
      const btn = document.querySelector('[data-section="all"]');
      if (btn) btn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  // Shot 5: Desktop view
  let shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\verified_desktop_stats_uncluttered.png`, Buffer.from(shotDesktop.data, 'base64'));
  console.log('Saved verified_desktop_stats_uncluttered.png');

  ws.close();
  chromeProc.kill();
  console.log('All uncluttered stats verification screenshots captured successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
