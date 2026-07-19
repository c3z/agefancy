// English UI dictionary. Polish is the source of truth in index.html — at
// startup main.js snapshots it, so switching back needs no PL dictionary.
// Values are innerHTML, but every string here is a build-time constant from
// this file (never user input), so the innerHTML sink stays safe.

export const EN_HTML = {
  tape: `ZERO SERVER &nbsp;///&nbsp; NOTHING LEAVES YOUR DEVICE &nbsp;///&nbsp;
    ENCRYPTION IN YOUR BROWSER &nbsp;///&nbsp; WORKS OFFLINE &nbsp;///&nbsp;
    OPEN SOURCE &nbsp;///&nbsp;`,
  subtitle: "A PERSONAL CIPHER MACHINE",
  stamp: "100%<br />CLIENT-SIDE",
  lede: `You encrypt here; whoever knows the <strong>phrase</strong> and the
    <strong>dial setting</strong> can read it. No accounts, no cloud, no data
    ever sent — the page runs entirely on your device (turn off the internet
    and check). Under the hood, real cryptography:
    <a href="https://age-encryption.org" target="_blank" rel="noopener">age</a>
    (X25519 + ChaCha20-Poly1305).`,
  wasmLoading: "LOADING THE MECHANISM…",
  h2Machine: "MACHINE SETTINGS",
  hintMachine: `Phrase + dials = your key. Always the same, on every device.
    Nothing to save, no account to create — just remember the settings.`,
  lblPhrase: "KEY PHRASE",
  rollPhrase: "ROLL PHRASE",
  hintPhrase: `Four random words (Polish or English) — rolling also spins the
    dials. Don't invent your own "correct horse" — the machine rolls better
    than you do. Diacritics don't matter: "żółw" and "zolw" are the same
    phrase.`,
  lblRotors: "SETTING DIALS — RATIO 1–F",
  rollRotors: "ROLL<br />DIALS",
  hintRotors: `Like the rings of an Enigma: each dial has 15 positions (1–F).
    A different setting = a completely different key.`,
  tune: "TUNE THE MACHINE",
  tuneStatus: `MILLING THE KEY<span class="cursor">█</span>`,
  lblPubkey: "YOUR PUBLIC KEY — SAFE TO SHOW ANYONE",
  copy: "COPY",
  privkeySummary: "private key (show no one)",
  hintPrivkey: `No need to store it anywhere — the machine will mill it again
    from the phrase and dials.`,
  h2Encrypt: "ENCRYPTION",
  lblRecipient: "RECIPIENT'S PUBLIC KEY",
  useOwnKey: "USE MINE",
  hintRecipient: `Sharing one phrase and dial setting? Press USE MINE — with
    the same settings tuned in, the other side holds the same key and can read
    the telegram.`,
  lblPlaintext: "MESSAGE TEXT",
  encryptBtn: "ENCRYPT",
  lblCipherOut: "CIPHERTEXT — BLOCKS OF 5",
  copyCipher: "COPY CIPHERTEXT",
  h2Decrypt: "DECRYPTION",
  hintDecrypt: `First tune the machine (station 01) to the settings the
    telegram was encrypted for. Then paste the blocks — spaces and newlines
    don't matter.`,
  lblCipherIn: "CIPHERTEXT",
  decryptBtn: "DECRYPT",
  lblPlainOut: "DECODED TEXT",
  clearAll: "BURN THE TELEGRAM — WIPE ALL FIELDS AND THE KEY",
  h2Manual: "INSTRUCTIONS FOR TWO",
  manual1: `<strong>Agree on the settings.</strong> Roll a phrase, set the
    dials. Hand them to the other side over a safe channel — ideally in
    person, whispered. Never over the channel you'll send the telegram
    through.`,
  manual2: `<strong>You both tune the machine</strong> to the same settings.
    It mills an identical key for each of you.`,
  manual3: `<strong>You encrypt</strong> (station 02, the USE MINE button) and
    send the blocks however you like — WhatsApp, SMS, a postcard. Only someone
    who knows the settings can read it.`,
  manual4: `<strong>The other side pastes the blocks</strong> into station 03
    and reads.`,
  manualVariant: `Ambitious variant: each of you rolls their <em>own</em>
    phrase and you exchange only public keys (safe to send openly). You
    encrypt to the recipient's key — only they can read it; you no longer
    can.`,
  h2Under: "WHAT HAPPENS UNDER THE HOOD",
  under1: `<strong>Phrase + dials → key.</strong> From the phrase and dial
    setting, <code>scrypt</code> (memory-hard, deliberately slow) derives an
    X25519 private key. Four random words carry ~52 bits of entropy, the
    dials add theirs — and scrypt makes guessing millions of phrases per
    second infeasible.`,
  under2: `<strong>The cipher.</strong> Real, modern
    <a href="https://github.com/FiloSottile/age" target="_blank" rel="noopener">age</a>
    encryption — X25519 + ChaCha20-Poly1305. No home-grown cryptography; only
    the interface is an Enigma.`,
  under3: `<strong>Blocks of 5.</strong> The encrypted bytes are base32-coded
    (A–Z, 2–7) and cut into classic five-character telegram groups. That's
    just packaging — without the settings the blocks are worthless.`,
  under4: `<strong>Zero server.</strong> The cryptography runs as WebAssembly
    (Go) in your browser. The page makes no network requests with your data —
    there is nowhere to send it. Check the Network tab in devtools, or turn
    off Wi-Fi.`,
  under5: `<strong>Hygiene.</strong> The phrase is the key — whoever knows it
    (and the dials) reads everything. Don't type your settings on other
    people's computers, and press BURN THE TELEGRAM when you're done.
    Changing the settings = a new key; old telegrams are read with the old
    settings.`,
  under6: `<strong>Limits.</strong> The settings are a key forever — anyone
    who learns them can also read all <em>past</em> telegrams (there is no
    forward secrecy like in Signal). The cipher guarantees nobody altered the
    text, but not who sent it — anyone with the recipient's public key can
    compose a valid telegram. Message length is also visible. For flirting —
    more than enough; for professional secrets use a messenger with real key
    exchange.`,
  footerCredits: `AGEFANCY — a fork of
    <a href="https://github.com/MarinX/agewasm" target="_blank" rel="noopener">agewasm</a>
    (Marin Basic, MIT) · cipher:
    <a href="https://github.com/FiloSottile/age" target="_blank" rel="noopener">age</a>
    (Filippo Valsorda) · code:
    <a href="https://github.com/c3z/agefancy" target="_blank" rel="noopener">github.com/c3z/agefancy</a>`,
  footerDedication: `In memory of Rejewski, Różycki and Zygalski — the
    gentlemen did it without WebAssembly.`,
};

