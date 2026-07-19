import "@fontsource/archivo-black/latin-400.css";
import "@fontsource/archivo-black/latin-ext-400.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-ext-400.css";
import "@fontsource/ibm-plex-mono/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-ext-700.css";
import "./style.css";

import "../vendor/wasm_exec.js";
import ageWasmUrl from "../vendor/age.wasm?url";
import { WORDS as WORDS_EN } from "./wordlist-en.js";
import { WORDS as WORDS_PL } from "./wordlist-pl.js";
import { EN_HTML, EN_PLACEHOLDER, MSG } from "./i18n.js";

// ---------- UI language ----------
// Polish lives in the markup; we snapshot it at startup and overlay English
// from the dictionary. Language never enters the crypto.

const I18N_NODES = [...document.querySelectorAll("[data-i18n]")];
const PL_HTML = new Map(I18N_NODES.map((el) => [el, el.innerHTML]));
const PH_NODES = [...document.querySelectorAll("[data-i18n-ph]")];
const PL_PLACEHOLDER = new Map(PH_NODES.map((el) => [el, el.placeholder]));

let uiLang = localStorage.getItem("agefancy-lang") === "en" ? "en" : "pl";

function msg(key, ...args) {
  const v = MSG[uiLang][key];
  return typeof v === "function" ? v(...args) : v;
}

// ---------- WASM boot ----------

let wasmReady = false;
let wasmError = "";
const wasmStatus = document.getElementById("wasmStatus");

function renderWasmStatus() {
  if (wasmError) {
    wasmStatus.textContent = msg("wasmFail") + wasmError;
  } else if (wasmReady) {
    wasmStatus.textContent = msg("wasmReady");
  } else {
    wasmStatus.textContent = msg("wasmLoading");
  }
}

const go = new Go();
WebAssembly.instantiateStreaming(fetch(ageWasmUrl), go.importObject)
  .then((result) => {
    go.run(result.instance);
    wasmReady = true;
    wasmStatus.classList.add("ready");
    renderWasmStatus();
  })
  .catch((err) => {
    wasmError = String(err);
    renderWasmStatus();
  });

// ---------- base32 telegram blocks ----------
// RFC 4648 alphabet (A-Z, 2-7), no padding, grouped in classic 5-char blocks.

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// The age binary format opens with a constant textual header. Stripping it
// before encoding makes every telegram start with random-looking blocks
// (and saves 6 groups). Re-attached on decode. Cosmetic only — security
// comes from the cipher, not from hiding the format.
const AGE_HEADER = new TextEncoder().encode("age-encryption.org/v1\n-> X25519 ");

function stripAgeHeader(bytes) {
  if (bytes.length > AGE_HEADER.length) {
    for (let i = 0; i < AGE_HEADER.length; i++) {
      if (bytes[i] !== AGE_HEADER[i]) return bytes;
    }
    return bytes.subarray(AGE_HEADER.length);
  }
  return bytes;
}

function prependAgeHeader(bytes) {
  const out = new Uint8Array(AGE_HEADER.length + bytes.length);
  out.set(AGE_HEADER, 0);
  out.set(bytes, AGE_HEADER.length);
  return out;
}

function bytesToBlocks(bytes) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += B32[(value << (5 - bits)) & 31];
  }
  // 5-char groups, 5 groups per line — the telegram look.
  const groups = out.match(/.{1,5}/g) || [];
  const lines = [];
  for (let i = 0; i < groups.length; i += 5) {
    lines.push(groups.slice(i, i + 5).join(" "));
  }
  return lines.join("\n");
}

