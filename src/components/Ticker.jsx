import React from 'react'
import './Ticker.css'

export default function Ticker({ items = [] }) {
  const defaultItems = [
    'Founded at Purdue: 2023',
    'Alpha Epsilon Tau',
    'Brotherhood Since 1841',
    'Boiler Up'
  ]

  const tickerItems = items.length > 0 ? items : defaultItems
  // Duplicate for seamless loop
  const repeated = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems]

  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {repeated.map((item, i) => (
          <span key={i} className="ticker-item">
            {item} <span className="ticker-separator">✦</span>{' '}
          </span>
        ))}
      </div>
    </div>
  )
}
