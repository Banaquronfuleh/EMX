import { useContext } from 'react'
import { WalkthroughContext } from './context'

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext)
  if (!ctx) throw new Error('useWalkthrough must be used within a WalkthroughProvider')
  return ctx
}