// Placeholders (attribute text, not innerHTML).
export const EN_PLACEHOLDER = {
  passphrase: "e.g. maple crayon usher pantry",
  plaintext: "type a message…",
};

// Strings both languages need at runtime (set from JS, not markup).
export const MSG = {
  pl: {
    title: "AGEFANCY — osobista maszyna szyfrowa",
    wasmLoading: "ŁADOWANIE MECHANIZMU…",
    wasmReady: "MECHANIZM ZAŁADOWANY — GOTOWY DO PRACY",
    wasmFail: "AWARIA MECHANIZMU: ",
    lampOff: "NIE ZESTROJONA",
    lampBusy: "FREZOWANIE…",
    lampOn: (s) => `ZESTROJONA (${s}s)`,
    cipherMeta: (n) => `${n} grup po 5 znaków`,
    copied: "SKOPIOWANO ✓",
    errWasm: "Mechanizm jeszcze się ładuje — chwila.",
    errEmptyPhrase: "Pusta fraza. Wciśnij LOSUJ FRAZĘ albo wpisz umówione słowa.",
    errDerive: (e) => "Błąd frezowania klucza: " + e,
    errNoRecipient:
      "Brak klucza adresata. Zestrój maszynę i wciśnij UŻYJ MOJEGO albo wklej klucz age1… od adresata.",
    errEmptyMsg: "Pusta depesza — nie ma czego szyfrować.",
    errEncrypt: (e) => "Błąd szyfrowania: " + e,
    errNotTuned:
      "Maszyna nie jest zestrojona. Ustaw frazę i śruby w stacji 01, wciśnij ZESTRÓJ MASZYNĘ.",
    errBlocks: (e) => "Błąd odczytu bloków: " + e,
    errDecrypt: (e) =>
      "Nie da się odszyfrować. Sprawdź nastawy (fraza + śruby muszą być dokładnie te, do których szyfrowano) i czy bloki wklejone w całości. [" +
      e +
      "]",
    emptyCipher: "pusty szyfrogram",
  },
  en: {
    title: "AGEFANCY — a personal cipher machine",
    wasmLoading: "LOADING THE MECHANISM…",
    wasmReady: "MECHANISM LOADED — READY TO WORK",
    wasmFail: "MECHANISM FAILURE: ",
    lampOff: "NOT TUNED",
    lampBusy: "MILLING…",
    lampOn: (s) => `TUNED (${s}s)`,
    cipherMeta: (n) => `${n} groups of 5 characters`,
    copied: "COPIED ✓",
    errWasm: "The mechanism is still loading — one moment.",
    errEmptyPhrase: "Empty phrase. Press ROLL PHRASE or type the agreed words.",
    errDerive: (e) => "Key milling error: " + e,
    errNoRecipient:
      "No recipient key. Tune the machine and press USE MINE, or paste an age1… key from the recipient.",
    errEmptyMsg: "Empty telegram — nothing to encrypt.",
    errEncrypt: (e) => "Encryption error: " + e,
    errNotTuned:
      "The machine is not tuned. Set the phrase and dials in station 01, press TUNE THE MACHINE.",
    errBlocks: (e) => "Block reading error: " + e,
    errDecrypt: (e) =>
      "Cannot decrypt. Check the settings (phrase + dials must be exactly the ones it was encrypted for) and that you pasted all the blocks. [" +
      e +
      "]",
    emptyCipher: "empty ciphertext",
  },
};
