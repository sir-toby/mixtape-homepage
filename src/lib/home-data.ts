// Shared data for the homepage and the design prototypes.
import { getCollection, getEntry } from 'astro:content';
import { getEvents } from './events';

export async function getHomeData() {
  const home = (await getEntry('pages', 'home'))!;
  const newsletter = (await getEntry('pages', 'newsletter'))!;
  const { upcoming, past } = await getEvents();
  const members = (await getCollection('members', ({ data }) => !data.former)).sort((a, b) => a.data.order - b.data.order);
  return { home, newsletter, upcoming, past, members };
}
