import React, { useEffect, useState } from 'react'
import './Timeline.css'

// Timeline entries come from a Google Sheet, proxied server-side by the
// /api/timeline Pages Function (which keeps the Google API key off the browser
// and returns entries already sorted OLDEST → NEWEST by sort_date). Each entry
// is shaped like:
//   { order, date_label, sort_date, title, description, author }
// `date_label` is what we DISPLAY; `sort_date` drives the ordering; `author`
// is passed through for a future link to a brother profile page.
export default function Timeline() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/timeline')
      .then(res => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then(data => {
        if (cancelled) return
        // Defensive re-sort in case the endpoint ever returns unsorted data.
        const list = (Array.isArray(data) ? data : [])
          .slice()
          .sort((a, b) => {
            const ta = Date.parse(a.sort_date)
            const tb = Date.parse(b.sort_date)
            return (Number.isNaN(ta) ? Infinity : ta) - (Number.isNaN(tb) ? Infinity : tb)
          })
        setEvents(list)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1 className="timeline-title">Our History</h1>
        <p className="timeline-subtitle">Alpha Epsilon Tau · Chi Psi · Purdue University</p>
      </div>

      <div className="timeline-container">
        {loading && <p className="timeline-state-msg">Loading...</p>}
        {error && (
          <p className="timeline-state-msg timeline-state-error">
            Could not load the timeline: {error}
          </p>
        )}
        {!loading && !error && events.length === 0 && (
          <p className="timeline-state-msg">No timeline entries yet.</p>
        )}

        {!loading && !error &&
          events.map((event, index) => (
            <div
              key={index}
              className={`timeline-entry ${index % 2 === 0 ? 'entry-left' : 'entry-right'}`}
            >
              <div className="timeline-card">
                <span className="timeline-date">{event.date_label}</span>
                <h2 className="timeline-event-title">{event.title}</h2>
                <p className="timeline-description">{event.description}</p>
                {event.author && (
                  <p className="timeline-author">by {event.author}</p>
                )}
              </div>
              <div className="timeline-node" />
            </div>
          ))}

        {!loading && !error && events.length > 0 && <div className="timeline-line" />}
      </div>
    </div>
  )
}
