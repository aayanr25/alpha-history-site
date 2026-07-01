import { useEffect, useRef } from 'react'

// Self-contained, dependency-free firework burst. Renders a fixed, click-through
// canvas overlay and animates a few bursts with requestAnimationFrame, then
// cleans itself up. Mount it (e.g. with a `key`) each time you want it to fire.
//
// Uses the site theme colors: purple #3f2b7e and gold #cfa151, plus lighter
// gold and white sparks for contrast.
const COLORS = ['#3f2b7e', '#cfa151', '#e8d9a0', '#ffffff']

export default function Fireworks({ duration = 4500 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // Respect users who ask for less motion — skip the animation entirely.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      width = canvas.width = Math.floor(window.innerWidth * dpr)
      height = canvas.height = Math.floor(window.innerHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = []
    const gravity = 0.05 * dpr
    const friction = 0.985

    function burst(x, y) {
      const count = 60 + Math.floor(Math.random() * 40)
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const baseSpeed = (3 + Math.random() * 2) * dpr
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.1
        const v = baseSpeed * (0.5 + Math.random() * 0.7)
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          alpha: 1,
          decay: 0.008 + Math.random() * 0.012,
          color,
          size: (1.5 + Math.random() * 1.5) * dpr,
        })
      }
    }

    const start = performance.now()
    let lastLaunch = 0
    let raf = 0

    function frame(now) {
      const elapsed = now - start
      // Clear fully each frame so the overlay never veils the page underneath.
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      // Launch a new burst every so often while we're still within the window.
      if (elapsed < duration && now - lastLaunch > 350) {
        lastLaunch = now
        const x = width * (0.2 + Math.random() * 0.6)
        const y = height * (0.2 + Math.random() * 0.35)
        burst(x, y)
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.vx *= friction
        p.vy *= friction
        p.vy += gravity
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay
        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      // Keep going until the launch window closes AND every spark has faded.
      if (elapsed < duration || particles.length > 0) {
        raf = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, width, height)
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [duration])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
