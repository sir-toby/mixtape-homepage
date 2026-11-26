import type { APIRoute, GetStaticPaths } from 'astro';
import { getEvents, toIcs, type Event } from '../../lib/events';

export const getStaticPaths = (async () => {
  const { upcoming } = await getEvents();
  return upcoming.map((event) => ({ params: { slug: event.id }, props: { event } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const event = props.event as Event;
  const page = new URL(`${import.meta.env.BASE_URL}events/${event.id}/`, site);
  return new Response(toIcs([event], () => page.toString()), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
