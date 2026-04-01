import { useParams, Link } from 'react-router-dom'
import { useBrothers } from '../hooks/useBrothers'
import BrotherLink from '../components/BrotherLink'
import './BrotherProfile.css'

function getAncestors(brother, brothers) {
  const chain = []
  let current = brother
  while (current.bigBrotherId) {
    const big = brothers.find(b => b.id === current.bigBrotherId)
    if (!big) break
    chain.unshift(big)
    current = big
  }
  return chain
}

export default function BrotherProfile() {
  const { id } = useParams()
  const { brothers, loading, error } = useBrothers()

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
          <p className="profile-error">Failed to load data: {error}</p>
          <Link to="/family-tree" className="profile-back-link">← Back to Family Tree</Link>
        </div>
      </div>
    )
  }

  const brother = brothers.find(b => b.id === id)

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

  const littles = brothers.filter(b => b.bigBrotherId === brother.id)
  const pledgeClassMates = brothers.filter(
    b => b.pledgeClass === brother.pledgeClass && b.id !== brother.id
  )
  const ancestors = getAncestors(brother, brothers)
  const isFounder = !brother.bigBrotherId
  const bigBrother = brother.bigBrotherId
    ? brothers.find(b => b.id === brother.bigBrotherId)
    : null

  return (
    <div className="profile-page">
      {/* Back link */}
      <div className="profile-nav">
        <Link to="/family-tree" className="profile-back-link">← Family Tree</Link>
      </div>

      {/* Header */}
      <div className="profile-header">
        {brother.profilePhotoUrl && (
          <img
            src={brother.profilePhotoUrl}
            alt={`${brother.firstName} ${brother.lastName}`}
            className="profile-photo"
          />
        )}
        <div className="profile-badges">
          <span className="profile-badge badge-class">{brother.pledgeClass}</span>
          {isFounder && <span className="profile-badge badge-founder">Founding Father</span>}
        </div>
        <h1 className="profile-name">
          {brother.firstName} {brother.lastName}
        </h1>
        <p className="profile-initiation">Initiation #{brother.initiationNumber}</p>
      </div>

      <div className="profile-body">

        {/* Lineage chain */}
        {(ancestors.length > 0 || littles.length > 0) && (
          <section className="profile-section">
            <h2 className="profile-section-title">Lineage</h2>
            <div className="lineage-chain">
              {ancestors.map(anc => (
                <span key={anc.id} className="lineage-step">
                  <BrotherLink id={anc.id} />
                  <span className="lineage-arrow">→</span>
                </span>
              ))}
              <span className="lineage-step lineage-self">
                {brother.firstName} {brother.lastName}
              </span>
              {littles.map(little => (
                <span key={little.id} className="lineage-step">
                  <span className="lineage-arrow">→</span>
                  <BrotherLink id={little.id} />
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
                <BrotherLink id={bigBrother.id} />
                <span className="profile-brother-class">{bigBrother.pledgeClass}</span>
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
                  <li key={little.id} className="profile-brother-card">
                    <BrotherLink id={little.id} />
                    <span className="profile-brother-class">{little.pledgeClass}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-empty">No littles yet</p>
            )}
          </section>

          {/* Info */}
          <section className="profile-section">
            <h2 className="profile-section-title">Info</h2>
            <dl className="profile-info-list">
              <div className="profile-info-row">
                <dt>Pledge Class</dt>
                <dd>{brother.pledgeClass}</dd>
              </div>
              <div className="profile-info-row">
                <dt>Initiation #</dt>
                <dd>{brother.initiationNumber}</dd>
              </div>
              {brother.graduationYear && (
                <div className="profile-info-row">
                  <dt>Graduation</dt>
                  <dd>{brother.graduationYear}</dd>
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
            </dl>
          </section>

          {/* Pledge class mates */}
          {pledgeClassMates.length > 0 && (
            <section className="profile-section">
              <h2 className="profile-section-title">Pledge Class</h2>
              <ul className="profile-little-list">
                {pledgeClassMates.map(mate => (
                  <li key={mate.id} className="profile-brother-card">
                    <BrotherLink id={mate.id} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Career */}
          {(brother.employer || brother.jobTitle || brother.industry || brother.currentLocation) && (
            <section className="profile-section">
              <h2 className="profile-section-title">Career</h2>
              <dl className="profile-info-list">
                {brother.employer && (
                  <div className="profile-info-row">
                    <dt>Employer</dt>
                    <dd>{brother.employer}</dd>
                  </div>
                )}
                {brother.jobTitle && (
                  <div className="profile-info-row">
                    <dt>Title</dt>
                    <dd>{brother.jobTitle}</dd>
                  </div>
                )}
                {brother.industry && (
                  <div className="profile-info-row">
                    <dt>Industry</dt>
                    <dd>{brother.industry}</dd>
                  </div>
                )}
                {brother.currentLocation && (
                  <div className="profile-info-row">
                    <dt>Location</dt>
                    <dd>{brother.currentLocation}</dd>
                  </div>
                )}
                {brother.linkedinUrl && (
                  <div className="profile-info-row">
                    <dt>LinkedIn</dt>
                    <dd>
                      <a
                        href={brother.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-link"
                      >
                        Profile ↗
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
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
