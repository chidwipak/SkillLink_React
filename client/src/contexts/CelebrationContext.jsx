import { createContext, useContext, useCallback } from 'react'

const CelebrationContext = createContext(null)

/**
 * useCelebration() — no-op provider (confetti disabled).
 */
export const useCelebration = () => {
  const ctx = useContext(CelebrationContext)
  if (!ctx) throw new Error('useCelebration must be used within CelebrationProvider')
  return ctx
}

export const CelebrationProvider = ({ children }) => {
  // Celebration/confetti disabled — celebrate() is a no-op
  const celebrate = useCallback(() => {}, [])

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
    </CelebrationContext.Provider>
  )
}
