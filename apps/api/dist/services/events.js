import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
const eventsPath = join(process.cwd(), '../../data/events.json');
export async function logEvent(evt) {
    await ensureDir(dirname(eventsPath));
    const current = await readEvents();
    const record = { ...evt, ts: new Date().toISOString() };
    current.push(record);
    await writeFile(eventsPath, JSON.stringify(current, null, 2), 'utf8');
}
export async function readEvents() {
    try {
        const buf = await readFile(eventsPath, 'utf8');
        return JSON.parse(buf);
    }
    catch {
        return [];
    }
}
async function ensureDir(dir) {
    try {
        await mkdir(dir, { recursive: true });
    }
    catch { }
}
