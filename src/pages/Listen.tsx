import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import dialHook from '../assets/rotary_dialhook.png'
import dialCircle from '../assets/rotary_dialcircle.png'
import BackButton from '../components/BackButton'
import PhonebookDock from '../components/PhonebookDock'
import { useWalkthrough } from '../walkthrough/useWalkthrough'

// Both source images share this exact canvas, so positions are calibrated
// in their native pixel space and converted to percentages: the circle
// stays a true circle regardless of how large the dial is rendered.
const IMG_WIDTH = 731
const IMG_HEIGHT = 863

// Calibration: where the ring of finger holes sits within the artwork.
const CENTER_X = 365
const CENTER_Y = 400
const HOLE_RADIUS = 235
const START_ANGLE = 72
const STEP_DIRECTION = -1

// DEBUG: shows colored dots at each computed hotspot so positions can be
// checked against the printed digits in the artwork before going live.
const DEBUG = false

// Classic rotary phone order: "1" sits nearest the finger stop (shortest pull),
// "0" sits furthest round (longest pull).
const DIAL_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

// The printed numbers don't ring the whole dial: they occupy roughly 252° of
// arc, leaving a wide gap near the finger stop. Spacing is the arc divided
// across the 9 gaps between the 10 holes.
const ARC_SPAN = 252
const STEP = ARC_SPAN / (DIAL_ORDER.length - 1)

function holePosition(index: number) {
  const angle = START_ANGLE + STEP_DIRECTION * index * STEP
  const rad = (angle * Math.PI) / 180
  const xPx = CENTER_X + HOLE_RADIUS * Math.sin(rad)
  const yPx = CENTER_Y - HOLE_RADIUS * Math.cos(rad)
  return {
    left: `${(xPx / IMG_WIDTH) * 100}%`,
    top: `${(yPx / IMG_HEIGHT) * 100}%`,
  }
}

function RotaryDial({ onDial }: { onDial: (digit: number) => void }) {
  const [rotation, setRotation] = useState(0)
  const [isDialing, setIsDialing] = useState(false)
  const [pendingDigit, setPendingDigit] = useState<number | null>(null)

  // Fits the dial to whatever space the page has (rather than a fixed max
  // width) so the digit boxes below it never get pushed off screen.
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ratio = IMG_WIDTH / IMG_HEIGHT
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize(
        width / height > ratio
          ? { width: height * ratio, height }
          : { width, height: width / ratio }
      )
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handleSelect(digit: number) {
    if (isDialing) return
    const index = DIAL_ORDER.indexOf(digit)
    const target = index * STEP

    // "1" sits exactly at the stop's resting position, so it needs (almost)
    // no pull, so target stays 0, which Framer Motion won't animate, so
    // onAnimationComplete would never fire. Register it immediately instead.
    if (target === 0) {
      onDial(digit)
      return
    }

    setIsDialing(true)
    setPendingDigit(digit)
    setRotation(target)
  }

  return (
    <div ref={wrapperRef} className="flex h-full w-full max-w-2xl items-center justify-center">
      <div
        data-tour="rotary-dial"
        className="relative"
        style={{
          width: size.width || '100%',
          height: size.height || undefined,
          aspectRatio: `${IMG_WIDTH} / ${IMG_HEIGHT}`,
        }}
      >
        {/* rotating disc: carries the printed holes and digits */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: rotation }}
          transition={
            rotation === 0
              ? { type: 'spring', stiffness: 110, damping: 13 }
              : { duration: 0.45, ease: [0.3, 0.6, 0.3, 1] }
          }
          onAnimationComplete={() => {
            if (rotation !== 0) {
              window.setTimeout(() => setRotation(0), 180)
            } else {
              setIsDialing(false)
              if (pendingDigit !== null) {
                onDial(pendingDigit)
                setPendingDigit(null)
              }
            }
          }}
        >
          <img
            src={dialCircle}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            draggable={false}
          />

          {DIAL_ORDER.map((digit, index) => {
            const position = holePosition(index)
            return (
              <button
                key={digit}
                type="button"
                onClick={() => handleSelect(digit)}
                disabled={isDialing}
                aria-label={`Dial ${digit}`}
                className="absolute flex h-[10%] w-[10%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full disabled:cursor-not-allowed"
                style={{
                  left: position.left,
                  top: position.top,
                  background: 'transparent',
                  outline: DEBUG ? '2px solid rgba(0, 140, 255, 0.9)' : 'none',
                }}
              >
                {DEBUG && (
                  <span className="font-display text-2xl font-bold text-lime-500 mix-blend-multiply">
                    {digit}
                  </span>
                )}
              </button>
            )
          })}
        </motion.div>

        {/* static hook: fixed to the faceplate, never rotates */}
        <img
          src={dialHook}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          draggable={false}
        />
      </div>
    </div>
  )
}

const CODE_LENGTH = 5

// The walkthrough always resolves to this recording, regardless of which
// holes the visitor actually dials, so a mis-tap during a live demo never
// breaks the sequence.
const HAMPSTEAD_DIAL_SEQUENCE = [5, 1, 5, 6, 0]

export default function Listen() {
  const tour = useWalkthrough()
  const [dialedDigits, setDialedDigits] = useState<number[]>([])
  const isWalkthroughStep = tour.active && tour.currentStep?.id === 'listen-dial'

  function handleDial(digit: number) {
    setDialedDigits((prev) => {
      if (prev.length >= CODE_LENGTH) {
        return [isWalkthroughStep ? HAMPSTEAD_DIAL_SEQUENCE[0] : digit]
      }
      const nextDigit = isWalkthroughStep ? HAMPSTEAD_DIAL_SEQUENCE[prev.length] : digit
      return [...prev, nextDigit]
    })
  }

  useEffect(() => {
    if (dialedDigits.join('') === '51560') {
      tour.advanceFrom('listen-dial')
    }
  }, [dialedDigits, tour])

  return (
    <>
      <main className="relative flex h-dvh flex-col items-center justify-center gap-4 overflow-hidden bg-white px-8 py-6 text-black lg:w-1/2 lg:px-12">
        <BackButton />

        <div className="flex w-full min-h-0 flex-1 items-center justify-center">
          <RotaryDial onDial={handleDial} />
        </div>

        <div className="flex flex-none items-center gap-4">
          <div className="flex gap-2">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <div
                key={i}
                className="flex h-14 w-11 items-center justify-center rounded-md border border-sage-300 bg-white font-display text-2xl text-black"
              >
                {dialedDigits[i] ?? <span className="text-black">–</span>}
              </div>
            ))}
          </div>
          {dialedDigits.length > 0 && (
            <button
              type="button"
              onClick={() => setDialedDigits([])}
              className="text-xs uppercase tracking-[0.2em] text-black transition hover:text-ember-500"
            >
              clear
            </button>
          )}
        </div>
      </main>

      <PhonebookDock />
    </>
  )
}
