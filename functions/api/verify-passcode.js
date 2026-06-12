// Cloudflare Pages Function — POST /api/verify-passcode
//
// Compares the submitted passcode against the BROTHERS_PASSCODE environment
// variable. A single shared chapter passcode — not per-user. The passcode never
// lives in the repo; set it in .dev.vars locally and Cloudflare env vars in prod.
//
// Design notes (kept faithful to the original, low-stakes as it is):
//   - Constant-time comparison to avoid a timing side-channel.
//   - ALWAYS returns HTTP 200 with { valid: true | false } — never leaks info via
//     status codes. Malformed JSON or a missing env var returns { valid: false }.

export async function onRequestPost(context) {
  const { request, env } = context

  let submitted = ''
  try {
    const body = await request.json()
    submitted = typeof body?.passcode === 'string' ? body.passcode : ''
  } catch {
    submitted = ''
  }

  const expected = env.BROTHERS_PASSCODE
  if (!expected) {
    console.error('BROTHERS_PASSCODE is not configured')
    return json({ valid: false })
  }

  return json({ valid: constantTimeEqual(submitted, expected) })
}

// CORS preflight.
export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

// XOR-accumulate char codes rather than using === so the comparison doesn't
// short-circuit on the first differing character (or on length).
function constantTimeEqual(a, b) {
  const aLen = a.length
  const bLen = b.length
  let diff = aLen ^ bLen
  for (let i = 0; i < aLen; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i % bLen)
  }
  return diff === 0
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', ...corsHeaders() },
  })
}
