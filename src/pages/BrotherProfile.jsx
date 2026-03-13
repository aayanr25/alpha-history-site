import { useParams, Link } from 'react-router-dom'
import brothers from '../data/brothers.json'
import BrotherLink from '../components/BrotherLink'
import './BrotherProfile.css'

function getAncestors(brother) {
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
  const ancestors = getAncestors(brother)
  const isFounder = !brother.bigBrotherId

  return (
    <div className="profile-page">
      {/* Back link */}
      <div className="profile-nav">
        <Link to="/family-tree" className="profile-back-link">← Family Tree</Link>
      </div>

      {/* Header */}
      <div className="profile-header">
        <div className="profile-badges">
          <span className="profile-badge badge-class">{brother.pledgeClass}</span>
          {isFounder && <span className="profile-badge badge-founder">Founding Father</span>}
          {brother.role && !isFounder && (
            <span className="profile-badge badge-role">{brother.role}</span>
          )}
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
              {ancestors.map((anc, i) => (
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
            {brother.bigBrotherId ? (
              <div className="profile-brother-card">
                <BrotherLink id={brother.bigBrotherId} />
                <span className="profile-brother-class">
                  {brothers.find(b => b.id === brother.bigBrotherId)?.pledgeClass}
                </span>
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