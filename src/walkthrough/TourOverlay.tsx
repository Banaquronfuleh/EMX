import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWalkthrough } from './useWalkthrough'
import type { TourStep } from './tourSteps'

// Polls on an interval rather than every animation frame: getBoundingClientRect
// plus a full-viewport box-shadow used to run 60x/second, which was the main
// source of jank on lower-powered tablets. A short CSS transition on the ring
// below smooths over the gaps between samples so it still looks continuous.
const POLL_MS = 120

function useTargetRect(target?: string) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const lastKeyRef = useRef('')

  useEffect(() => {
    if (!target) {
      lastKeyRef.current = ''
      const id = window.setTimeout(() => setRect(null), 0)
      return () => window.clearTimeout(id)
    }

    function measure() {
      const el = document.querySelector(`[data-tour="${target}"]`)
      const next = el ? el.getBoundingClientRect() : null
      const key = next ? `${next.left},${next.top},${next.width},${next.height}` : ''
      if (key !== lastKeyRef.current) {
        lastKeyRef.current = key
        setRect(next)
      }
    }

    measure()
    const id = window.setInterval(measure, POLL_MS)
    return () => window.clearInterval(id)
  }, [target])

  return rect
}

function TourSpotlight({ rect }: { rect: DOMRect | null }) {
  if (!rect) return null

  const pad = 6

  return (
    <div
      className="pointer-events-none fixed z-[1010] rounded-md border-2 border-ember-400 shadow-[0_0_10px_2px_rgba(226,87,43,0.5)] transition-all duration-150 ease-out"
      style={{
        left: rect.left - pad,
        top: rect.top - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
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
      className={`pointer-events-none fixed inset-x-0 z-[1011] flex justify-center ${isAbove ? 'top-16' : 'bottom-20'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: isAbove ? [0, -5, 0] : [0, 5, 0] }}
      transition={{ y: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <div className="flex items-center gap-1.5 bg-ember-400 px-3 py-1 font-sans text-[9px] uppercase tracking-[0.15em] text-sage-900 shadow-md">
        <span>{isAbove ? '↑' : '↓'}</span>
        Scroll {isAbove ? 'up' : 'down'}
      </div>
    </motion.div>
  )
}

// Prompts land right next to the element the visitor needs to tap. When
// there's nothing to point at (or it hasn't mounted yet on the new route),
// or when a step opts into `cardPlacement: 'top'` because the target fills
// most of the page, the card falls back to a fixed spot on screen. Kept
// small and low-text on purpose: this runs on a tablet, and the card can't
// be allowed to sit on top of the thing it's describing.
const MARGIN = 12
const GAP = 10

function TourCard({
  step,
  rect,
  stepIndex,
  isLast,
  onBack,
  onFinish,
  onSkip,
}: {
  step: TourStep
  rect: DOMRect | null
  stepIndex: number
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
          ? 'fixed z-[1020] w-[min(78vw,230px)]'
          : pinnedTop
            ? 'fixed inset-x-0 top-2 z-[1020] flex justify-center px-3'
            : 'fixed inset-x-0 bottom-0 z-[1020] flex justify-center px-3 pb-3'
      }
      style={positioned && pos ? { top: pos.top, left: pos.left } : undefined}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18 }}
    >
      <div
        className={`relative ${positioned ? 'w-full' : 'w-full max-w-[230px]'} border border-cream-100/20 bg-sage-900 px-3.5 py-3 text-cream-50 shadow-lg`}
      >
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip tour"
          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center text-cream-200/50 transition hover:text-ember-300"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="h-3 w-3">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        <h3 className="pr-5 font-display text-sm leading-snug">{step.title}</h3>
        <p className="mt-1 pr-5 font-sans text-xs leading-snug text-cream-200">{step.body}</p>

        <div className="mt-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={stepIndex === 0}
            className="font-sans text-[10px] uppercase tracking-[0.12em] text-cream-200/50 transition hover:text-cream-100 disabled:opacity-0"
          >
            &larr; Back
          </button>
          {isLast && (
            <button
              type="button"
              onClick={onFinish}
              className="bg-ember-400 px-3.5 py-1 font-sans text-[10px] uppercase tracking-[0.12em] text-sage-900 transition hover:bg-ember-300"
            >
              Finish
            </button>
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
          isLast={isLast}
          onBack={tour.goBack}
          onFinish={tour.skipTour}
          onSkip={tour.skipTour}
        />
      </AnimatePresence>
    </>
  )
}
