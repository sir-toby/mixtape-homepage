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

// Europe/Berlin with the EU daylight-saving rules, so every calendar app reads the times right.
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${TZ}`,
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

/** iCalendar lines may be at most 75 octets; longer ones continue on the next line after a space. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const ch of line) {
    const limit = parts.length ? 74 : 75;
    if (new TextEncoder().encode(current + ch).length > limit) {
      parts.push(current);
      current = ch;
    } else current += ch;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const escIcs = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n');

/** Markdown body as plain text: links become "text (url)", formatting marks are dropped. */
function plainText(md: string | undefined): string {
  return (md ?? '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => (text === href ? href : `${text} (${href})`))
    .replace(/[*_`#>]/g, '')
    .trim();
}

function vevent(e: Event, pageUrl: string): string[] {
  const day = isoDay(e.data.date).replaceAll('-', '');
  const t = (hhmm: string) => `${day}T${hhmm.replace(':', '')}00`;
  const next = new Date(e.data.date.getTime() + 86400000);
  const description = [plainText(e.body), pageUrl].filter(Boolean).join('\n\n');
  return [
    'BEGIN:VEVENT',
    `UID:${e.id}@mixtape-vocal.de`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    ...(e.data.start
      ? [`DTSTART;TZID=${TZ}:${t(e.data.start)}`, `DTEND;TZID=${TZ}:${t(e.data.end ?? e.data.start)}`]
      : [`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${isoDay(next).replaceAll('-', '')}`]),
    `SUMMARY:${escIcs(`Mixtape: ${e.data.title}`)}`,
    ...(e.data.location ? [`LOCATION:${escIcs([e.data.location, e.data.address].filter(Boolean).join(', '))}`] : []),
    `DESCRIPTION:${escIcs(description)}`,
    `URL:${pageUrl}`,
    'END:VEVENT',
  ];
}

/**
 * Calendar file with one or more events. With `name` it is a subscribable feed:
 * calendar apps show that name and re-fetch it twice a day.
 */
export function toIcs(events: Event[], pageUrl: (e: Event) => string, name?: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mixtape//mixtape-vocal.de//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...(name ? [`X-WR-CALNAME:${escIcs(name)}`, `X-WR-TIMEZONE:${TZ}`, 'REFRESH-INTERVAL;VALUE=DURATION:PT12H', 'X-PUBLISHED-TTL:PT12H'] : []),
    ...VTIMEZONE,
    ...events.flatMap((e) => vevent(e, pageUrl(e))),
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function mapsUrl(e: Event): string | undefined {
  if (!e.data.location && !e.data.address) return undefined;
  const q = [e.data.location, e.data.address].filter(Boolean).join(', ');
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`;
}
