import { useState, useEffect, useRef } from 'react'
import './WelcomeSplash.css'

/**
 * WelcomeSplash — A cinematic full-screen intro that plays once.
 * Shows animated particles, a glowing logo reveal, tagline, and fades out.
 */
const WelcomeSplash = ({ onComplete }) => {
  const [phase, setPhase] = useState('enter')  // enter → show → exit → done
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  // Floating orbs background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const orbs = Array.from({ length: 35 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 120 + 40,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      hue: Math.floor(Math.random() * 60) + 230, // purple-blue range
      alpha: Math.random() * 0.12 + 0.04,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      orbs.forEach((o) => {
        o.x += o.vx
        o.y += o.vy
        if (o.x < -o.r) o.x = w + o.r
        if (o.x > w + o.r) o.x = -o.r
        if (o.y < -o.r) o.y = h + o.r
        if (o.y > h + o.r) o.y = -o.r

        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        grad.addColorStop(0, `hsla(${o.hue}, 80%, 65%, ${o.alpha * 2})`)
        grad.addColorStop(1, `hsla(${o.hue}, 80%, 65%, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
        ctx.fill()
      })
      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Phase timeline
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 300)
    const t2 = setTimeout(() => setPhase('exit'), 3200)
    const t3 = setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, 4200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <div className={`ws-overlay ws-phase-${phase}`}>
      <canvas ref={canvasRef} className="ws-canvas" />

      {/* Radial glow */}
      <div className="ws-glow" />

      <div className="ws-content">
        {/* Animated logo icon */}
        <div className="ws-logo-ring">
          <div className="ws-logo-inner">
            <svg viewBox="0 0 48 48" className="ws-logo-svg">
              <path d="M24 4L6 14v20l18 10 18-10V14L24 4z" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M24 14l-8 5v10l8 5 8-5V19l-8-5z" fill="url(#logoGrad)" opacity="0.8" />
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="ws-ring ws-ring-1" />
          <div className="ws-ring ws-ring-2" />
          <div className="ws-ring ws-ring-3" />
        </div>

        {/* Title */}
        <h1 className="ws-title">
          <span className="ws-title-skill">Skill</span>
          <span className="ws-title-link">Link</span>
        </h1>

        {/* Tagline */}
        <p className="ws-tagline">Home Services & Supplies — On Demand</p>

        {/* Animated dots */}
        <div className="ws-dots">
          <span /><span /><span />
        </div>
      </div>

      {/* Floating sparkles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="ws-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

export default WelcomeSplash
