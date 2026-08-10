/*
  MEMBER ACCESS, SERVER SIDE
  ==========================
  Until now every client passcode sat in plaintext inside app.js, which is a
  public file. Anyone could open themarketplace.co.nz/app.js and read the lot,
  including the code that unlocks the command station.

  This function moves that check off the browser entirely. The page sends a
  guess and gets back either a destination or a refusal.

  WHAT IS STORED: not the passcodes, only their SHA-256 hashes. A hash cannot
  be reversed into the code. That means even somebody with full access to the
  Netlify dashboard cannot read a client's passcode, which is a step better
  than simply hiding the codes in environment variables.

  Environment variables (Netlify, scope: functions):
    MEMBER_HASH_SOPO     -> sopo-studio/index.html
    MEMBER_HASH_PADDY    -> paddy-studio/index.html
    
  TO CHANGE OR ADD A CODE
    Generate the hash, never paste the code itself into Netlify:
      node -e "console.log(require('crypto').createHash('sha256').update('YOUR NEW CODE','utf8').digest('hex'))"
    Paste the resulting hex string as the variable value, then redeploy.
    Adding a whole new client is one extra line in ROUTES below plus one
    new variable.

  Design notes worth keeping:
    - Fails CLOSED. A variable that is missing, blank or malformed can never
      match, so a broken deploy locks people out rather than letting everyone in.
    - Comparison is constant time on fixed width digests, so response timing
      cannot be used to discover a code character by character.
    - Every rejection returns an identical body and status, so a wrong guess
      reveals nothing about which codes exist.
    - A deliberate delay on failure makes brute forcing impractical over a
      network without needing shared rate limit state between invocations.
*/

const crypto = require('crypto');

const ROUTES = [
  { env: 'MEMBER_HASH_SOPO',    path: 'sopo-studio/index.html',  unlockGate: false },
  { env: 'MEMBER_HASH_PADDY',   path: 'paddy-studio/index.html', unlockGate: false }
  ];

const FAILURE_DELAY_MS = 700;
const HEX_64 = /^[0-9a-f]{64}$/i;

function matchesHash(candidate, storedHex) {
  if (typeof storedHex !== 'string' || !HEX_64.test(storedHex.trim())) return false;
  const a = crypto.createHash('sha256').update(String(candidate), 'utf8').digest();
  const b = Buffer.from(storedHex.trim().toLowerCase(), 'hex');
  if (a.length !== b.length) return false;
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
    const parsed = JSON.parse(event.body || '{}');
    passcode = String(parsed.passcode == null ? '' : parsed.passcode).trim();
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
    if (matchesHash(passcode, process.env[route.env])) hit = route;
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
