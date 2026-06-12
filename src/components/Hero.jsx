import React from 'react'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      {/* 
        Replace the placeholder below with your own image:
        1. Add your image to /public/images/
        2. Update the src to: /images/your-image.jpg
      */}
      <div className="hero-image-placeholder">
      </div>

      <div className="hero-overlay">
        <h1 className="hero-title">
          The History<br />
          of Alpha<br />
          Epsilon Tau
        </h1>
        <p className="hero-subtitle">
          Chi Psi Fraternity at Purdue University. Est. 2023.
          <br />
          A look back at the brotherhood, the lodge, and the legacy.
        </p>
      </div>
    </section>
  )
}