function blocksToBytes(text) {
  const clean = text.toUpperCase().replace(/[^A-Z2-7]/g, "");
  if (clean.length === 0) {
    throw new Error(msg("emptyCipher"));
  }
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

// ---------- passphrase & rotors ----------

function randomInt(maxExclusive) {
  // rejection sampling — no modulo bias
  const limit = Math.floor(65536 / maxExclusive) * maxExclusive;
  const buf = new Uint16Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % maxExclusive;
}

const ROTOR_POSITIONS = "123456789ABCDEF"; // 1..F, 15 positions, jak w zamówieniu

const rotorValues = [0, 0, 0, 0]; // indices into ROTOR_POSITIONS

// The four rotor widgets differ only by index — generate them instead of
// repeating the markup in HTML (the app is inert without JS anyway).
const rotorBank = document.querySelector(".rotor-bank");
const rollRotorsBtn = document.getElementById("rollRotors");
["I", "II", "III", "IV"].forEach((label, i) => {
  const rotor = document.createElement("div");
  rotor.className = "rotor";
  rotor.dataset.rotor = i;
  rotor.innerHTML = `
    <button class="rotor-up" type="button" aria-label="śruba ${label} w górę">▲</button>
    <div class="rotor-window"><span class="rotor-value">${ROTOR_POSITIONS[rotorValues[i]]}</span></div>
    <button class="rotor-down" type="button" aria-label="śruba ${label} w dół">▼</button>
    <div class="rotor-label">${label}</div>`;
  rotorBank.insertBefore(rotor, rollRotorsBtn);
});

function renderRotor(i) {
  const el = document.querySelector(`.rotor[data-rotor="${i}"] .rotor-value`);
  el.textContent = ROTOR_POSITIONS[rotorValues[i]];
  el.classList.remove("spun");
  void el.offsetWidth; // restart animation
  el.classList.add("spun");
}

function rotorString() {
  return rotorValues.map((v) => ROTOR_POSITIONS[v]).join("");
}

document.querySelectorAll(".rotor").forEach((rotor) => {
  const i = Number(rotor.dataset.rotor);
  rotor.querySelector(".rotor-up").addEventListener("click", () => {
    rotorValues[i] = (rotorValues[i] + 1) % ROTOR_POSITIONS.length;
    renderRotor(i);
    machineDetuned();
  });
  rotor.querySelector(".rotor-down").addEventListener("click", () => {
    rotorValues[i] =
      (rotorValues[i] + ROTOR_POSITIONS.length - 1) % ROTOR_POSITIONS.length;
    renderRotor(i);
    machineDetuned();
  });
});

function rollRotors() {
  for (let i = 0; i < 4; i++) {
    rotorValues[i] = randomInt(ROTOR_POSITIONS.length);
    renderRotor(i);
  }
}

rollRotorsBtn.addEventListener("click", () => {
  rollRotors();
  machineDetuned();
});

// Language only affects the phrase generator — the key is derived from the
// literal words, so PL/EN never enters the crypto.
let wordlist = WORDS_PL;
const langButtons = { pl: document.getElementById("langPl"), en: document.getElementById("langEn") };
function setLang(lang) {
  wordlist = lang === "pl" ? WORDS_PL : WORDS_EN;
  for (const [key, btn] of Object.entries(langButtons)) {
    btn.classList.toggle("active", key === lang);
    btn.setAttribute("aria-pressed", key === lang);
  }
}
langButtons.pl.addEventListener("click", () => setLang("pl"));
langButtons.en.addEventListener("click", () => setLang("en"));

// Rolling the phrase rolls the rotors too — otherwise everyone leaves them
// at 1-1-1-1 and the advertised rotor entropy is fiction.
document.getElementById("rollPhrase").addEventListener("click", () => {
  const words = [];
  for (let i = 0; i < 4; i++) {
    words.push(wordlist[randomInt(wordlist.length)]);
  }
  document.getElementById("passphrase").value = words.join(" ");
  rollRotors();
  machineDetuned();
});

document.getElementById("passphrase").addEventListener("input", machineDetuned);

// ---------- machine state ----------

let identity = null; // { privateKey, publicKey }
let machineState = "off"; // "off" | "busy" | "on"
let lastTuneSec = "";

const lamp = document.getElementById("machineLamp");
const keyPanel = document.getElementById("keyPanel");
const useOwnKey = document.getElementById("useOwnKey");

function renderLamp() {
  if (machineState === "on") {
    lamp.textContent = msg("lampOn", lastTuneSec);
    lamp.className = "lamp lamp-on";
  } else if (machineState === "busy") {
    lamp.textContent = msg("lampBusy");
    lamp.className = "lamp lamp-busy";
  } else {
    lamp.textContent = msg("lampOff");
    lamp.className = "lamp lamp-off";
  }
}

function machineDetuned() {
  identity = null;
  machineState = "off";
  renderLamp();
  keyPanel.hidden = true;
  useOwnKey.disabled = true;
  // The panel is hidden but its fields would keep the old key material —
  // don't leave derived secrets lying around in the DOM.
  document.getElementById("pubkey").value = "";
  document.getElementById("privkey").value = "";
}

document.getElementById("clearAll").addEventListener("click", () => {
  for (const id of [
    "passphrase",
    "recipient",
    "plaintext",
    "cipherOut",
    "cipherIn",
    "plainOut",
  ]) {
    document.getElementById(id).value = "";
  }
  rotorValues.fill(0);
  for (let i = 0; i < 4; i++) renderRotor(i);
  document.getElementById("cipherPanel").hidden = true;
  document.getElementById("plainPanel").hidden = true;
  hideError();
  machineDetuned();
});

function requireWasm() {
  if (!wasmReady) {
    showError(msg("errWasm"));
    return false;
  }
  return true;
}

// ---------- UI language switch ----------

const uiLangButtons = {
  pl: document.getElementById("uiPl"),
  en: document.getElementById("uiEn"),
};

function setUiLang(lang) {
  uiLang = lang;
  localStorage.setItem("agefancy-lang", lang);
  document.documentElement.lang = lang;
  document.title = msg("title");
  for (const el of I18N_NODES) {
    el.innerHTML =
      lang === "pl"
        ? PL_HTML.get(el)
        : (EN_HTML[el.dataset.i18n] ?? PL_HTML.get(el));
  }
  for (const el of PH_NODES) {
    el.placeholder =
      lang === "pl"
        ? PL_PLACEHOLDER.get(el)
        : (EN_PLACEHOLDER[el.dataset.i18nPh] ?? PL_PLACEHOLDER.get(el));
  }
  for (const [key, btn] of Object.entries(uiLangButtons)) {
    btn.classList.toggle("active", key === lang);
    btn.setAttribute("aria-pressed", key === lang);
  }
  setLang(lang); // sensible default: UI language also picks the wordlist
  renderLamp();
  renderWasmStatus();
}

uiLangButtons.pl.addEventListener("click", () => setUiLang("pl"));
uiLangButtons.en.addEventListener("click", () => setUiLang("en"));
if (uiLang === "en") setUiLang("en");

document.getElementById("tune").addEventListener("click", () => {
  hideError();
  if (!requireWasm()) return;
  const phrase = document.getElementById("passphrase").value.trim();
  if (!phrase) {
    return showError(msg("errEmptyPhrase"));
  }
  const tuneBtn = document.getElementById("tune");
  const tuneStatus = document.getElementById("tuneStatus");
  tuneBtn.disabled = true;
  tuneStatus.hidden = false;
  machineState = "busy";
  renderLamp();

  // scrypt is heavy and synchronous — let the UI paint first.
  setTimeout(() => {
    const t0 = performance.now();
    const result = deriveX25519Identity(phrase, rotorString());
    const ms = Math.round(performance.now() - t0);
    tuneBtn.disabled = false;
    tuneStatus.hidden = true;
    if (result.error) {
      machineDetuned();
      return showError(msg("errDerive", result.error));
    }
    identity = result;
    document.getElementById("pubkey").value = identity.publicKey;
    document.getElementById("privkey").value = identity.privateKey;
    keyPanel.hidden = false;
    useOwnKey.disabled = false;
    machineState = "on";
    lastTuneSec = (ms / 1000).toFixed(1);
    renderLamp();
  }, 60);
});

// ---------- encrypt ----------

useOwnKey.addEventListener("click", () => {
  if (identity) {
    document.getElementById("recipient").value = identity.publicKey;
  }
});

document.getElementById("encryptBtn").addEventListener("click", () => {
  hideError();
  if (!requireWasm()) return;
  const recipient = document.getElementById("recipient").value.trim();
  const message = document.getElementById("plaintext").value;
  if (!recipient) {
    return showError(msg("errNoRecipient"));
  }
  if (!message) {
    return showError(msg("errEmptyMsg"));
  }
  const bytes = new TextEncoder().encode(message);
  const result = encryptBinary(recipient, bytes);
  if (typeof result === "string") {
    return showError(msg("errEncrypt", result));
  }
  const blocks = bytesToBlocks(stripAgeHeader(result));
  document.getElementById("cipherOut").value = blocks;
  document.getElementById("cipherPanel").hidden = false;
  const groups = blocks.split(/\s+/).length;
  document.getElementById("cipherMeta").textContent = msg("cipherMeta", groups);
});

// ---------- decrypt ----------

document.getElementById("decryptBtn").addEventListener("click", () => {
  hideError();
  if (!requireWasm()) return;
  if (!identity) {
    return showError(msg("errNotTuned"));
  }
  let bytes;
  try {
    bytes = blocksToBytes(document.getElementById("cipherIn").value);
  } catch (e) {
    return showError(msg("errBlocks", e.message));
  }
  // Header was stripped during encoding; try with it first, raw as fallback
  // (so telegrams from stock age tools decode too).
  let result = decryptBinary(identity.privateKey, prependAgeHeader(bytes));
  if (typeof result === "string") {
    result = decryptBinary(identity.privateKey, bytes);
  }
  if (typeof result === "string") {
    return showError(msg("errDecrypt", result));
  }
  document.getElementById("plainOut").value = new TextDecoder().decode(result);
  document.getElementById("plainPanel").hidden = false;
});

// ---------- clipboard ----------

function wireCopy(btnId, sourceId) {
  const btn = document.getElementById(btnId);
  btn.addEventListener("click", async () => {
    const text = document.getElementById(sourceId).value;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    const old = btn.textContent;
    btn.textContent = msg("copied");
    setTimeout(() => (btn.textContent = old), 1400);
  });
}
wireCopy("copyPubkey", "pubkey");
wireCopy("copyCipher", "cipherOut");

// ---------- errors ----------

const errorBox = document.getElementById("errorBox");
function showError(msg) {
  errorBox.textContent = "⚠ " + msg;
  errorBox.hidden = false;
  errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function hideError() {
  errorBox.hidden = true;
}
