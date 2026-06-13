import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBrothers } from '../hooks/useBrothers'
import './Brothers.css'

function initials(brother) {
  return `${brother.first_name?.[0] ?? ''}${brother.last_name?.[0] ?? ''}`
}

// Name fields are matched first (higher priority); the rest of a profile's
// personal info is searched too but ranks below any name hit.
const NAME_FIELDS = ['first_name', 'last_name', 'nickname']
const INFO_FIELDS = [
  'pledge_class',
  'graduation_year',
  'major',
  'hometown',
  'roles',
  'bio',
]

function fieldText(value) {
  if (value == null) return ''
  return (Array.isArray(value) ? value.join(' ') : String(value)).toLowerCase()
}

function matchRank(brother, query) {
  const fullName = `${brother.first_name ?? ''} ${brother.last_name ?? ''}`.toLowerCase()
  if (fullName.includes(query)) return 0
  if (NAME_FIELDS.some(f => fieldText(brother[f]).includes(query))) return 1
  if (INFO_FIELDS.some(f => fieldText(brother[f]).includes(query))) return 2
  return -1
}

export default function Brothers() {
  const { brothers, loading, error } = useBrothers()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  // Rank is the initiation order — lower number means earlier (higher rank).
  const ranked = useMemo(
    () => [...brothers].sort((a, b) => a.initiation_number - b.initiation_number),
    [brothers]
  )

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return ranked
      .map(b => ({ brother: b, priority: matchRank(b, q) }))
      .filter(m => m.priority >= 0)
      // Name matches first, then by rank within each priority tier.
      .sort(
        (a, b) =>
          a.priority - b.priority ||
          a.brother.initiation_number - b.brother.initiation_number
      )
      .map(m => m.brother)
  }, [ranked, query])

  return (
    <div className="brothers-page">
      <div className="brothers-top">
      <div className="brothers-search">
        <input
          type="text"
          className="brothers-search-input"
          placeholder="Search by name, major, hometown…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search brothers"
        />
        {suggestions.length > 0 && (
          <ul className="brothers-suggestions">
            {suggestions.map(b => (
              <li key={b.initiation_number}>
                <button
                  type="button"
                  className="brothers-suggestion"
                  onClick={() => navigate(`/brothers/${b.initiation_number}`)}
                >
                  <span className="brothers-suggestion-name">
                    {b.first_name} {b.last_name}
                  </span>
                  <span className="brothers-suggestion-meta">
                    #{b.initiation_number}
                    {b.pledge_class ? ` · ${b.pledge_class}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="brothers-header">
        <h1 className="brothers-title">Brothers</h1>
        <p className="brothers-subtitle">
          Every brother ever· Click any face to view profile
        </p>
      </div>
      </div>

      {loading && <p className="brothers-state-msg">Loading...</p>}
      {error && (
        <p className="brothers-state-msg brothers-state-error">
          Could not load member data. Please try again.
        </p>
      )}

      {!loading && !error && (
        <div className="brothers-grid">
          {ranked.map(brother => (
            <Link
              key={brother.initiation_number}
              to={`/brothers/${brother.initiation_number}`}
              className="brothers-thumb"
              title={`${brother.first_name} ${brother.last_name}`}
            >
              {brother.photo_url ? (
                <img
                  src={brother.photo_url}
                  alt={`${brother.first_name} ${brother.last_name}`}
                  className="brothers-thumb-img"
                />
              ) : (
                <div
                  className="brothers-thumb-img brothers-thumb-placeholder"
                  aria-hidden="true"
                >
                  {initials(brother)}
                </div>
              )}
              <span className="brothers-thumb-rank">#{brother.initiation_number}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
