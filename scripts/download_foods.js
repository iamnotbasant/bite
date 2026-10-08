import fs from 'fs';
import path from 'path';

const foods = [
  {
    name: 'roti.jpg',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&h=300&q=85'
  },
  {
    name: 'daal.jpg',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&h=300&q=85'
  },
  {
    name: 'protein_shake.jpg',
    url: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=300&h=300&q=85'
  },
  {
    name: 'salad.jpg',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&h=300&q=85'
  },
  {
    name: 'rice.jpg',
    url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=300&h=300&q=85'
  }
];

async function download() {
  for (const item of foods) {
    try {
      console.log(`Downloading ${item.name}...`);
      const res = await fetch(item.url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const dest = path.join('public', 'foods', item.name);
        fs.writeFileSync(dest, buf);
        console.log(`Saved ${dest} (${buf.length} bytes)`);
      } else {
        console.error(`Failed ${item.name}: status ${res.status}`);
      }
    } catch (e) {
      console.error(`Error downloading ${item.name}`, e);
    }
  }
}

download();
