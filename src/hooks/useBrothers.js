import { useState, useEffect } from 'react'

// Single source of truth for member data. The Cloudflare Worker proxies the
// chapter's Notion database and returns an array of profile objects shaped like:
//   { initiation_number, first_name, last_name, nickname, pledge_class,
//     graduation_year, major, hometown, big_initiation_number, roles, bio,
//     photo_url }
// `big_initiation_number` points at another profile's `initiation_number`
// (null for founders); `photo_url` is a full URL or null.
const PROFILES_URL =
  'https://aet-notion-worker.secretary-purduechipsi.workers.dev/api/profiles'

// Module-level cache so the data is fetched once per page load and shared
// across every component — navigating between pages does not re-fetch.
let brothersCache = null
let byNumberCache = null
let fetchPromise = null

function buildByNumber(list) {
  const map = new Map()
  for (const b of list) {
    map.set(b.initiation_number, b)
  }
  return map
}

function fetchBrothers() {
  if (!fetchPromise) {
    fetchPromise = fetch(PROFILES_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then(data => {
        const list = Array.isArray(data) ? data : []
        brothersCache = list
        byNumberCache = buildByNumber(list)
        return list
      })
      .catch(err => {
        // Reset so a later mount can retry after a failure.
        fetchPromise = null
        throw err
      })
  }
  return fetchPromise
}

export function useBrothers() {
  const [brothers, setBrothers] = useState(brothersCache ?? [])
  const [loading, setLoading] = useState(!brothersCache)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (brothersCache) return

    let cancelled = false
    fetchBrothers()
      .then(data => {
        if (!cancelled) {
          setBrothers(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  // O(1) lookups by initiation_number. Reuse the cached map once data has
  // loaded; otherwise derive one from whatever is in state.
  const brothersByNumber = byNumberCache ?? buildByNumber(brothers)

  return { brothers, brothersByNumber, loading, error }
}

export function useBrother(initiationNumber) {
  const { brothersByNumber, loading, error } = useBrothers()
  const brother =
    initiationNumber != null
      ? brothersByNumber.get(Number(initiationNumber)) ?? null
      : null
  return { brother, loading, error }
}
