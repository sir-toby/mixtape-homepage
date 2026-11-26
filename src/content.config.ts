import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Optional text field; an empty string (as a CMS may write it) counts as not set. */
const optional = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

const time = optional(z.string().regex(/^\d{2}:\d{2}$/, 'Uhrzeit im Format HH:MM'));

/** Auftritte. Der Dateiname ist der Slug (/events/<slug>/), wie auf der alten WordPress-Seite. */
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      start: time,
      end: time,
      location: optional(z.string()),
      address: optional(z.string()),
      image: optional(image()),
      imageAlt: optional(z.string()),
      links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
      /** Geschlossene Veranstaltung: erscheint im Kalender, aber ohne Ort und Einladung. */
      private: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const members = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/members' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      voice: z.string(),
      photo: image(),
      photoAlt: optional(z.string()),
      website: optional(z.string().url()),
      former: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

/** Einzelseiten. Jede Datei hat ihre eigenen Felder, daher ist fast alles optional. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tagline: z.string().optional(),
    heading: z.string().optional(),
    bookingText: z.string().optional(),
    bookingButton: z.string().optional(),
    lineup: z.array(z.object({ period: z.string(), names: z.string() })).optional(),
  }),
});

export const collections = { events, members, pages };
