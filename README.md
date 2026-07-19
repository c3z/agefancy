# AGEFANCY — a personal cipher machine

A brutalist, 100% client-side cipher machine that runs in the browser.
Fork of [agewasm](https://github.com/MarinX/agewasm) (Marin Basic) — real
[age](https://github.com/FiloSottile/age) cryptography wrapped in an
Enigma-inspired interface. UI in Polish by default, switchable to English.

Live: **https://agefancy.vercel.app**

## What it does

- **Keys from settings, not from files.** An xkcd-style phrase — 4 random
  words, Polish by default (a cleaned diceware-pl list, 6,858 words,
  ~51 bits) or English (EFF large, 7,776 words, ~52 bits) — plus 4 setting
  dials with positions 1–F (like Enigma rings). `scrypt(phrase, salt=dials)`
  deterministically derives an X25519 private key: the same settings produce
  the same key on every device, nothing needs to be stored. Polish
  diacritics are folded to ASCII before derivation ("żółw" ≡ "zolw"), so a
  phrase survives being dictated over the phone.
- **Ciphertext like a telegram.** Binary age output (minus the constant
  format header) is base32-encoded and cut into classic 5-character blocks:
  `HE2U4 MRYNR IUQY2 …` — paste it into WhatsApp, an SMS, or a postcard.
- **Zero server.** All cryptography is Go compiled to WebAssembly; fonts are
  bundled locally — the page makes no external requests. A strict CSP and
  security headers ship via `vercel.json`.
- **A real cipher with honest limits.** age = X25519 + ChaCha20-Poly1305;
  only the interface is an Enigma. Deliberate design boundaries: the key is
  deterministic and long-lived (no forward secrecy — leaked settings also
  decrypt past telegrams), the cipher does not authenticate the sender
  (your transport does), and message length remains visible.

## How two people use it

1. Roll a phrase, set the dials. Hand the settings to the other side over a
   safe channel (in person, whispered) — never the channel you'll send the
   telegram through.
2. Both tune the machine to the same settings → identical keys.
3. Encrypt (USE MINE) and send the blocks however you like.
4. The other side pastes the blocks and reads.

Asymmetric variant: each side rolls its own phrase, you exchange public keys
(`age1…` — safe to send openly) and encrypt to the recipient's key.

## Building

Requires [Go](https://go.dev/) and [pnpm](https://pnpm.io/).

```bash
make build      # wasm + vite → dist/
pnpm run dev    # dev server with live reload (does not rebuild the WASM)
make build-wasm # WASM only, after changes to *.go
```

The static `dist/` goes on any hosting (production runs on Vercel,
`make deploy`).

## Architecture

| Layer | What |
| --- | --- |
| `derive.go` | scrypt (N=2^16, r=8, p=1) → 32 bytes → bech32 `AGE-SECRET-KEY-` → age identity |
| `encrypt.go` / `decrypt.go` | original agewasm API (`encryptBinary`/`decryptBinary`) |
| `internal/bech32` | copy of `filippo.io/age/internal/bech32` (BSD) |
| `src/main.js` | dials, phrase rolling (PL/EN wordlists, rejection sampling), base32 ⇄ blocks of 5, age header strip/prepend, i18n overlay |
| `src/i18n.js` | English UI dictionary (Polish is the source of truth in the markup) |
| `src/style.css` | brutalism: paper + ink + stamp red, IBM Plex Mono + Archivo Black |

The KDF salt is versioned (`agefancy/v1|rotors:XXXX`). The passphrase
normalization (lowercase, whitespace collapse, Polish-diacritic folding) is
part of the same v1 contract — changing scrypt parameters, the salt format,
or the normalization breaks previously derived keys.

## Honest security assessment

The phrase + dials are the only secret. A generator-rolled phrase (~52 bits)
plus random dials (~15.6 bits; ROLL PHRASE spins them together) plus
memory-hard scrypt = realistically unguessable. A human-invented phrase
("correct horse") = a toy. What this tool does NOT provide: forward secrecy
(the key is permanent — compromised settings decrypt the full history),
sender authentication, or length hiding. For flirting on WhatsApp it is more
than enough; for professional secrets use a ratcheting messenger (Signal),
not a phrase.

## License

MIT. Original agewasm © Marin Basic ([marin-basic.com](https://marin-basic.com)),
agefancy modifications © c3z. `internal/bech32` under the license in its
file header.
