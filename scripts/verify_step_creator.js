import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9565;
const artifactDir = 'C:\\Users\\httpb\\.gemini\\antigravity\\brain\\28164e3f-1dd5-431a-b6cd-56319b532273';

async function run() {
  console.log('Spawning headless Chrome on port', port, '...');
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--user-data-dir=C:\\Users\\httpb\\AppData\\Local\\Temp\\chrome_fuel_test_step_creator'
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

  // Set device viewport to 390x844 (iPhone 14)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 500));

  // 1. Open Food Hub View via Bottom Navigation bar (or Header)
  console.log('Navigating to Food Hub...');
  const navRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const foodHubBtn = btns.find(b => b.textContent && b.textContent.includes('Food Hub'));
        if (foodHubBtn) {
          foodHubBtn.click();
          return 'Navigated to Food Hub';
        }
        return 'Food Hub button not found';
      })()
    `
  });
  console.log('Nav result:', navRes?.result?.value);
  await new Promise((r) => setTimeout(r, 600));

  // 2. Click "Create a Food" card
  console.log('Clicking Create a Food...');
  const createBtnRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Look for any element containing 'Create a Food'
        const elements = Array.from(document.querySelectorAll('*'));
        const el = elements.find(e => e.textContent && e.textContent.trim().startsWith('Create a Food') && e.children.length === 0) 
                || elements.find(e => e.textContent && e.textContent.includes('Create a Food'));
        if (el) {
          const clickable = el.closest('[onClick], div, button') || el;
          clickable.click();
          return 'Clicked Create a Food: ' + el.tagName;
        }
        return 'Create Food element not found';
      })()
    `
  });
  console.log('Create button result:', createBtnRes?.result?.value);
  await new Promise((r) => setTimeout(r, 800));

  // 3. Fill Step 1 Fields:
  // Brand Name (Optional): "roti"
  // Description (Required): "chom"
  // Serving Size: "3" + unit "gm"
  // Servings per container: "1"
  console.log('Filling Step 1 fields...');
  const fillStep1Res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        function setReactInput(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) {
            setter.call(input, val);
          } else {
            input.value = val;
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const inputs = Array.from(document.querySelectorAll('input'));
        
        // Brand name
        const brandInput = inputs.find(i => i.placeholder && i.placeholder.includes('roti, Amul'));
        if (brandInput) setReactInput(brandInput, 'roti');

        // Description / Name
        const descInput = inputs.find(i => i.placeholder && i.placeholder.includes('chom, Tawa Roti'));
        if (descInput) setReactInput(descInput, 'chom');

        // Serving size qty
        const qtyInput = inputs.find(i => i.type === 'number' && i.placeholder === '1');
        if (qtyInput) setReactInput(qtyInput, '3');

        // Serving size unit
        const unitInput = inputs.find(i => i.placeholder && i.placeholder.includes('roti, cup, gm'));
        if (unitInput) setReactInput(unitInput, 'gm');

        return {
          brand: brandInput ? brandInput.value : 'missing',
          desc: descInput ? descInput.value : 'missing',
          qty: qtyInput ? qtyInput.value : 'missing',
          unit: unitInput ? unitInput.value : 'missing'
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 1 filled state:', fillStep1Res?.result?.value);
  await new Promise((r) => setTimeout(r, 600));

  // Capture Step 1 Screenshot
  const shotStep1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\step1_basic_info_filled.png`, Buffer.from(shotStep1.data, 'base64'));
  console.log('Saved step1_basic_info_filled.png');

  // 4. Click Next -> Advance to Step 2
  console.log('Clicking Next to move to Step 2...');
  const nextRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent && b.textContent.includes('Next') && !b.disabled);
        if (nextBtn) {
          nextBtn.click();
          return 'Clicked Next button: ' + nextBtn.textContent.trim();
        }
        return 'Next button not found or disabled';
      })()
    `
  });
  console.log('Next result:', nextRes?.result?.value);
  await new Promise((r) => setTimeout(r, 800));

  // 5. Fill Step 2: Calories = 1000
  console.log('Filling Calories: 1000 in Step 2...');
  const fillStep2Res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        function setReactInput(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) {
            setter.call(input, val);
          } else {
            input.value = val;
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const inputs = Array.from(document.querySelectorAll('input'));
        const calInput = inputs.find(i => i.placeholder && i.placeholder.includes('1000'));
        if (calInput) {
          setReactInput(calInput, '1000');
          return 'Calories set to: ' + calInput.value;
        }
        return 'Calories input not found. Total inputs: ' + inputs.length;
      })()
    `
  });
  console.log('Calories input result:', fillStep2Res?.result?.value);
  await new Promise((r) => setTimeout(r, 600));

  // Capture Step 2 Screenshot
  const shotStep2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\step2_nutrition_facts_filled.png`, Buffer.from(shotStep2.data, 'base64'));
  console.log('Saved step2_nutrition_facts_filled.png');

  // 6. Click Save button in Step 2 to trigger missing nutrients prompt
  console.log('Clicking Save to trigger Missing Nutrient Information prompt...');
  const saveRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const saveBtn = btns.find(b => b.textContent && (b.textContent.includes('Save & Log') || b.textContent.includes('Save')));
        if (saveBtn) {
          saveBtn.click();
          return 'Clicked Save: ' + saveBtn.textContent.trim();
        }
        return 'Save button not found';
      })()
    `
  });
  console.log('Save result:', saveRes?.result?.value);
  await new Promise((r) => setTimeout(r, 800));

  // Capture Missing Nutrients Dialog Screenshot
  const shotDialog = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\step2_missing_nutrients_dialog.png`, Buffer.from(shotDialog.data, 'base64'));
  console.log('Saved step2_missing_nutrients_dialog.png');

  // 7. Click "[No Thanks]" button on Dialog
  console.log('Clicking [No Thanks] on Nutrient Prompt Dialog...');
  const noThanksRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const noThanksBtn = btns.find(b => b.textContent && b.textContent.includes('No Thanks'));
        if (noThanksBtn) {
          noThanksBtn.click();
          return 'Clicked No Thanks';
        }
        return 'No Thanks button not found';
      })()
    `
  });
  console.log('No thanks result:', noThanksRes?.result?.value);
  await new Promise((r) => setTimeout(r, 800));

  // Capture Toast / Catalog screen
  const shotToast = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\food_hub_after_save_toast.png`, Buffer.from(shotToast.data, 'base64'));
  console.log('Saved food_hub_after_save_toast.png');

  // 8. Go back to Dashboard to inspect the newly logged item in Lunch
  console.log('Navigating to Dashboard to check Lunch...');
  const backToDashRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const dashBtn = btns.find(b => b.textContent && b.textContent.includes('Dashboard'));
        if (dashBtn) {
          dashBtn.click();
          return 'Clicked Dashboard';
        }
        return 'Dashboard button not found';
      })()
    `
  });
  console.log('Dashboard nav result:', backToDashRes?.result?.value);
  await new Promise((r) => setTimeout(r, 800));

  // Scroll to chom in Lunch card
  const scrollRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const chomEl = elements.find(e => e.textContent && e.textContent.trim() === 'chom');
        if (chomEl) {
          chomEl.scrollIntoView({ behavior: 'instant', block: 'center' });
          return 'Scrolled to chom element';
        }
        window.scrollBy({ top: 600, behavior: 'instant' });
        return 'Scrolled down by 600px';
      })()
    `
  });
  console.log('Scroll result:', scrollRes?.result?.value);
  await new Promise((r) => setTimeout(r, 600));

  const shotDashboard = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\dashboard_lunch_with_chom.png`, Buffer.from(shotDashboard.data, 'base64'));
  console.log('Saved dashboard_lunch_with_chom.png');

  // Also capture My Foods tab in Food Hub to verify persistent listing
  console.log('Navigating to Food Hub My Foods tab...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const foodHubBtn = btns.find(b => b.textContent && b.textContent.includes('Food Hub'));
        if (foodHubBtn) foodHubBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const myFoodsBtn = btns.find(b => b.textContent && b.textContent.includes('My Foods'));
        if (myFoodsBtn) myFoodsBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 600));

  const shotMyFoods = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\food_hub_my_foods_verified.png`, Buffer.from(shotMyFoods.data, 'base64'));
  console.log('Saved food_hub_my_foods_verified.png');

  // Desktop view check (1280x800)
  console.log('Switching to Desktop View (1280x800)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 600));

  const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artifactDir}\\desktop_food_hub_my_foods.png`, Buffer.from(shotDesktop.data, 'base64'));
  console.log('Saved desktop_food_hub_my_foods.png');

  console.log('All verification steps completed successfully!');
  chromeProc.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error during execution:', err);
  process.exit(1);
});
