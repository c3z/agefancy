# AGEFANCY — osobista maszyna szyfrowa

Brutalistyczna, w 100% client-side'owa maszyna szyfrowa w przeglądarce.
Fork [agewasm](https://github.com/MarinX/agewasm) (Marin Basic) — prawdziwa
kryptografia [age](https://github.com/FiloSottile/age) opakowana w interfejs
inspirowany Enigmą.

## Co robi

- **Klucz z nastaw, nie z pliku.** Fraza w stylu xkcd (4 losowe słowa z listy
  EFF, ~52 bity entropii) + 4 śruby nastawcze o przełożeniu 1–F (jak
  pierścienie Enigmy). `scrypt(fraza, salt=śruby)` deterministycznie
  wyprowadza klucz prywatny X25519 — te same nastawy dają ten sam klucz na
  każdym urządzeniu, niczego nie trzeba zapisywać.
- **Szyfrogram jak depesza.** Binarny output age (bez stałego nagłówka
  formatu) kodowany base32 i cięty w klasyczne bloki po 5 znaków:
  `HE2U4 MRYNR IUQY2 …` — wklejasz w WhatsAppa, SMS-a, na kartkę pocztową.
- **Zero serwera.** Cała kryptografia to Go skompilowane do WebAssembly,
  fonty bundlowane lokalnie — strona nie wykonuje żadnych zapytań
  zewnętrznych. Działa offline.
- **Prawdziwy szyfr, jasne granice.** age = X25519 + ChaCha20-Poly1305;
  Enigmą jest tu tylko interfejs. Świadome granice designu: klucz jest
  deterministyczny i długowieczny (brak forward secrecy — wyciek nastaw
  odczytuje też stare depesze), szyfr nie uwierzytelnia nadawcy (to robi
  kanał, którym wysyłasz), długość wiadomości pozostaje widoczna.

## Jak używać we dwoje

1. Wylosuj frazę, ustaw śruby. Przekaż nastawy drugiej stronie bezpiecznym
   kanałem (osobiście, na ucho) — nigdy tym, którym poślesz szyfrogram.
2. Oboje zestrajacie maszynę na te same nastawy → identyczny klucz.
3. Szyfrujesz (UŻYJ MOJEGO), wysyłasz bloki czym chcesz.
4. Druga strona wkleja bloki i czyta.

Wariant asymetryczny: każdy losuje własną frazę, wymieniacie się kluczami
publicznymi (`age1…` — wolno wysłać jawnie) i szyfrujecie do klucza adresata.

## Budowanie

Wymagane: [Go](https://go.dev/), [pnpm](https://pnpm.io/).

```bash
make build      # wasm + vite → dist/
pnpm run dev    # dev-serwer z live-reload (nie przebudowuje WASM)
make build-wasm # sam WASM po zmianach w *.go
```

Statyczny `dist/` wrzucasz na dowolny hosting (produkcja stoi na Vercelu).

## Architektura

| Warstwa | Co |
| --- | --- |
| `derive.go` | scrypt (N=2^16, r=8, p=1) → 32 bajty → bech32 `AGE-SECRET-KEY-` → tożsamość age |
| `encrypt.go` / `decrypt.go` | oryginalne API agewasm (`encryptBinary`/`decryptBinary`) |
| `internal/bech32` | kopia z `filippo.io/age/internal/bech32` (BSD) |
| `src/main.js` | rotory, losowanie frazy (EFF large wordlist, rejection sampling), base32 ⇄ bloki po 5, strip/prepend nagłówka age |
| `src/style.css` | brutalizm: papier + tusz + czerwień stempla, IBM Plex Mono + Archivo Black |

Sól KDF jest wersjonowana (`agefancy/v1|rotors:XXXX`) — zmiana parametrów
scrypt lub formatu soli to nowa wersja i niekompatybilne klucze.

## Uczciwa ocena bezpieczeństwa

Fraza + śruby to jedyny sekret. Losowa fraza z generatora (~52 bity) + losowe
śruby (~15,6 bita; LOSUJ FRAZĘ przestawia je razem z frazą) + memory-hard
scrypt = realnie nie do zgadnięcia. Fraza wymyślona przez człowieka ("ala ma
kota") = zabawka. Czego to narzędzie NIE daje: forward secrecy (klucz jest
wieczny — kompromitacja nastaw odczytuje całą historię), uwierzytelnienia
nadawcy, ukrycia długości wiadomości. Do flirtu na WhatsAppie aż nadto; do
tajemnic zawodowych bierz komunikator z ratchetem (Signal), nie frazę.

## Licencja

MIT. Oryginalny agewasm © Marin Basic ([marin-basic.com](https://marin-basic.com)),
modyfikacje agefancy © c3z. `internal/bech32` na licencji z nagłówka pliku.
