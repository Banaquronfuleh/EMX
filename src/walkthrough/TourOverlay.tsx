import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWalkthrough } from './useWalkthrough'
import type { TourStep } from './tourSteps'

function useTargetRect(target?: string) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const lastKeyRef = useRef('')

  useEffect(() => {
    let raf = 0

    if (!target) {
      lastKeyRef.current = ''
      raf = requestAnimationFrame(() => setRect(null))
      return () => cancelAnimationFrame(raf)
    }

    function measure() {
      const el = document.querySelector(`[data-tour="${target}"]`)
      const next = el ? el.getBoundingClientRect() : null
      const key = next ? `${next.left},${next.top},${next.width},${next.height}` : ''
      if (key !== lastKeyRef.current) {
        lastKeyRef.current = key
        setRect(next)
      }
      raf = requestAnimationFrame(measure)
    }
    raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return rect
}

function TourSpotlight({ rect }: { rect: DOMRect | null }) {
  if (!rect) return null

  const pad = 8

  return (
    <div
      className="pointer-events-none fixed z-[65] rounded-lg border-2 border-ember-400 transition-all duration-200 ease-out"
      style={{
        left: rect.left - pad,
        top: rect.top - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        boxShadow: '0 0 0 2000px rgba(10, 10, 10, 0.5), 0 0 24px rgba(226, 87, 43, 0.65)',
      }}
    />
  )
}

// When the highlighted element is scrolled out of view (e.g. the new
// Phonebook entry sitting further down the list), point at where to scroll
// instead of leaving the visitor hunting for a ring that isn't on screen.
function ScrollHint({ rect }: { rect: DOMRect | null }) {
  if (!rect) return null

  const margin = 12
  const isAbove = rect.bottom < margin
  const isBelow = rect.top > window.innerHeight - margin
  if (!isAbove && !isBelow) return null

  return (
    <motion.div
      className={`pointer-events-none fixed inset-x-0 z-[66] flex justify-center ${isAbove ? 'top-20' : 'bottom-24'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: isAbove ? [0, -6, 0] : [0, 6, 0] }}
      transition={{ y: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <div className="flex items-center gap-2 bg-ember-400 px-4 py-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-sage-900 shadow-lg">
        <span>{isAbove ? '↑' : '↓'}</span>
        Scroll {isAbove ? 'up' : 'down'} to see it
      </div>
    </motion.div>
  )
}

// Prompts land right next to the element the visitor needs to tap. When
// there's nothing to point at (or it hasn't mounted yet on the new route),
// or when a step opts into `cardPlacement: 'top'` because the target fills
// most of the page, the card falls back to a fixed spot on screen.
const MARGIN = 16
const GAP = 18

function TourCard({
  step,
  rect,
  stepIndex,
  totalSteps,
  isLast,
  onBack,
  onFinish,
  onSkip,
}: {
  step: TourStep
  rect: DOMRect | null
  stepIndex: number
  totalSteps: number
  isLast: boolean
  onBack: () => void
  onFinish: () => void
  onSkip: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const pinnedTop = step.cardPlacement === 'top'

  useLayoutEffect(() => {
    const cardEl = cardRef.current
    if (!cardEl || !rect || pinnedTop) {
      setPos(null)
      return
    }

    const { width: cardWidth, height: cardHeight } = cardEl.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top =
      spaceBelow >= cardHeight + GAP || spaceBelow >= spaceAbove
        ? rect.bottom + GAP
        : rect.top - cardHeight - GAP
    top = Math.min(Math.max(top, MARGIN), Math.max(MARGIN, window.innerHeight - cardHeight - MARGIN))

    let left = rect.left
    left = Math.min(Math.max(left, MARGIN), Math.max(MARGIN, window.innerWidth - cardWidth - MARGIN))

    setPos({ top, left })
  }, [rect, pinnedTop])

  const positioned = !pinnedTop && Boolean(rect && pos)

  return (
    <motion.div
      ref={cardRef}
      className={
        positioned
          ? 'fixed z-[70] w-[min(92vw,320px)]'
          : pinnedTop
            ? 'fixed inset-x-0 top-3 z-[70] flex justify-center px-4 sm:top-5 sm:px-6'
            : 'fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-4 sm:bottom-6 sm:px-6'
      }
      style={positioned && pos ? { top: pos.top, left: pos.left } : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22 }}
    >
      <div
        className={`${positioned ? 'w-full' : 'w-full max-w-md'} border border-cream-100/20 bg-sage-900 px-6 py-5 text-cream-50 shadow-2xl`}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-cream-200/70">
            Guided walkthrough &middot; {stepIndex + 1} / {totalSteps}
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="flex-none font-sans text-[10px] uppercase tracking-[0.2em] text-cream-200/60 transition hover:text-ember-300"
          >
            Skip tour
          </button>
        </div>

        <h3 className="mt-2 font-display text-xl">{step.title}</h3>
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-cream-200">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={stepIndex === 0}
            className="font-sans text-xs uppercase tracking-[0.2em] text-cream-200/50 transition hover:text-cream-100 disabled:opacity-0"
          >
            &larr; Back
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onFinish}
              className="bg-ember-400 px-6 py-2 font-sans text-xs uppercase tracking-[0.15em] text-sage-900 transition hover:bg-ember-300"
            >
              Finish
            </button>
          ) : (
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-cream-200/40">
              Complete this step to continue
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function TourOverlay() {
  const tour = useWalkthrough()
  const rect = useTargetRect(tour.currentStep?.target)

  if (!tour.active || !tour.currentStep) return null

  const isLast = tour.stepIndex === tour.totalSteps - 1
  const pinnedTop = tour.currentStep.cardPlacement === 'top'

  return (
    <>
      <TourSpotlight rect={rect} />
      {!pinnedTop && <ScrollHint rect={rect} />}

      <AnimatePresence mode="wait">
        <TourCard
          key={tour.currentStep.id}
          step={tour.currentStep}
          rect={rect}
          stepIndex={tour.stepIndex}
          totalSteps={tour.totalSteps}
          isLast={isLast}
          onBack={tour.goBack}
          onFinish={tour.skipTour}
          onSkip={tour.skipTour}
        />
      </AnimatePresence>
    </>
  )
}
