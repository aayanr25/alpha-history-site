// Cloudflare Pages Function — runs server-side at  /api/photos
//
// Lists the Google Drive photo folder and returns, for each image, the
// brother's initiation number (read from the file name) plus a same-origin
// image URL. The Drive API key NEVER reaches the browser — it lives only in
// this function's environment variables.
//
// Naming convention: the file name must START with the initiation number,
// e.g. "41.jpg", "41.JPG", or even "41_Josh_Saylor.jpg". Anything after the
// number is ignored. Files that don't start with a number are skipped.
//
// Required environment variables (set in Cloudflare Pages → Settings →
// Environment variables, and in .dev.vars for local `wrangler pages dev`):
//   GOOGLE_DRIVE_API_KEY  — a Google Drive API key
//   PHOTOS_FOLDER_ID      — the Drive folder ID (the part of the folder URL
//                           after ".../folders/")
//
// The folder (or each photo) must be shared "Anyone with the link → Viewer"
// so the API key can read it and the CDN can serve the images.

export async function onRequest(context) {
  const { env } = context
  const folderId = env.PHOTOS_FOLDER_ID
  const apiKey = env.GOOGLE_DRIVE_API_KEY

  if (!folderId || !apiKey) {
    return json(
      { error: 'Photos are not configured (missing PHOTOS_FOLDER_ID or GOOGLE_DRIVE_API_KEY).' },
      500,
    )
  }

  const files = []
  let pageToken
  try {
    do {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: 'nextPageToken, files(id, name)',
        pageSize: '1000',
        key: apiKey,
        supportsAllDrives: 'true',
        includeItemsFromAllDrives: 'true',
      })
      if (pageToken) params.set('pageToken', pageToken)

      const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`)
      if (!res.ok) {
        return json({ error: `Drive API error ${res.status}`, detail: await res.text() }, 502)
      }
      const data = await res.json()
      files.push(...(data.files || []))
      pageToken = data.nextPageToken
    } while (pageToken)
  } catch (err) {
    return json({ error: 'Could not reach Google Drive', detail: String(err) }, 502)
  }

  const photos = []
  for (const file of files) {
    const match = file.name.match(/^(\d+)/) // leading initiation number
    if (!match) continue
    photos.push({
      initiation_number: Number(match[1]),
      url: `/api/image?id=${file.id}&w=400`,
    })
  }

  return json(photos, 200, { 'cache-control': 'public, max-age=300' })
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  })
}
