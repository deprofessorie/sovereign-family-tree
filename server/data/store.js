import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialData } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, 'store.json');

export class DataStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(STORE_PATH)) {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.save();
      } else {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error initializing store, falling back to initial data:', err);
      this.data = JSON.parse(JSON.stringify(initialData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data store:', err);
    }
  }

  get() {
    return this.data;
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
    return this.data;
  }
}

export const store = new DataStore();
