// Cloudflare Pages Function — runs server-side at  /api/image?id=<fileId>&w=<width>
//
// Streams an image out of Google Drive back to the browser from the SAME origin,
// so the page never talks to Google directly and the Drive key is never exposed.
//
// It pulls bytes from Google's public image CDN (lh3.googleusercontent.com)
// rather than the Drive "alt=media" download endpoint on purpose: the CDN sizes
// images with the "=wN" suffix and doesn't hit Drive's bulk-download rate limits
// (which throw 403 "automated queries" errors when many images load at once).
//
// Responses are cached hard at Cloudflare's edge so repeat views are instant.

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const wParam = url.searchParams.get('w') || '400'

  // Validate inputs — Drive file IDs are letters, numbers, '-' and '_'.
  if (!id || !/^[\w-]+$/.test(id)) {
    return new Response('Bad or missing id', { status: 400 })
  }
  const width = /^\d+$/.test(wParam) ? wParam : '400'

  const upstream = `https://lh3.googleusercontent.com/d/${id}=w${width}`
  const res = await fetch(upstream, {
    cf: { cacheTtl: 86400, cacheEverything: true },
  })

  if (!res.ok) {
    return new Response('Image not found', { status: res.status })
  }

  const headers = new Headers(res.headers)
  headers.set('cache-control', 'public, max-age=86400')
  return new Response(res.body, { status: 200, headers })
}
