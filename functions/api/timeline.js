// Cloudflare Pages Function — runs server-side at  /api/timeline
//
// Reads the chapter history from a Google Sheet and returns the entries as
// JSON, sorted OLDEST → NEWEST by `sort_date`. The Google API key NEVER reaches
// the browser — it lives only in this function's environment variables.
//
// The sheet's first row is treated as a HEADER row; columns are matched by name
// (case-insensitive), so the column order can change without breaking this code.
// Expected headers:
//   order        — integer, kept for reference (not used for sorting)
//   date_label   — string shown on the timeline, e.g. "Fall 2023"
//   sort_date    — ISO date used ONLY for sorting, e.g. "2023-11-01"
//   title        — short string
//   description  — paragraph string
//   author       — name of who wrote the entry (passed through, not yet rendered)
//
// Required environment variables (set in Cloudflare Pages → Settings →
// Environment variables, and in .dev.vars for local `wrangler pages dev`):
//   GOOGLE_SHEET_ID       — the spreadsheet ID (the part of the sheet URL
//                           between "/d/" and "/edit")
//   GOOGLE_DRIVE_API_KEY  — reused from the photos function; the same key works
//                           as long as the "Google Sheets API" is enabled on its
//                           Cloud project. (A dedicated GOOGLE_SHEETS_API_KEY is
//                           also honored if you prefer to set one.)
// Optional:
//   TIMELINE_SHEET_RANGE  — A1 range to read, default "Timeline!A1:F1000".
//                           Change this if your tab isn't named "Timeline".
//
// The sheet must be shared "Anyone with the link → Viewer" so the API key can
// read it (same rule as the Drive photo folder).

export async function onRequest(context) {
  const { env } = context
  const sheetId = env.GOOGLE_SHEET_ID
  const apiKey = env.GOOGLE_SHEETS_API_KEY || env.GOOGLE_DRIVE_API_KEY
  const range = env.TIMELINE_SHEET_RANGE || 'Timeline!A1:F1000'

  if (!sheetId || !apiKey) {
    return json(
      { error: 'Timeline is not configured (missing GOOGLE_SHEET_ID or a Google API key).' },
      500,
    )
  }

  let rows
  try {
    const params = new URLSearchParams({ key: apiKey, majorDimension: 'ROWS' })
    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
      `/values/${encodeURIComponent(range)}?${params}`

    const res = await fetch(url)
    if (!res.ok) {
      return json({ error: `Sheets API error ${res.status}`, detail: await res.text() }, 502)
    }
    const data = await res.json()
    rows = data.values || []
  } catch (err) {
    return json({ error: 'Could not reach Google Sheets', detail: String(err) }, 502)
  }

  if (rows.length < 2) {
    // Header only (or empty) — nothing to show, but not an error.
    return json([], 200, { 'cache-control': 'public, max-age=300' })
  }

  // Map header names → column index so column order doesn't matter.
  const header = rows[0].map(h => String(h || '').trim().toLowerCase())
  const col = name => header.indexOf(name)
  const idx = {
    order: col('order'),
    date_label: col('date_label'),
    sort_date: col('sort_date'),
    title: col('title'),
    description: col('description'),
    author: col('author'),
  }

  const cell = (row, i) => (i >= 0 && row[i] != null ? String(row[i]).trim() : '')

  const entries = []
  for (const row of rows.slice(1)) {
    const date_label = cell(row, idx.date_label)
    const title = cell(row, idx.title)
    // Skip blank/spacer rows (nothing meaningful to display).
    if (!date_label && !title) continue

    const orderRaw = cell(row, idx.order)
    entries.push({
      order: orderRaw === '' ? null : Number(orderRaw),
      date_label,
      sort_date: cell(row, idx.sort_date),
      title,
      description: cell(row, idx.description),
      // Kept in the data model for a future link to a brother profile page.
      author: cell(row, idx.author),
    })
  }

  // Sort chronologically OLDEST → NEWEST by sort_date. Entries with a missing or
  // unparseable sort_date sink to the end but keep their relative order.
  entries.sort((a, b) => {
    const ta = Date.parse(a.sort_date)
    const tb = Date.parse(b.sort_date)
    const va = Number.isNaN(ta) ? Infinity : ta
    const vb = Number.isNaN(tb) ? Infinity : tb
    return va - vb
  })

  return json(entries, 200, { 'cache-control': 'public, max-age=300' })
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  })
}
