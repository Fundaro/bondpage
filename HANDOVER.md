# fndr.8nomads.com – nodošanas piezīmes

Stāvoklis uz 2026-09-22.

## Kas tas ir

Statiska mājaslapa, kas sākta no Framer template "Homy" (framergeeks.com), nokopēta ar
saveweb2zip un pilnībā pārcelta uz savu hostingu. Neviens fails vairs nenāk no Framer
vai Google serveriem: viss JS, CSS, attēli, fonti, video un CMS dati ir mapē `public/`.

- Tiešsaiste: https://fndr.8nomads.com
- Repo: https://github.com/r-herb/fndr_public_bnd_page (privāts, zars `main`)
- Hostings: Cloudflare Worker `fndr-public-bnd-page` ar statiskajiem failiem (Workers Static Assets)
- Publicēšana: automātiska. Katrs `git push` uz `main` ~1 min laikā ir tiešsaistē (Workers Builds).
  Manuāli: `npx wrangler deploy` (vajag `wrangler login` Cloudflare kontā).

## Struktūra

```
public/                       viss, ko serveris atdod 1:1
  index.html                  sākumlapa (Framer HTML + iekļauts CSS)
  framerusercontent.com/      Framer JS moduļi (sites/), attēli (images/), video (assets/),
                              CMS dati (cms/, binārie .framercms faili)
  fonts.gstatic.com/          fonti
src/index.js                  Worker: atdod .framercms failu baitu diapazonus (?range=a-b),
                              ko Framer CMS klients pieprasa; pārējais ir statiski faili
wrangler.jsonc                Cloudflare konfigurācija (custom domain, SPA fallback)
```

## Kas strādā

- Sākumlapa `/`, `/properties` un 7 īpašumu lapas `/properties/<slug>` (tās renderē Framer
  runtime no CMS datiem, arī atverot adresi tieši).
- Analītika: izņemta pilnībā (events.framer.com). Framer rediģēšanas rīkjosla un
  "Made in Framer" poga arī izņemtas.

## Kas nestrādā / jāzina

- `/about-us`, `/contact-us`, `/privacy-policy` zip failā nebija: šīs saites rāda sākumlapu
  (SPA fallback). Jāuzbūvē pašiem.
- Kods ir Framer ģenerēts un minificēts, tāpēc tekstu labošana ir iespējama tikai `index.html`
  un CMS failos; saprātīgais ceļš ir pakāpeniski aizstāt to ar savu HTML/CSS.
- `.framercms` faili ir binārie ar fiksētiem nobīdēm: ja tajos maina URL, jaunajam jābūt
  tieši tikpat garam (tāpēc tur ir `/../%2e/framerusercontent.com/`, ko pārlūks normalizē).
- Cloudflare limits vienam failam ir 25 MB: abi video ir pārkodēti uz 1080p (12 MB).
- Lapas tekstos un saitēs vēl ir Homy demo saturs (tel, e-pasts, sociālie tīkli).

## Lokāla palaišana

```
npx wrangler dev --port 8790
```
Atver http://localhost:8790 . Nekāda build soļa nav.
