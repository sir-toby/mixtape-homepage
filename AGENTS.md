# Mixtape Homepage

Website der A-cappella-Band **Mixtape** (Nachfolger der WordPress-Seite mixtape-vocal.de). Astro 7, statisch gebaut, Inhalte als Markdown, gepflegt über Sveltia CMS unter `/admin/`.

## Wo was liegt

| Pfad | Inhalt |
|---|---|
| `src/content/events/*.md` | Auftritte. Dateiname = URL-Slug `/events/<slug>/` (wie auf der alten WordPress-Seite). |
| `src/content/members/*.md` | Bandmitglieder, `former: true` für Ehemalige. |
| `src/content/pages/*.md` | Texte der Einzelseiten: Startseite, Über uns, Newsletter, Impressum, Datenschutz, außerdem `termine.md` (Texte der Terminseite, Kalender-Abo, Hinweis bei privaten Terminen) und `fehlerseite.md` (404). Felder in `content.config.ts` (`textFields`) und `public/admin/config.yml`. |
| `src/data/settings.json` | E-Mail, Instagram, CleverReach-Formular-URL, Genres. |
| `src/content.config.ts` | Schemas der Collections. Neue Felder hier **und** in `public/admin/config.yml` eintragen. |
| `src/assets/` | Bilder, die Astro optimiert (Fotos, Event-Plakate, Porträts). Logo als SVG in `src/assets/brand/`: `logo.svg`/`logo-light.svg` (Original), `logo-mark.svg` (Doppelspule + M-Strich, Ausschnitt aus `logo.svg`), `zahnrad*.svg` (Spulen-Nabe, steckt auch in `Reel.astro` und `Cassette.astro`). |
| `public/admin/` | Sveltia CMS (Konfiguration in `config.yml`). |
| `src/pages/prototypen/` | Frühere Design-Entwürfe A (creme, `theme="cream"`), B und C (noindex, nicht in der Sitemap). Die Hauptseite ist Entwurf A2. |
| `.github/workflows/deploy.yml` | Build und Deploy, Ziel über die Repo-Variable `DEPLOY_TARGET`. |

## Regeln

- **Vor jeder Änderung `git pull --rebase`.** Das CMS committet direkt auf `main`, das Repo ändert sich also auch ohne lokale Arbeit.
- **Lesbare Texte gehören ins CMS**, nicht in die Templates: Überschriften, Untertitel, Bildunterschriften, Hinweise. Im Code bleiben nur Bedienelemente (Navigation, allgemeine Buttons wie Details/Karte/Anmelden), Screenreader-Beschriftungen und Kassetten-Deko (Liner Notes, Vol. 01, Rec, Eure Feier, Privat).
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

## Gestaltung im Detail (mit der Band abgestimmt)

- **Startseite:** Kopf mit Bandfoto vor zwei gleich großen Spulen im Fenster einer blassen Kassetten-Silhouette (`TapeReels.astro`), keine große gezeichnete Kassette. Auf dem Handy zuerst Bild und Slogan, darunter die Buttons. Der nächste Termin erscheint als große Karte, alle weiteren als Zeilen darunter.
- **Terminzeilen** (`EventTrack.astro`): Wochentag über der Tageszahl, darunter Monat und Jahr, linksbündig und vertikal mittig zum Text. Links ein kleines Vorschaubild (nur ab Tablet-Breite); ohne Bild der Logo-Ausschnitt `logo-mark.svg` (Doppelspule + M-Strich). Keine Tracknummern.
- **Termindetail:** Label („Live“ / „Bisheriger Auftritt“) über beiden Spalten, Titel und Bild beginnen auf gleicher Höhe. Das Bild wird immer ganz gezeigt, nie beschnitten: Desktop höchstens Fensterhöhe, Handy volle Breite.
- **Über uns:** aktive Mitglieder als Karten mit Kassettenrücken (Name senkrecht, mit Abstand zum Rand), Ehemalige kleiner mit 220 px breitem Foto. Besetzung als Zeitleiste, Punkte mittig zum Text.
- **Zwischenüberschriften** in Handschrift (`hand-heading`), normale Schriftfarbe. Kein „Side A/B“.
- **Favicon** = Logo-Ausschnitt `logo-mark.svg` (`public/favicon.svg`, PNG/ICO daraus gerendert).
- **Lange Wörter** in Überschriften bekommen weiche Trennstellen über `src/lib/hyphenate.ts` (z. B. „Datenschutz-/erklärung“).
- **Ausprobiert und verworfen:** cremefarbener Grund (Prototyp A), Hintergrund mit Rasterpunkten und Riffelblech, diagonale Linien im Raster, Muster in den Seitenköpfen, unterschiedlich große Spulen, große Kassette im Seitenkopf.

## Inhalte und Herkunft

- Texte, Termine und Bilder stammen von der WordPress-Seite. Terminbilder waren dort Beitragsbilder (nicht auf der Detailseite sichtbar); gefunden über `/wp-json/oembed/1.0/embed?url=<event-url>` → `thumbnail_url`.
- Termine pflegt die Band von Hand im CMS. Tickets werden nicht über die Seite verkauft.
- Die Datenschutzerklärung pflegt die Band selbst. Sie ist unverändert von der alten Seite übernommen und muss vor dem Umzug zu all-inkl auf den neuen Host angepasst werden (Cookies/Consent-Abschnitte passen nicht mehr).

## Offen

- Umzug zu all-inkl (Anleitung im README), danach Kalender-Abo-Link und `site_url` im CMS auf die echte Domain.
- Kurzbeschreibung oben in `/llms.txt` (`src/pages/llms.txt.ts`) ist neu formuliert („Auftritte vor allem in Nürnberg und Umgebung“) – von der Band gegenlesen lassen.
- CMS-Login per GitHub-Token; „Sign in with GitHub“ (OAuth-Dienst) vielleicht später.
- Bild-Upload im CMS ist noch nicht getestet.
- Ein Inhalts-Konnektor (MCP), über den Bandmitglieder per KI Inhalte ändern, wurde besprochen, aber zurückgestellt: vorerst **nicht** auf dem NAS.

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
