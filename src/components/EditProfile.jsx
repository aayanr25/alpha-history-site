import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './EditProfile.css'

const EDITABLE_FIELDS = [
  { key: 'employer',         label: 'Employer',          type: 'text' },
  { key: 'job_title',        label: 'Job Title',         type: 'text' },
  { key: 'industry',         label: 'Industry',          type: 'text' },
  { key: 'linkedin_url',     label: 'LinkedIn URL',      type: 'url'  },
  { key: 'current_location', label: 'Current Location',  type: 'text' },
]

const EMPTY_FORM = {
  employer: '',
  job_title: '',
  industry: '',
  linkedin_url: '',
  current_location: '',
  bio: '',
}

export default function EditProfile() {
  const { user, loading: authLoading } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setFetchLoading(false)
      return
    }

    supabase
      .from('brothers')
      .select('employer, job_title, industry, linkedin_url, current_location, bio')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError && fetchError.code !== 'PGRST116') {
          setError(fetchError.message)
        } else if (data) {
          setForm({
            employer: data.employer ?? '',
            job_title: data.job_title ?? '',
            industry: data.industry ?? '',
            linkedin_url: data.linkedin_url ?? '',
            current_location: data.current_location ?? '',
            bio: data.bio ?? '',
          })
        }
        setFetchLoading(false)
      })
  }, [user, authLoading])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error: saveError } = await supabase
      .from('brothers')
      .update({
        employer:         form.employer || null,
        job_title:        form.job_title || null,
        industry:         form.industry || null,
        linkedin_url:     form.linkedin_url || null,
        current_location: form.current_location || null,
        bio:              form.bio || null,
      })
      .eq('user_id', user.id)

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
    } else {
      setSuccess(true)
    }
  }

  if (authLoading || fetchLoading) {
    return (
      <div className="edit-profile-wrap">
        <p className="edit-profile-loading">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="edit-profile-wrap">
        <p className="edit-profile-notice">Sign in to edit your profile.</p>
      </div>
    )
  }

  return (
    <div className="edit-profile-wrap">
      <h2 className="edit-profile-title">Edit Profile</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        {EDITABLE_FIELDS.map(({ key, label, type }) => (
          <div className="edit-field" key={key}>
            <label className="edit-label" htmlFor={key}>{label}</label>
            <input
              id={key}
              name={key}
              type={type}
              className="edit-input"
              value={form[key]}
              onChange={handleChange}
              placeholder={label}
            />
          </div>
        ))}

        <div className="edit-field">
          <label className="edit-label" htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            className="edit-input edit-textarea"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell your brothers about yourself"
            rows={5}
          />
        </div>

        {error && <p className="edit-error">{error}</p>}
        {success && <p className="edit-success">Profile updated!</p>}

        <button className="edit-submit" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
