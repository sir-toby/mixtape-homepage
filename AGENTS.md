# Mixtape Homepage

Website der A-cappella-Band **Mixtape** (Nachfolger der WordPress-Seite mixtape-vocal.de). Astro 7, statisch gebaut, Inhalte als Markdown, gepflegt über Sveltia CMS unter `/admin/`.

## Wo was liegt

| Pfad | Inhalt |
|---|---|
| `src/content/events/*.md` | Auftritte. Dateiname = URL-Slug `/events/<slug>/` (wie auf der alten WordPress-Seite). |
| `src/content/members/*.md` | Bandmitglieder, `former: true` für Ehemalige. |
| `src/content/pages/*.md` | Texte der Einzelseiten (Startseite, Über uns, Newsletter, Impressum, Datenschutz). |
| `src/data/settings.json` | E-Mail, Instagram, CleverReach-Formular-URL, Genres. |
| `src/content.config.ts` | Schemas der Collections. Neue Felder hier **und** in `public/admin/config.yml` eintragen. |
| `src/assets/` | Bilder, die Astro optimiert (Marke, Fotos, Event-Plakate, Porträts). |
| `public/admin/` | Sveltia CMS (Konfiguration in `config.yml`). |
| `src/pages/prototypen/` | Design-Prototypen A2, B und C (noindex, nicht in der Sitemap). A2 nutzt das Theme `data-theme="a2"` (Tokens in `global.css`) und die Komponente `Cassette.astro`. |
| `.github/workflows/deploy.yml` | Build und Deploy, Ziel über die Repo-Variable `DEPLOY_TARGET`. |

## Regeln

- **Texte nicht umschreiben.** Die Inhalte stammen von der alten Seite und gehören der Band. Neue kurze Texte (Überschriften, Hinweise) sind ok, bestehende nur auf Wunsch ändern.
- **Interne Links immer über `url()`** aus `src/lib/url.ts` bauen, nie hart `/foo/`. Auf GitHub Pages liegt die Seite unter `/mixtape-homepage/`, später unter `/`. In Markdown dürfen Links mit `/` beginnen; `src/lib/satteri-links.mjs` setzt den Basis-Pfad davor.
- Markdown läuft über **Sätteri** (Astro-7-Standard), nicht remark/rehype. Plugins als Sätteri-HAST/MDAST-Plugins schreiben.
- Termine haben kein Zeitzonen-Problem: `date` ist ein Kalendertag, `start`/`end` sind Strings `HH:MM`. Vergangen/kommend entscheidet der Build (täglicher Cron-Build).
- Farben/Schriften als CSS-Variablen in `src/styles/global.css`. Markenfarben aus dem Logo: Cyan `#19BFD1`, Orange `#FF5D25`.

## Entwickeln

```
npm install
astro dev --background      # http://localhost:4321, stoppen: astro dev stop
npm run build               # nach dist/
SITE_URL=https://sir-toby.github.io BASE_PATH=/mixtape-homepage npm run build   # wie auf GitHub Pages
```

Das CMS unter `/admin/` funktioniert nur im Build/Preview (`astro preview`), nicht im Dev-Server.

## Dokumentation

Der MCP-Server `astro-docs` (`.mcp.json`) durchsucht die offizielle Astro-Doku. Vor Arbeiten an Routing, Content Collections, Bildern oder Markdown dort nachsehen; Astro 7 unterscheidet sich in einigen Punkten von älteren Versionen.
