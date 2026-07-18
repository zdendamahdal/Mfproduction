# AUDIT WEBU MF PRODUCTION

Datum: 18. 7. 2026 · Auditované soubory: `index.html`, `about.html`, `kontakt.html`, `style.css` (JS je inline v HTML) · Nic nebylo editováno.

---

## 🔴 KRITICKÉ

### K1. Mrtvý odkaz „Reference" na podstránkách
- **Kde:** `about.html:35`, `kontakt.html:35` — `<a href="index.html#portfolio">Reference</a>`
- **Co je špatně:** Sekce portfolia (`id="portfolio"`) byla z `index.html` odstraněna. Kliknutí na „Reference" z podstránek přesměruje na homepage a nikam nescrolluje. Návštěvník to vnímá jako rozbitý web.
- **Oprava:** Odkaz odstranit z obou podstránek, nebo ho nechat ukazovat na existující sekci (např. `index.html#klienti`).

### K2. Osiřelé stránky about.html a kontakt.html — z homepage se na ně nedá dostat
- **Kde:** `index.html:31-36` (nav vede jen na kotvy `#o-nas`, `#kontakt`), footer `index.html:313-341` také neodkazuje
- **Co je špatně:** `kontakt.html` obsahuje unikátní informace (fakturační údaje, IČO/DIČ, bankovní spojení, adresa, fax), ale z homepage na ni nevede žádný odkaz. `about.html` je duplicitní kopie sekce O nás. Obě stránky jsou dostupné jen navzájem mezi sebou — návštěvník přicházející na homepage je nikdy neuvidí.
- **Oprava:** Rozhodnout architekturu: buď (a) podstránky smazat a fakturační údaje přesunout do sekce `#kontakt`/patičky na homepage, nebo (b) nav na homepage propojit na `kontakt.html` a `about.html`. Současný stav je hybrid obou přístupů.

### K3. Kotvy `#klienti`, `#o-nas`, `#kontakt` končí schované pod fixní hlavičkou
- **Kde:** `style.css:411` — `scroll-margin-top` má **jen** `.services`; `.clients` (621), `.story` (911), `.cta` (721) ho nemají
- **Co je špatně:** Hlavička je `position: fixed` s výškou 88 px. Po kliknutí na „O nás" nebo „Kontakt" v menu (nebo na scroll šipku vedoucí na `#klienti`) se cílová sekce zarovná k úplnému vrcholu okna a její nadpis zmizí pod hlavičkou.
- **Oprava:** Přidat `scroll-margin-top: var(--header-height)` globálně na `section[id]` (nebo na každou cílovou sekci).

### K4. Plynulá scroll animace funguje jen na skryté šipce
- **Kde:** `index.html:385` — `document.querySelector('.scroll-down')`
- **Co je špatně:** `querySelector` vrátí jen **první** `.scroll-down` v DOM — tedy hero šipku (`index.html:64`), která je na desktopu `display: none`. Viditelná šipka pod službami (`index.html:103`) handler nedostane: scroluje nativně bez kompenzace výšky hlavičky (viz K3) a s jinou animací, než jaká byla laděna.
- **Oprava:** Použít `querySelectorAll('.scroll-down').forEach(...)` a handler pověsit na obě šipky.

