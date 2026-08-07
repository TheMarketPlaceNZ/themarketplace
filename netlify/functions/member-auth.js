/*
  MEMBER ACCESS, SERVER SIDE
  ==========================
  Until now every client passcode sat in plaintext inside app.js, which is a
  public file. Anyone could open themarketplace.co.nz/app.js and read the lot,
  including the code that unlocks the command station.

  This function moves that check off the browser entirely. The page now sends
  a guess and gets back either a destination or a refusal. The real codes live
  only in Netlify's encrypted environment variables and are never served to
  anyone.

  Environment variables (Netlify, scope: functions, marked secret):
    MEMBER_CODE_SOPO     -> sopo-studio/index.html
    MEMBER_CODE_PADDY    -> paddy-studio/index.html
    MEMBER_CODE_COMMAND  -> command_station.html   (also unlocks the Jarvis gate)

  Adding a client later is two lines here plus one new variable. No code change
  ever needs to ship to the browser again.

  Design notes worth keeping:
    - Fails CLOSED. A variable that is missing or blank can never match, so a
      misconfigured deploy locks people out rather than letting everyone in.
    - Comparison is length independent and constant time, so response timing
      cannot be used to discover a code character by character.
    - Every rejection takes the same visible path and returns the same body,
      so a wrong code reveals nothing about which codes exist.
    - A deliberate delay on failure makes brute forcing impractical over a
      network without needing shared rate limit state.
*/

const crypto = require('crypto');

const ROUTES = [
  { env: 'MEMBER_CODE_SOPO',    path: 'sopo-studio/index.html',  unlockGate: false },
  { env: 'MEMBER_CODE_PADDY',   path: 'paddy-studio/index.html', unlockGate: false },
  { env: 'MEMBER_CODE_COMMAND', path: 'command_station.html',    unlockGate: true  }
];

const FAILURE_DELAY_MS = 700;

/* Hash both sides to a fixed width first, so timingSafeEqual never throws on a
   length mismatch and the comparison cost does not depend on the input. */
function matches(candidate, secret) {
  if (typeof secret !== 'string' || secret.length === 0) return false;
  const a = crypto.createHash('sha256').update(String(candidate), 'utf8').digest();
  const b = crypto.createHash('sha256').update(secret, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

const DENY = { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ ok: false }) };

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ ok: false }) };
  }

  let passcode = '';
  try {
    passcode = String((JSON.parse(event.body || '{}').passcode ?? '')).trim();
  } catch (e) {
    passcode = '';
  }

  if (!passcode || passcode.length > 200) {
    await sleep(FAILURE_DELAY_MS);
    return DENY;
  }

  /* Check every route rather than returning on the first hit, so the work done
     is identical whichever code was supplied. */
  let hit = null;
  for (const route of ROUTES) {
    if (matches(passcode, process.env[route.env])) hit = route;
  }

  if (!hit) {
    await sleep(FAILURE_DELAY_MS);
    return DENY;
  }

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ ok: true, path: hit.path, unlockGate: hit.unlockGate })
  };
};
