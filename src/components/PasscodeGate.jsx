import { useState, useEffect, useRef } from 'react'
import './PasscodeGate.css'

// Session (not local) storage: the gate survives reloads/navigation but clears
// when the tab/browser closes. The value is just a truthy marker; there are no
// accounts, tokens, or cookies — the real check happens server-side.
const SESSION_KEY = 'aet_brothers_auth'

function readAuth() {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export default function PasscodeGate({ children }) {
  const [authed, setAuthed] = useState(() => Boolean(readAuth()))
  const [passcode, setPasscode] = useState('')
  const [err, setErr] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!authed) inputRef.current?.focus()
  }, [authed])

  // Already authenticated for this browser session — render the site.
  if (authed) return children

  async function handleSubmit(e) {
    e.preventDefault()
    setErr(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      const data = await res.json().catch(() => ({ valid: false }))

      if (data.valid) {
        try {
          sessionStorage.setItem(SESSION_KEY, '1')
        } catch {
          // Storage blocked (e.g. private mode) — still let them in for this view.
        }
        setAuthed(true)
      } else {
        setErr('Incorrect passcode')
        setPasscode('')
        inputRef.current?.focus()
      }
    } catch {
      setErr('Could not verify passcode. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="gate-page">
      <div className="gate-card">
        <h1 className="gate-title">Alpha Epsilon Tau</h1>
        <p className="gate-subtitle">Enter the Alpha passcode to continue</p>

        <form className="gate-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            className="gate-input"
            placeholder="Passcode"
            value={passcode}
            onChange={e => {
              setPasscode(e.target.value)
              setErr(null)
            }}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit" className="gate-btn" disabled={submitting}>
            {submitting ? 'Checking…' : 'Enter'}
          </button>
          {err && <p className="gate-error">{err}</p>}
        </form>
      </div>
    </div>
  )
}
