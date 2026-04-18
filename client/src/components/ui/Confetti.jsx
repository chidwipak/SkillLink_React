import { useEffect, useRef, useCallback } from 'react'

/**
 * Confetti — A canvas-based confetti burst.
 * Props:
 *   active  : boolean — fire when set to true
 *   duration: ms (default 3000)
 *   count   : number of particles (default 120)
 *   onDone  : callback when animation finishes
 */
const COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c084fc',
  '#10b981', '#34d399', '#f59e0b', '#fbbf24',
  '#ef4444', '#f97316', '#06b6d4', '#ec4899',
]

const random = (min, max) => Math.random() * (max - min) + min

const Confetti = ({ active = false, duration = 3500, count = 150, onDone }) => {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  const launch = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: count }, () => ({
      x: canvas.width / 2 + random(-80, 80),
      y: canvas.height / 2 - 60,
      vx: random(-12, 12),
      vy: random(-18, -4),
      w: random(6, 12),
      h: random(4, 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: random(0, 360),
      rotSpeed: random(-8, 8),
      gravity: random(0.12, 0.22),
      friction: random(0.97, 0.995),
      opacity: 1,
      fadeStart: random(0.5, 0.8),
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))

    const start = performance.now()

    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.vx *= p.friction
        p.vy += p.gravity
        p.vy *= p.friction
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed

        if (progress > p.fadeStart) {
          p.opacity = Math.max(0, 1 - (progress - p.fadeStart) / (1 - p.fadeStart))
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }
        ctx.restore()
      })

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onDone?.()
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }, [count, duration, onDone])

  useEffect(() => {
    if (active) launch()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [active, launch])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    />
  )
}

export default Confetti
