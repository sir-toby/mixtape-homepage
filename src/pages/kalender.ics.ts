import type { APIRoute } from 'astro';
import { getEvents, toIcs } from '../lib/events';

// Subscribable calendar with all public appearances (upcoming and past).
export const GET: APIRoute = async ({ site }) => {
  const { upcoming, past } = await getEvents();
  const page = (id: string) => new URL(`${import.meta.env.BASE_URL}events/${id}/`, site).toString();
  const body = toIcs([...past.reverse(), ...upcoming], (e) => page(e.id), 'Mixtape – Auftritte');
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
