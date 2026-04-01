import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Map Supabase snake_case columns to camelCase for component compatibility
function normalize(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    pledgeClass: row.pledge_class,
    initiationNumber: row.initiation_number,
    graduationYear: row.graduation_year,
    bigBrotherId: row.big_brother_id,
    bio: row.bio,
    profilePhotoUrl: row.profile_photo_url,
    hometown: row.hometown,
    major: row.major,
    employer: row.employer,
    jobTitle: row.job_title,
    industry: row.industry,
    linkedinUrl: row.linkedin_url,
    currentLocation: row.current_location,
    userId: row.user_id,
  }
}

// Module-level cache so data is fetched once per page load
// and shared across all components without a context provider
let brothersCache = null
let fetchPromise = null

function fetchBrothers() {
  if (!fetchPromise) {
    fetchPromise = supabase
      .from('brothers')
      .select('*')
      .order('initiation_number')
      .then(({ data, error }) => {
        if (error) {
          // Reset so retries are possible after failures
          fetchPromise = null
          throw error
        }
        brothersCache = data.map(normalize)
        return brothersCache
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

  return { brothers, loading, error }
}

export function useBrother(id) {
  const { brothers, loading, error } = useBrothers()
  const brother = id ? brothers.find(b => b.id === id) ?? null : null
  return { brother, loading, error }
}
