import { createContext } from 'react'
import type { TourStep } from './tourSteps'

export interface WalkthroughValue {
  hasChosen: boolean
  active: boolean
  stepIndex: number
  currentStep: TourStep | undefined
  totalSteps: number
  startTour: () => void
  chooseSolo: () => void
  advanceFrom: (stepId: string) => void
  advanceIndexOnly: (stepId: string) => void
  goBack: () => void
  skipTour: () => void
  resetWalkthrough: () => void
}

export const WalkthroughContext = createContext<WalkthroughValue | null>(null)