### K5. Karty služeb: mrtvé CTA + zaseknutý hover na mobilu
- **Kde:** `index.html:75-91` (karty), `style.css:433` (`cursor: pointer`), `style.css:437-446` (hover efekty), `style.css:464-478` (hint „klikni pro zobrazit více..")
- **Co je špatně:** Dvě vady v jednom:
  1. Karta má kurzor ruky a text „klikni pro zobrazit více..", ale **žádný klik neexistuje** (není to `<a>`, nemá click handler). Uživatel kliká a nic se nestane.
  2. Hover efekt (`:hover` scale + brightness) na dotykovém zařízení „zamrzne": po tapnutí zůstanou ostatní karty ztmavené a zmenšené, dokud uživatel netapne jinam.
- **Oprava:** Buď z karet udělat skutečné odkazy na detail služeb, nebo hint a `cursor: pointer` odstranit. Hover efekty zabalit do `@media (hover: hover) and (pointer: fine)`.

### K6. Hero obrázek 1,5 MB PNG — pomalé první vykreslení
- **Kde:** `index.html:54` — `camera.png` (1774×887 px, 1 478 KB, formát PNG pro fotografii)
- **Co je špatně:** Je to LCP prvek stránky. PNG je pro fotky zcela nevhodný formát — na pomalejším připojení se hero načítá několik sekund. Stejná fotka jako JPG/WebP v kvalitě 80 by měla ~100–200 KB (7–10× méně).
- **Oprava:** Převést na WebP (příp. JPG), přidat `width`/`height` atributy a `fetchpriority="high"`.

---

## 🟡 DOPORUČENÉ

### D1. Chybějící `width`/`height` u všech obrázků → skákání layoutu (CLS)
- **Kde:** všechny `<img>` v `index.html`, `about.html`, `kontakt.html`
- **Oprava:** Doplnit intrinsic rozměry (`width`/`height` atributy); prohlížeč si rezervuje místo před načtením.

### D2. Chybí `loading="lazy"` u obrázků pod ohybem
- **Kde:** 36× logo v karuselu (`index.html:117-225`), `dron.jpg` (`index.html:289`)
- **Oprava:** Přidat `loading="lazy"` (hero obrázek naopak nechat eager). U 36 log zvážit i `decoding="async"`.

### D3. dron.jpg je upscalovaný — rozmazané CTA pozadí
- **Kde:** `index.html:289`, zdroj má jen 816×245 px, roztahuje se přes celou šířku (1440+ px) jako `object-fit: cover`
- **Oprava:** Nahradit zdrojem v alespoň 1920×600 px.

### D4. Neoptimalizovaná loga a nepoužité těžké soubory v repozitáři
- **Kde:** `Noe-logo-2016.png` 262 KB (1124×1181, zobrazuje se ~113×67), `MF.webp` 55 KB (1536×1024, zobrazuje se 80×50), `husqvarna-logo.jpeg` 1000×1000; `camera 2.png` + `camera3.png` (3,4 MB) **už nejsou nikde v HTML použité**, ale jsou commitnuté v gitu
- **Oprava:** Loga zmenšit na ~2× zobrazovanou velikost a převést na WebP. Nepoužité `camera 2.png`/`camera3.png` smazat z repa. Poznámka ke stavu gitu: 3 smazané PNG (`1AA78...` atd.) čekají necommitnuté, `style.css` má necommitnuté změny.

### D5. Fonty přes `@import` v CSS — render-blocking řetěz
- **Kde:** `style.css:1`
- **Co je špatně:** Prohlížeč musí nejdřív stáhnout `style.css`, teprve pak zjistí, že má stáhnout CSS fontů — o jedno kolečko navíc. Navíc se stahuje váha 500, která se nikde nepoužívá.
- **Oprava:** Přesunout do `<head>` jako `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` (preconnecty už v HTML jsou) a vyhodit váhu 500.

### D6. Mrtvý CSS kód (~130+ řádků)
- **Kde (vše `style.css`):**
  - `.portfolio`, `.portfolio-grid`, `.portfolio-item`, `.portfolio-overlay`, `.portfolio-label`, `.portfolio-play`, `.portfolio-more` (536-618) — sekce už neexistuje; navíc `.portfolio-grid` pravidla zůstala i v obou media queries (1082-1084, 1116-1118)
  - `.link-arrow` (512-533) — odkazy „Více informací" byly odstraněny
  - `.video-container` (1136-1153) — žádný video embed v HTML není
  - `.header-cta` (263-266), `.btn-outline` (110-119), `.logo-icon svg` (191-194) — bez odpovídajícího HTML
  - nepoužité proměnné: `--blue-dark` (19), `--accent-noe` (25), `--accent-noe-dark` (26)
  - třída `contact` na odkazu Kontakt (`index.html:35`) nemá žádné CSS pravidlo
- **Oprava:** Smazat. Zmenší CSS o ~15 % a zpřehlední údržbu.

### D7. Nekonzistentní hlavička a patička mezi stránkami
- **Kde:**
  - Podtitulek loga: „Petr Mahdal - video" (`index.html:26`) vs. „MEDIA PRODUCTION" (`about.html:27`, `kontakt.html:27`)
  - Patička index: telefon + adresa + IČO/DIČ, **bez** sociálních sítí; patička podstránek: e-mail + adresa + Facebook/YouTube, **bez** IČO/DIČ
  - Copyright: „Copyright ©2026 MF Production" (`index.html:338`) vs. „Copyright © 2009–2026 MF Production" (`about.html:125`, `kontakt.html:138`)
  - Nav podstránek má 5 položek včetně Reference, nav homepage 4 položky
- **Oprava:** Sjednotit na jednu verzi hlavičky/patičky a tu zkopírovat do všech tří souborů (bez build systému to jinak nejde — o důvod víc zvážit redukci na jednu stránku, viz K2).

### D8. Duplicitní obsah „O nás"
- **Kde:** `index.html:266-282` (sekce `#o-nas`) a `about.html:64-73` obsahují totožné čtyři odstavce
- **Co je špatně:** Dvojí údržba (změna textu se musí dělat 2×) a duplicate content pro vyhledávače.
- **Oprava:** Nechat jen jednu verzi (viz rozhodnutí v K2).

### D9. Šipka v hero (mobil) přeskakuje sekci Služby
- **Kde:** `index.html:64` — `href="#klienti"`
- **Co je špatně:** Na mobilu je hero šipka jediná viditelná a vede na „Pro koho jsme točili" — uživatel přeskočí celou sekci Služby, která je hned pod hero.
- **Oprava:** Změnit cíl na `#sluzby`.

### D10. Hierarchie nadpisů přeskakuje úrovně
- **Kde:** `index.html`: h1 (hero) → **h3** v kartách služeb (75-91) bez mezilehlého h2 (sekce Služby nemá nadpis); `kontakt.html`: h1 → **h3** v kartách firemních údajů (85, 91)
- **Oprava:** Karty přeznačit na h2 (nebo sekcím dát vizuálně skrytý h2 nadpis).

### D11. Prázdné elementy v hero
- **Kde:** `index.html:60` — `<h1>video produkce<br></h1>` (zbytečný `<br>` na konci), `index.html:61` — `<p class="hero-subtitle"></p>` je prázdný, ale přes CSS marginy (`style.css:400-407`) vytváří ~64 px mrtvého místa
- **Oprava:** Odstranit `<br>` i prázdný odstavec (nebo odstavec vyplnit textem).

### D12. Malé dotykové cíle
- **Kde:** `.services-toggle` (`index.html:96`, `style.css:486-500`) a `.story-toggle` (`index.html:276`) — textová tlačítka bez paddingu, aktivní plocha ~20 px na výšku (doporučené minimum 44×44 px); odkazy v patičce 13,5 px bez paddingu
- **Oprava:** Přidat `padding: 12px` (a případně záporný margin, aby vizuál zůstal).

### D13. Kontrast na hranici čitelnosti
- **Kde:** `.service-card-hint` — modrá `#2f80f0` na `#0c1f3d` při 11,5 px vychází ~4,4:1 (těsně pod AA limitem 4,5:1 pro malý text); `.logo-subtitle` 9,5 px `#6f7c93` je těsně nad limitem, ale je to extrémně malé písmo
- **Oprava:** Zesvětlit barvu hintu (např. `#5a9bf5`) nebo zvětšit písmo; podtitulek loga zvětšit aspoň na 10,5 px.

### D14. Marquee log běží pořád, i mimo viewport
- **Kde:** `style.css:639` — `animation: clients-scroll 100s linear infinite`
- **Co je špatně:** Animace (byť GPU-friendly, jen `transform`) běží od načtení stránky donekonečna i když sekce není vidět — zbytečný odběr baterie na mobilech.
- **Oprava:** IntersectionObserver, který přidá/odebere `animation-play-state: paused` podle viditelnosti sekce.

### D15. Magická čísla v animaci karuselu
- **Kde:** `style.css:651` — `translateX(calc(-18 * (137px + 20px)))`
- **Co je špatně:** Počet log (18), šířka karty (137 px) a mezera (20 px) jsou zadrátované na třech místech (HTML počet, `.client-logo` šířka, keyframe). Přidání jediného loga bez přepočtu rozbije plynulost smyčky.
- **Oprava:** Zavést CSS proměnné `--logo-count`, `--logo-w`, `--logo-gap` a odkazovat je v keyframe i `.client-logo`.

### D16. `aria-controls` chybí u přepínače služeb
- **Kde:** `index.html:96` — `#servicesToggle` nemá `aria-controls` (na rozdíl od `#storyToggle`, který ho má, `index.html:276`); `.services-grid` nemá `id`
- **Oprava:** Dát gridu `id` a doplnit `aria-controls`.

---

## 🟢 NICE TO HAVE

### N1. Chybí favicon
- Každé načtení generuje 404 na `/favicon.ico`, v záložce je generická ikona. Vyrobit z `MF.webp` a přidat `<link rel="icon">` do všech stránek.

### N2. SEO meta výbava
- **Title homepage** je jen „MFproduction" (`index.html:7`) — lepší např. „MFproduction – videoprodukce, reportáže a firemní videa | Bánov".
- **Open Graph / Twitter Card tagy** chybí na všech stránkách — sdílení na sociálních sítích bude bez náhledu.
- **`robots.txt` a `sitemap.xml`** neexistují.
- **Canonical** tagy chybí (relevantní kvůli duplicitě O nás, viz D8).

### N3. Textové drobnosti
- `index.html:294` — „Napište nám.  " (koncové mezery), `index.html:295` — „my vám pomůžeme." (malé písmeno na začátku věty)
- `index.html:78` a další — „klikni pro zobrazit více.." (dvě tečky místo tří / výstižnější „zobrazit více"), navíc nekonzistentní tykání vs. vykání ve zbytku webu („Napište nám", „Kontaktujte nás")
- `index.html:255` — „vše vymyslíme, natočíme a sestříháme" (malé písmeno, ostatní položky checklistu začínají velkým)
- `kontakt.html:88` — „fax.: +420 572 581 715" — stejné číslo jako telefon; fax v roce 2026 zvážit úplně vypustit

