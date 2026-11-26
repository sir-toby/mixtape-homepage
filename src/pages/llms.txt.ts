import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import settings from '../data/settings.json';
import { getEvents, formatDate, formatTime } from '../lib/events';

// Summary for language models (https://llmstxt.org), built from the same content as the site.
export const GET: APIRoute = async ({ site }) => {
  const abs = (path: string) => new URL(`${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`, site).toString();
  const home = (await getEntry('pages', 'home'))!;
  const about = (await getEntry('pages', 'wer-wir-sind'))!;
  const members = (await getCollection('members')).sort((a, b) => a.data.order - b.data.order);
  const { upcoming, past } = await getEvents();

  // Markdown body as plain text: links become "text (url)", emphasis marks are dropped.
  const plain = (md = '') =>
    md
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, h) => (t === h ? h : `${t} (${h})`))
      .replace(/\*\*?([^*]+)\*\*?/g, '$1')
      .trim();
  const event = (e: (typeof upcoming)[number]) =>
    `- [${e.data.title}](${abs(`/events/${e.id}/`)}): ${formatDate(e.data.date)}, ${formatTime(e)}` +
    (e.data.private ? ' (geschlossene Veranstaltung)' : e.data.location ? `, ${[e.data.location, e.data.address].filter(Boolean).join(', ')}` : '');

  const lines = [
    '# Mixtape',
    '',
    `> ${home.data.tagline} Mixtape ist eine A-cappella-Vocalband (Mixtape Vocal GbR), die seit 2022 Pop, Jazz, Rock und Singer/Songwriter singt – in Arrangements bekannter A-cappella-Gruppen und eigenen Arrangements. Auftritte vor allem in Nürnberg und Umgebung; buchbar für Konzerte, Feiern und Veranstaltungen.`,
    '',
    '## Über uns',
    '',
    plain(about.body),
    '',
    '## Mitglieder',
    '',
    ...members.filter((m) => !m.data.former).map((m) => `- ${m.data.name}: ${m.data.voice}${m.data.website ? ` (${m.data.website})` : ''}`),
    '',
    ...(about.data.lineup ?? []).map((l) => `- Besetzung ${l.period}: ${l.names}`),
    '',
    '## Kommende Auftritte',
    '',
    ...(upcoming.length ? upcoming.map(event) : ['- Zurzeit keine öffentlichen Termine.']),
    '',
    `Kalender zum Abonnieren (iCal): ${abs('/kalender.ics')}`,
    '',
    '## Buchung und Kontakt',
    '',
    `- E-Mail: ${settings.email}`,
    `- Instagram: ${settings.instagram}`,
    `- Newsletter (ca. 3–4 Mal im Jahr): ${abs('/newsletter/')}`,
    '',
    '## Seiten',
    '',
    `- [Startseite](${abs('/')})`,
    `- [Termine und bisherige Auftritte](${abs('/events/')})`,
    `- [Über uns](${abs('/wer-wir-sind/')})`,
    `- [Impressum](${abs('/impressum/')})`,
    '',
    '## Optional',
    '',
    'Bisherige Auftritte (Auswahl):',
    '',
    ...past.slice(0, 12).map(event),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
