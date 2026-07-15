import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalkthroughContext, type WalkthroughValue } from './context'
import { TOUR_STEPS } from './tourSteps'

const STORAGE_KEY = 'emx.walkthroughChoice'

type Choice = 'guided' | 'solo' | null

function readChoice(): Choice {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'guided' || stored === 'solo' ? stored : null
}

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [choice, setChoice] = useState<Choice>(readChoice)
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const startTour = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, 'guided')
    setChoice('guided')
    setActive(true)
    setStepIndex(0)
    navigate(TOUR_STEPS[0].route)
  }, [navigate])

  const chooseSolo = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, 'solo')
    setChoice('solo')
    setActive(false)
  }, [])

  const advanceFrom = useCallback(
    (stepId: string) => {
      setStepIndex((prev) => {
        if (TOUR_STEPS[prev]?.id !== stepId) return prev
        const next = prev + 1
        if (next >= TOUR_STEPS.length) return prev
        navigate(TOUR_STEPS[next].route)
        return next
      })
    },
    [navigate]
  )

  // For steps advanced by clicking a real <Link> (the nav-* steps): the
  // link's own default navigation already takes the visitor to the next
  // step's route, so this only bumps the step index without calling
  // navigate() a second time (which raced with the Link's own navigation
  // and produced a "setState while rendering" warning).
  const advanceIndexOnly = useCallback((stepId: string) => {
    setStepIndex((prev) => {
      if (TOUR_STEPS[prev]?.id !== stepId) return prev
      const next = prev + 1
      return next >= TOUR_STEPS.length ? prev : next
    })
  }, [])

  const goBack = useCallback(() => {
    setStepIndex((prev) => {
      const next = Math.max(0, prev - 1)
      if (next !== prev) navigate(TOUR_STEPS[next].route)
      return next
    })
  }, [navigate])

  const skipTour = useCallback(() => setActive(false), [])

  const resetWalkthrough = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setChoice(null)
    setActive(false)
    setStepIndex(0)
  }, [])

  const value = useMemo<WalkthroughValue>(
    () => ({
      hasChosen: choice !== null,
      active,
      stepIndex,
      currentStep: active ? TOUR_STEPS[stepIndex] : undefined,
      totalSteps: TOUR_STEPS.length,
      startTour,
      chooseSolo,
      advanceFrom,
      advanceIndexOnly,
      goBack,
      skipTour,
      resetWalkthrough,
    }),
    [
      choice,
      active,
      stepIndex,
      startTour,
      chooseSolo,
      advanceFrom,
      advanceIndexOnly,
      goBack,
      skipTour,
      resetWalkthrough,
    ]
  )

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>
}