### N4. Alt texty
- `index.html:151` — `alt="Klient"` u loga s vlnovkou (doplnit skutečný název firmy)
- `index.html:54` — `alt="kamera"`: hero fotka je dekorativní, čistší je `alt=""`
- `index.html:289` — `dron.jpg` má správně `alt=""` ✓

### N5. Robustnost JS
- `behavior: 'instant'` (`index.html:399,413`) neznají starší Safari — neškodné (spadne do defaultu), ale čistší je `'auto'` + dočasné vypnutí `scroll-behavior` na `<html>`, nebo feature-detect.
- `servicesToggleLabel.textContent` (`index.html:369`) není kryté null-checkem (guard testuje jen toggle a grid) — kdyby někdo přejmenoval span, JS spadne.

### N6. Hover scale přetéká na krajích
- Při šířkách ~700–1100 px se karta služby při hoveru zvětší na 120 % a její okraj ořízne `overflow-x: hidden` na `<body>` — decentnější by bylo `scale(1.1)` pod 1100 px.

### N7. `body { overflow-x: hidden }` maskuje chyby
- `style.css:38` — funguje jako pojistka, ale skrývá případné skutečné horizontální přetečení. Po vyřešení N6 zvážit odstranění a otestování.

### N8. Konsolidace duplicitního inline JS
- Mobilní menu skript je zkopírovaný ve třech HTML souborech. Přesunout do `script.js` a linkovat — jedna údržba místo tří.

---

## SHRNUTÍ

| Priorita | Počet | Nejdůležitější akce |
|---|---|---|
| 🔴 Kritické | 6 | Rozhodnout architekturu podstránek (K2), opravit mrtvé odkazy a kotvy (K1, K3), zkomprimovat hero (K6) |
| 🟡 Doporučené | 16 | Výkon obrázků (D1–D4), úklid CSS (D6), sjednocení hlavičky/patičky (D7) |
| 🟢 Nice to have | 8 | Favicon, OG tagy, textové korektury |

**Doporučené pořadí prací:** K1+K3+K4 (rychlé opravy, ~30 min) → K2 (rozhodnutí o struktuře, ovlivní D7+D8) → K5+K6 (UX a výkon) → D-blok → N-blok.
