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
| `src/assets/` | Bilder, die Astro optimiert (Fotos, Event-Plakate, Porträts). Logo als SVG in `src/assets/brand/`: `logo.svg`/`logo-light.svg` (Original), `logo-mark.svg` (Doppelspule + M-Strich, Ausschnitt aus `logo.svg`), `zahnrad*.svg` (Spulen-Nabe, steckt auch in `Reel.astro` und `Cassette.astro`). |
| `public/admin/` | Sveltia CMS (Konfiguration in `config.yml`). |
| `src/pages/prototypen/` | Frühere Design-Entwürfe A (creme, `theme="cream"`), B und C (noindex, nicht in der Sitemap). Die Hauptseite ist Entwurf A2. |
| `.github/workflows/deploy.yml` | Build und Deploy, Ziel über die Repo-Variable `DEPLOY_TARGET`. |

## Regeln

- **Vor jeder Änderung `git pull --rebase`.** Das CMS committet direkt auf `main`, das Repo ändert sich also auch ohne lokale Arbeit.
- **Texte nicht umschreiben.** Die Inhalte stammen von der alten Seite und gehören der Band. Neue kurze Texte (Überschriften, Hinweise) sind ok, bestehende nur auf Wunsch ändern.
- **Interne Links immer über `url()`** aus `src/lib/url.ts` bauen, nie hart `/foo/`. Auf GitHub Pages liegt die Seite unter `/mixtape-homepage/`, später unter `/`. In Markdown dürfen Links mit `/` beginnen; `src/lib/satteri-links.mjs` setzt den Basis-Pfad davor.
- **Bildpfade im Frontmatter ab Projektwurzel** schreiben (`image: /src/assets/events/x.jpg`). Astro löst sie auf, und nur so findet das CMS die Bilder in seiner Medienbibliothek; relative Pfade (`../../assets/…`) sieht es nicht.
- Markdown läuft über **Sätteri** (Astro-7-Standard), nicht remark/rehype. Plugins als Sätteri-HAST/MDAST-Plugins schreiben.
- `/llms.txt` (Zusammenfassung für KI-Assistenten) wird beim Build aus den Inhalten erzeugt (`src/pages/llms.txt.ts`), nicht von Hand pflegen.
- Hintergrund: warmes Grau mit feinem Gewebe („Raster“, `--pattern` in `global.css`); Flächen mit Muster nutzen `surface`/`surface-2`. Die cyan/orangen Blöcke tragen dasselbe Muster (Klasse `tinted`), Seitenköpfe (`PageHero`) bewusst nicht.
- `/kalender.ics` ist ein abonnierbarer Kalender mit allen Auftritten (`src/pages/kalender.ics.ts`), einzelne Termine gibt es unter `/events/<slug>.ics`.
- Termine haben kein Zeitzonen-Problem: `date` ist ein Kalendertag, `start`/`end` sind Strings `HH:MM`. Vergangen/kommend entscheidet der Build (täglicher Cron-Build).
- Farben/Schriften als CSS-Variablen in `src/styles/global.css`. Markenfarben aus dem Logo: Cyan `#19BFD1`, Orange `#FF5D25`, Grund warmgrau mit Raster-Textur (bewusst kein einfarbiges Creme).
- **Dark Mode** über `data-mode="dark"` auf `<html>` (Systemeinstellung, Umschalter im Header, gespeichert in `localStorage`). Farben nur über Variablen: `--ink` (Text), `--edge` (Ränder/Versatzschatten von Karten), `--dark` (Flächen, die immer dunkel bleiben: Footer, Laufband, Kassettenrücken), `--card`, `--deck`. Cyan/orange Blöcke bekommen die Klasse `on-bright` (dunkle Schrift, weiße Karten in beiden Modi). Keine festen `#fff`/`#16171b` für Flächen einbauen.
- Kassetten-Stil statt Kassetten-Bild: `side-tag` (kleines Marker-Label über Seitenköpfen), `hand-heading` (Zwischenüberschriften in Handschrift; kein „Side A/B“ mehr, Wunsch der Band), `stripe-band`, Spulen (`Reel`), `CassetteOutline` als blasse Hintergrundform, J-Card-Optik mit Rücken, ▶/●-Icons auf Buttons. Die ganze Kassette (`Cassette.astro`) nur sparsam einsetzen, nicht groß im Seitenkopf (Wunsch der Band).

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
