import { randomInt } from "node:crypto";

/** No 0/O, 1/I/L: easy to read out on a call. */
const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

function pick(alphabet: string, length: number) {
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[randomInt(alphabet.length)];
  return out;
}

/** The row id: "req_" and 20 random characters. Never shown to visitors. */
export function newRequestId() {
  return `req_${pick(ID_ALPHABET, 20)}`;
}

/** The short reference the visitor sees: "OD-" and 6 characters. Unique in the database; a clash is retried. */
export function newRef() {
  return `OD-${pick(REF_ALPHABET, 6)}`;
}

export const REQUEST_ID = /^req_[0-9a-z]{20}$/;
export const REF = /^OD-[2-9A-HJKMNP-Z]{6}$/;
