import { useParams, Link } from 'react-router-dom'
import { useBrothers } from '../hooks/useBrothers'
import BrotherLink from '../components/BrotherLink'
import './BrotherProfile.css'

function getAncestors(brother, brothersByNumber) {
  const chain = []
  let current = brother
  while (current.big_initiation_number) {
    const big = brothersByNumber.get(current.big_initiation_number)
    if (!big) break
    chain.unshift(big)
    current = big
  }
  return chain
}

function initials(brother) {
  return `${brother.first_name?.[0] ?? ''}${brother.last_name?.[0] ?? ''}`
}

export default function BrotherProfile() {
  const { id } = useParams()
  const { brothers, brothersByNumber, loading, error } = useBrothers()

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-not-found">
          <p className="profile-loading">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-not-found">
          <p className="profile-error">Could not load member data. Please try again.</p>
          <Link to="/family-tree" className="profile-back-link">← Back to Family Tree</Link>
        </div>
      </div>
    )
  }

  const brother = brothersByNumber.get(Number(id))

  if (!brother) {
    return (
      <div className="profile-page">
        <div className="profile-not-found">
          <h2>Brother not found.</h2>
          <Link to="/family-tree" className="profile-back-link">← Back to Family Tree</Link>
        </div>
      </div>
    )
  }

  const littles = brothers.filter(b => b.big_initiation_number === brother.initiation_number)
  const pledgeClassMates = brothers.filter(
    b => b.pledge_class === brother.pledge_class && b.initiation_number !== brother.initiation_number
  )
  const ancestors = getAncestors(brother, brothersByNumber)
  const isFounder = !brother.big_initiation_number
  const bigBrother = brother.big_initiation_number
    ? brothersByNumber.get(brother.big_initiation_number)
    : null

  const qFlag = brother.initiation_number === 78

  const mNode = brother.photo_url ? (
    <img
      src={brother.photo_url}
      alt={`${brother.first_name} ${brother.last_name}`}
      className="profile-photo"
    />
  ) : (
    <div className="profile-photo profile-photo-placeholder" aria-hidden="true">
      {initials(brother)}
    </div>
  )

  return (
    <div className="profile-page">
      {qFlag && (
        <div className="pf-g">
          <div className="pf-n pf-n1">the inventor of this wonderful website</div>
          <div className="pf-n pf-n2">I never sleep, cuz sleep is the cousin of death</div>
          <div className="pf-n pf-n3">Long live asap rocky</div>
        </div>
      )}

      {/* Back link */}
      <div className="profile-nav">
        <Link to="/brothers" className="profile-back-link">← Brothers</Link>
      </div>

      {/* Header */}
      <div className="profile-header">
        {qFlag ? (
          <div className="pf-r">
            {mNode}
            <span className="pf-a1">GOAT Secretary</span>
          </div>
        ) : (
          mNode
        )}
        <div className="profile-badges">
          <span className="profile-badge badge-class">{brother.pledge_class}</span>
          {isFounder && <span className="profile-badge badge-founder">Founding Father</span>}
        </div>
        <h1 className="profile-name">
          {brother.first_name} {brother.last_name}
        </h1>
        <p className="profile-initiation">Initiation #{brother.initiation_number}</p>
      </div>

      <div className="profile-body">

        {/* Lineage chain */}
        {(ancestors.length > 0 || littles.length > 0) && (
          <section className="profile-section">
            <h2 className="profile-section-title">Lineage</h2>
            <div className="lineage-chain">
              {ancestors.map(anc => (
                <span key={anc.initiation_number} className="lineage-step">
                  <BrotherLink id={anc.initiation_number} />
                  <span className="lineage-arrow">→</span>
                </span>
              ))}
              <span className="lineage-step lineage-self">
                {brother.first_name} {brother.last_name}
              </span>
              {littles.map(little => (
                <span key={little.initiation_number} className="lineage-step">
                  <span className="lineage-arrow">→</span>
                  <BrotherLink id={little.initiation_number} />
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="profile-grid">
          {/* Big brother */}
          <section className="profile-section">
            <h2 className="profile-section-title">Big Brother</h2>
            {bigBrother ? (
              <div className="profile-brother-card">
                <BrotherLink id={bigBrother.initiation_number} />
                <span className="profile-brother-class">{bigBrother.pledge_class}</span>
              </div>
            ) : (
              <p className="profile-empty">Founding Father — no big</p>
            )}
          </section>

          {/* Littles */}
          <section className="profile-section">
            <h2 className="profile-section-title">
              {littles.length === 1 ? 'Little' : 'Littles'}
              {littles.length > 0 && (
                <span className="profile-count">{littles.length}</span>
              )}
            </h2>
            {littles.length > 0 ? (
              <ul className="profile-little-list">
                {littles.map(little => (
                  <li key={little.initiation_number} className="profile-brother-card">
                    <BrotherLink id={little.initiation_number} />
                    <span className="profile-brother-class">{little.pledge_class}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-empty">No littles</p>
            )}
          </section>

          {/* Info */}
          <section className="profile-section">
            <h2 className="profile-section-title">Info</h2>
            <dl className="profile-info-list">
              <div className="profile-info-row">
                <dt>Pledge Class</dt>
                <dd>{brother.pledge_class}</dd>
              </div>
              <div className="profile-info-row">
                <dt>Initiation #</dt>
                <dd>{brother.initiation_number}</dd>
              </div>
              {brother.graduation_year && (
                <div className="profile-info-row">
                  <dt>Graduation</dt>
                  <dd>{brother.graduation_year}</dd>
                </div>
              )}
              {brother.hometown && (
                <div className="profile-info-row">
                  <dt>Hometown</dt>
                  <dd>{brother.hometown}</dd>
                </div>
              )}
              {brother.major && (
                <div className="profile-info-row">
                  <dt>Major</dt>
                  <dd>{brother.major}</dd>
                </div>
              )}
              {brother.roles && (
                <div className="profile-info-row">
                  <dt>Roles</dt>
                  <dd>{Array.isArray(brother.roles) ? brother.roles.join(', ') : brother.roles}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Pledge class mates */}
          {pledgeClassMates.length > 0 && (
            <section className="profile-section">
              <h2 className="profile-section-title">Pledge Class</h2>
              <ul className="profile-little-list">
                {pledgeClassMates.map(mate => (
                  <li key={mate.initiation_number} className="profile-brother-card">
                    <BrotherLink id={mate.initiation_number} />
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>

        {/* Bio */}
        {brother.bio && (
          <section className="profile-section profile-bio-section">
            <h2 className="profile-section-title">Bio</h2>
            <p className="profile-bio">{brother.bio}</p>
          </section>
        )}
      </div>
    </div>
  )
}
