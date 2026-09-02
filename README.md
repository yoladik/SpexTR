# SpexTR

Zadáš svoje PC specs jednou, appka si je zapamatuje, a pak stačí napsat název hry
("cyber", "call of...") — appka najde hru na Steamu, stáhne její minimální a
doporučené systémové požadavky a porovná je s tvým PC. Ke každé komponentě
(CPU, GPU, RAM, volné místo na disku) ukáže zelenou/oranžovou/červenou podle
toho, jestli ji splňuješ, plus celkové zhodnocení, jak by hra na tvém PC měla jet.

## Jak to funguje

- Specs se ukládají do `localStorage` prohlížeče — žádný účet, žádná databáze.
- Vyhledávání her a systémové požadavky jdou přes Steam Store API
  (`/api/search`, `/api/game/[appid]` — server-side proxy, protože Steam
  API nemá CORS hlavičky pro volání z prohlížeče).
- Porovnání CPU/GPU je heuristika podle výkonnostní třídy (generace + řada),
  ne skutečný benchmark — u nerozpoznaných modelů appka řekne, že je potřeba
  porovnat ručně, místo aby hádala.

## Vývoj

```bash
npm install
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

## Nasazení

Appka je čistý Next.js projekt, takže jde nasadit jedním klikem na
[Vercel](https://vercel.com/new) — stačí připojit tenhle GitHub repo.
