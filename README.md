# Mixtape – Homepage

Neue Website der A-cappella-Band Mixtape. Gebaut mit [Astro](https://astro.build), Inhalte gepflegt mit [Sveltia CMS](https://sveltiacms.app).

- **Vorschau:** https://sir-toby.github.io/mixtape-homepage/ (noindex)
- **Design-Prototypen:** https://sir-toby.github.io/mixtape-homepage/prototypen/
- **CMS:** https://sir-toby.github.io/mixtape-homepage/admin/

## Inhalte bearbeiten (CMS)

1. `/admin/` öffnen.
2. Anmelden mit **„Sign In Using Access Token“**: einen [Fine-grained Personal Access Token](https://github.com/settings/personal-access-tokens/new) anlegen, nur für das Repo `sir-toby/mixtape-homepage`, Berechtigung *Contents: Read and write*. Der Token bleibt im Browser gespeichert.
   Alternativ lokal: im Chrome/Edge „Work with Local Repository“ wählen und den Repo-Ordner öffnen (Änderungen dann selbst committen).
3. Termine, Mitglieder, Seiten oder Einstellungen ändern und speichern. Jedes Speichern ist ein Commit auf `main`; nach ca. 2 Minuten ist die Seite neu gebaut.

„Sign In with GitHub“ braucht einen kleinen OAuth-Dienst ([sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth), z. B. als Cloudflare Worker) und ist noch nicht eingerichtet.

## Entwicklung

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # statische Seite nach dist/
npm run preview    # dist/ ansehen (inkl. /admin/)
```

Node.js ≥ 22.23. Mehr zur Struktur in [AGENTS.md](AGENTS.md).

## Deployment

`.github/workflows/deploy.yml` baut bei jedem Push auf `main`, täglich um 03:17 UTC (damit vergangene Termine in den Rückblick wandern) und manuell.

| Repo-Variable `DEPLOY_TARGET` | Ziel |
|---|---|
| nicht gesetzt / `github-pages` | GitHub Pages unter `/mixtape-homepage/`, mit `noindex` |
| `all-inkl` | eigene Domain bei all-inkl per FTPS |

GitHub Pages muss unter *Settings → Pages* auf **Source: GitHub Actions** stehen (nicht „Deploy from a branch“), sonst läuft zusätzlich ein Jekyll-Build, der den Rohcode veröffentlichen könnte.

### Umzug zu all-inkl (später)

1. Bei all-inkl einen FTP-Zugang anlegen, der nur auf den neuen Website-Ordner zeigt.
2. Im Repo unter *Settings → Secrets and variables → Actions*:
   - Secrets: `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`
   - Variablen: `DEPLOY_TARGET=all-inkl`, `FTP_DIR=/<ordner>`, optional `SITE_URL=https://mixtape-vocal.de`
3. Workflow laufen lassen, Ergebnis prüfen, dann die Domain im KAS auf den Ordner zeigen lassen.
4. In `public/admin/config.yml` `site_url` anpassen.

**Achtung:** Der Upload spiegelt `dist/` und löscht alles andere in `FTP_DIR`. Nie auf den Ordner der laufenden WordPress-Seite zeigen lassen.

Die URLs der alten WordPress-Seite (`/wer-wir-sind/`, `/events/<slug>/`, `/newsletter/`, `/impressum/`, `/datenschutzerklaerung/`) bleiben gleich.
