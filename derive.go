package main

import (
	"strings"
	"syscall/js"

	"filippo.io/age"
	"golang.org/x/crypto/scrypt"

	"github.com/c3z/agefancy/internal/bech32"
)

// scrypt parameters for deterministic key derivation. N=2^16 keeps the
// derivation around 1-2s in browser WASM while staying memory-hard (64 MiB).
// Changing any of these breaks compatibility with previously derived keys,
// hence the version tag in the salt.
const (
	scryptN = 1 << 16
	scryptR = 8
	scryptP = 1
)

const saltPrefix = "agefancy/v1|rotors:"

// DeriveX25519Identity deterministically derives an age X25519 identity from
// a passphrase and a rotor setting. Same inputs always produce the same
// keypair, on any device. Expected args: passphrase (string), rotors (string,
// e.g. "4A7F").
func DeriveX25519Identity(this js.Value, args []js.Value) interface{} {
	output := make(map[string]interface{})
	if len(args) != 2 {
		output["error"] = "invalid arguments. expected: passphrase, rotors"
		return output
	}
	passphrase := normalizePassphrase(args[0].String())
	rotors := strings.ToUpper(strings.TrimSpace(args[1].String()))
	if passphrase == "" {
		output["error"] = "empty passphrase"
		return output
	}
	if rotors == "" {
		output["error"] = "empty rotor setting"
		return output
	}

	seed, err := scrypt.Key([]byte(passphrase), []byte(saltPrefix+rotors), scryptN, scryptR, scryptP, 32)
	if err != nil {
		output["error"] = err.Error()
		return output
	}

	secret, err := bech32.Encode("AGE-SECRET-KEY-", seed)
	if err != nil {
		output["error"] = err.Error()
		return output
	}
	identity, err := age.ParseX25519Identity(secret)
	if err != nil {
		output["error"] = err.Error()
		return output
	}

	output["privateKey"] = identity.String()
	output["publicKey"] = identity.Recipient().String()
	return output
}

// normalizePassphrase makes derivation forgiving about case and spacing:
// "Key  Dog GREEN beret" and "key dog green beret" yield the same key.
func normalizePassphrase(s string) string {
	return strings.Join(strings.Fields(strings.ToLower(s)), " ")
}
