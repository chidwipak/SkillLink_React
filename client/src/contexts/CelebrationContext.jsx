import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import Confetti from '../components/ui/Confetti'
import socketService from '../services/socket'

const CelebrationContext = createContext(null)

/**
 * useCelebration() — trigger confetti + optional toast from anywhere.
 *
 * Usage:
 *   const { celebrate } = useCelebration()
 *   celebrate()                       // default burst
 *   celebrate({ count: 200 })         // heavier burst
 */
export const useCelebration = () => {
  const ctx = useContext(CelebrationContext)
  if (!ctx) throw new Error('useCelebration must be used within CelebrationProvider')
  return ctx
}

export const CelebrationProvider = ({ children }) => {
  const [confettiActive, setConfettiActive] = useState(false)
  const [confettiOpts, setConfettiOpts] = useState({ count: 150, duration: 3500 })

  const celebrate = useCallback((opts = {}) => {
    setConfettiOpts({ count: opts.count || 150, duration: opts.duration || 3500 })
    setConfettiActive(true)
  }, [])

  // Wire up socket service so it can trigger celebration from non-React code
  useEffect(() => {
    socketService.setCelebrationCallback(() => celebrate({ count: 180 }))
    return () => socketService.setCelebrationCallback(null)
  }, [celebrate])

  const handleDone = useCallback(() => {
    setConfettiActive(false)
  }, [])

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      <Confetti
        active={confettiActive}
        count={confettiOpts.count}
        duration={confettiOpts.duration}
        onDone={handleDone}
      />
    </CelebrationContext.Provider>
  )
}
