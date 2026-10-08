import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9568;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning Chrome on port', port);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_verify_streak'
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

  async function takeScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${artifactDir}\\${filename}`, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  // 1. DESKTOP VIEWPORT
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send('Page.navigate', { url: 'http://localhost:5173/stats' });
  await new Promise((r) => setTimeout(r, 2000));

  // Capture Desktop with Meteor Rex (Fire Mood)
  await takeScreenshot('verified_desktop_streak_fire.png');

  // Click on 'Bicep Gains' (Flex mood)
  await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Bicep Gains'))?.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 500));
  await takeScreenshot('verified_desktop_streak_flex.png');

  // Click on 'Houston Crisis' (Panic mood)
  await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Houston Crisis'))?.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 500));
  await takeScreenshot('verified_desktop_streak_panic.png');

  // Click on 'Frost Shield' (Freeze mood)
  await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Frost Shield'))?.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 500));
  await takeScreenshot('verified_desktop_streak_freeze.png');

  // 2. MOBILE VIEWPORT
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  // Switch back to 'Meteor Beast' on mobile
  await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Meteor Beast'))?.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  await takeScreenshot('verified_mobile_streak_widget.png');

  // Scroll down so full streak card is centered in mobile view
  await send('Runtime.evaluate', {
    expression: `
      document.querySelectorAll('.relative.overflow-hidden.rounded-\\\\[32px\\\\]')[0]?.scrollIntoView({ block: 'center' });
    `,
  });
  await new Promise((r) => setTimeout(r, 600));
  await takeScreenshot('verified_mobile_streak_card_full.png');

  ws.close();
  chromeProc.kill();
  console.log('Done capturing all streak screenshots!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
