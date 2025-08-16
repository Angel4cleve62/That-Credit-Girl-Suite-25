import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

const eventsPath = join(process.cwd(), '../../data/events.json');

export type EventRecord = {
  id: string;
  type: string;
  message?: string;
  metadata?: Record<string, any>;
  ts: string;
};

export async function logEvent(evt: Omit<EventRecord, 'ts'>) {
  await ensureDir(dirname(eventsPath));
  const current = await readEvents();
  const record: EventRecord = { ...evt, ts: new Date().toISOString() };
  current.push(record);
  await writeFile(eventsPath, JSON.stringify(current, null, 2), 'utf8');
}

export async function readEvents(): Promise<EventRecord[]> {
  try {
    const buf = await readFile(eventsPath, 'utf8');
    return JSON.parse(buf);
  } catch {
    return [];
  }
}

async function ensureDir(dir: string) {
  try { await mkdir(dir, { recursive: true }); } catch {}
}