import { getCollection, type CollectionEntry } from 'astro:content';

export type Event = CollectionEntry<'events'>;

const TZ = 'Europe/Berlin';

/** Today's date in Berlin as YYYY-MM-DD, evaluated at build time (the site rebuilds daily). */
function todayInBerlin(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date());
}

/** Event dates are calendar days without a time zone; zod parses them as UTC midnight. */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getEvents() {
  const all = (await getCollection('events', ({ data }) => !data.draft)).sort(
    (a, b) => a.data.date.getTime() - b.data.date.getTime() || (a.data.start ?? '').localeCompare(b.data.start ?? ''),
  );
  const today = todayInBerlin();
  return {
    upcoming: all.filter((e) => isoDay(e.data.date) >= today),
    past: all.filter((e) => isoDay(e.data.date) < today).reverse(),
  };
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC', ...opts });

export const formatDate = (d: Date) => fmt({ day: 'numeric', month: 'long', year: 'numeric' }).format(d);
export const formatWeekday = (d: Date) => fmt({ weekday: 'short' }).format(d).replace('.', '');
export const formatWeekdayLong = (d: Date) => fmt({ weekday: 'long' }).format(d);
export const formatDay = (d: Date) => fmt({ day: '2-digit' }).format(d);
export const formatMonth = (d: Date) => fmt({ month: 'short' }).format(d).replace('.', '');
export const formatYear = (d: Date) => String(d.getUTCFullYear());

export function formatTime(e: Event): string {
  const { start, end } = e.data;
  if (!start) return 'Ganztägig';
  return end ? `${start} – ${end} Uhr` : `${start} Uhr`;
}

/** Calendar file (.ics) contents for one event. */
export function toIcs(e: Event, siteUrl: string): string {
  const day = isoDay(e.data.date).replaceAll('-', '');
  const t = (hhmm: string) => `${day}T${hhmm.replace(':', '')}00`;
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const next = new Date(e.data.date.getTime() + 86400000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mixtape//mixtape-vocal.de//DE',
    'BEGIN:VEVENT',
    `UID:${e.id}@mixtape-vocal.de`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    ...(e.data.start
      ? [`DTSTART;TZID=${TZ}:${t(e.data.start)}`, `DTEND;TZID=${TZ}:${t(e.data.end ?? e.data.start)}`]
      : [`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${isoDay(next).replaceAll('-', '')}`]),
    `SUMMARY:${esc(`Mixtape: ${e.data.title}`)}`,
    ...(e.data.location ? [`LOCATION:${esc([e.data.location, e.data.address].filter(Boolean).join(', '))}`] : []),
    `URL:${siteUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}

export function mapsUrl(e: Event): string | undefined {
  if (!e.data.location && !e.data.address) return undefined;
  const q = [e.data.location, e.data.address].filter(Boolean).join(', ');
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`;
}
