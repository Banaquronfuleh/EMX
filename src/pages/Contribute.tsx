import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '../components/BackButton'
import PhonebookDock from '../components/PhonebookDock'
import { useWalkthrough } from '../walkthrough/useWalkthrough'

// ─── constants ────────────────────────────────────────────────────────────────

const STAGES = [
  'Analysing your recording',
  'Mapping acoustic signature',
  'Registering to archive',
]

const STAGE_MS = 3000

// Hampstead Heath 51.5607°N 0.1660°W → 8 significant digits used in slot phase 1
const COORD_DIGITS = [5, 1, 5, 6, 0, 7, 1, 6]

// Final assigned number for Hampstead Heath Dawn Chorus (51560)
const DIAL_DIGITS = [5, 1, 5, 6, 0]

// ─── upload content ───────────────────────────────────────────────────────────

function UploadContent({
  fileName,
  onSubmit,
}: {
  fileName: string | null
  onSubmit: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-5 px-10"
    >
      <AnimatePresence mode="wait">
        {fileName ? (
          <motion.p
            key="filename"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xs break-all text-center text-sm text-sage-700"
          >
            {fileName}
          </motion.p>
        ) : (
          <motion.p
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm leading-relaxed text-sage-500"
          >
            Drop your recording here
            <br />
            <span className="text-sage-400">or click to browse</span>
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fileName && (
          <motion.button
            data-tour="analyse-btn"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              onSubmit()
            }}
            className="border border-sage-400 px-8 py-2 text-sm uppercase tracking-[0.2em] text-sage-600 transition hover:border-ember-400 hover:text-ember-500"
          >
            Analyse Recording
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── processing panel ─────────────────────────────────────────────────────────

type StageState = 'pending' | 'active' | 'done'

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      className="h-4 w-4 flex-none rounded-full border-[1.5px] border-sage-300 border-t-sage-700"
    />
  )
}

function Checkmark({
  size = 16,
  className = 'text-ember-500',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`flex-none ${className}`}
    >
      <motion.path
        d="M3 8l3.5 3.5L13 5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </svg>
  )
}

function ProcessingPanel({ onComplete }: { onComplete: () => void }) {
  const [stageStates, setStageStates] = useState<StageState[]>([
    'active',
    'pending',
    'pending',
  ])
  const [allDone, setAllDone] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    STAGES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setStageStates((prev) => {
            const next = [...prev] as StageState[]
            next[i] = 'done'
            if (i + 1 < STAGES.length) next[i + 1] = 'active'
            return next
          })
        }, STAGE_MS * (i + 1))
      )
    })

    timers.push(
      setTimeout(() => setAllDone(true), STAGE_MS * STAGES.length + 300)
    )
    timers.push(
      setTimeout(
        () => onCompleteRef.current(),
        STAGE_MS * STAGES.length + 1200
      )
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-5 px-10"
    >
      {STAGES.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex h-5 w-5 flex-none items-center justify-center">
            {stageStates[i] === 'active' && <Spinner />}
            {stageStates[i] === 'done' && <Checkmark />}
            {stageStates[i] === 'pending' && (
              <div className="h-4 w-4 rounded-full border-[1.5px] border-sage-300/60" />
            )}
          </div>
          <motion.span
            className="text-sm"
            animate={{
              color:
                stageStates[i] === 'pending'
                  ? 'var(--color-sage-400)'
                  : 'var(--color-sage-800)',
            }}
            transition={{ duration: 0.3 }}
          >
            {label}
          </motion.span>
        </div>
      ))}

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2 flex items-center gap-2.5"
          >
            <Checkmark size={20} />
            <span className="font-display text-xl text-ember-500">Approved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── split-flap slot ──────────────────────────────────────────────────────────

function SplitFlapSlot({
  char,
  isLocked,
}: {
  char: string
  isLocked: boolean
}) {
  return (
    <div
      className={`relative flex h-16 w-12 items-center justify-center overflow-hidden bg-sage-900 shadow-md transition-shadow duration-300 ${
        isLocked ? 'ring-1 ring-ember-400/70' : ''
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/10" />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={char + (isLocked ? 'locked' : '')}
          initial={{ y: -26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 26, opacity: 0 }}
          transition={{ duration: 0.07, ease: 'easeInOut' }}
          className="relative select-none font-display text-2xl text-cream-50"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// ─── number assignment ────────────────────────────────────────────────────────

function NumberAssignment({
  digits,
  onAssigned,
}: {
  digits: number[]
  onAssigned?: () => void
}) {
  const [chars, setChars] = useState<string[]>(COORD_DIGITS.map(String))
  const [showSlots, setShowSlots] = useState(8)
  const [lockedSlots, setLockedSlots] = useState<Set<number>>(new Set())
  const [showLabel, setShowLabel] = useState(false)

  const lockedRef = useRef(new Set<number>())
  const digitsRef = useRef(digits)
  digitsRef.current = digits
  const onAssignedRef = useRef(onAssigned)
  onAssignedRef.current = onAssigned

  useEffect(() => {
    const allTimers: ReturnType<typeof setTimeout>[] = []
    const allIntervals: ReturnType<typeof setInterval>[] = []

    let frame = 0
    const fastInterval = setInterval(() => {
      setChars(
        COORD_DIGITS.map((_, i) =>
          String(COORD_DIGITS[(frame + i * 3) % COORD_DIGITS.length])
        )
      )
      frame++
    }, 100)
    allIntervals.push(fastInterval)

    allTimers.push(
      setTimeout(() => {
        clearInterval(fastInterval)

        allTimers.push(
          setTimeout(() => {
            setShowSlots(5)
            setChars(COORD_DIGITS.slice(0, 5).map(String))

            const slowInterval = setInterval(() => {
              setChars(
                Array.from({ length: 5 }, (_, i) =>
                  lockedRef.current.has(i)
                    ? String(digitsRef.current[i])
                    : String(Math.floor(Math.random() * 10))
                )
              )
            }, 200)
            allIntervals.push(slowInterval)

            digitsRef.current.forEach((digit, i) => {
              allTimers.push(
                setTimeout(() => {
                  lockedRef.current = new Set([...lockedRef.current, i])
                  setLockedSlots(new Set(lockedRef.current))
                  setChars((prev) => {
                    const next = [...prev]
                    next[i] = String(digit)
                    return next
                  })
                }, 2800 + i * 600)
              )
            })

            allTimers.push(
              setTimeout(() => {
                clearInterval(slowInterval)
                setShowLabel(true)
                onAssignedRef.current?.()
              }, 2800 + digitsRef.current.length * 600 + 700)
            )
          }, 1100)
        )
      }, 2500)
    )

    return () => {
      allIntervals.forEach(clearInterval)
      allTimers.forEach(clearTimeout)
    }
  }, [])

  return (
    <motion.div
      data-tour="assigning-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5"
    >
      <p className="font-sans text-xs uppercase tracking-[0.25em] text-sage-500">
        51.5607°N &ensp; 0.1660°W
      </p>

      <div className="flex gap-2">
        <AnimatePresence>
          {Array.from({ length: showSlots }).map((_, i) => (
            <motion.div
              key={`slot-${i}`}
              layout
              exit={{ width: 0, opacity: 0, marginRight: -8 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <SplitFlapSlot
                char={chars[i] ?? '–'}
                isLocked={lockedSlots.has(i)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="h-5">
        <AnimatePresence>
          {showLabel && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="font-sans text-xs uppercase tracking-[0.25em] text-sage-500"
            >
              number assigned
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'processing' | 'assigning'

const MOCK_FILE_NAME = 'Hampstead Heath, Dawn Chorus (mock).wav'

export default function Contribute() {
  const tour = useWalkthrough()
  const [step, setStep] = useState<Step>('upload')
  const dialDigits = DIAL_DIGITS
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0]
    if (file) setFileName(file.name)
  }, [])

  function handleMockUpload() {
    setFileName(MOCK_FILE_NAME)
    tour.advanceFrom('contribute-add')
  }

  return (
    <>
      <main className="relative flex min-h-screen flex-col bg-white px-8 py-8 lg:w-1/2 lg:px-12 lg:py-10">
        <BackButton />

        {/* Content row: fills remaining page height */}
        <div className="flex flex-1">
          {/* Green panel */}
          <div
            data-tour="upload-zone"
            role={step === 'upload' ? 'button' : undefined}
            tabIndex={step === 'upload' ? 0 : undefined}
            onClick={
              step === 'upload' ? () => inputRef.current?.click() : undefined
            }
            onKeyDown={
              step === 'upload'
                ? (e) => e.key === 'Enter' && inputRef.current?.click()
                : undefined
            }
            onDragOver={
              step === 'upload'
                ? (e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }
                : undefined
            }
            onDragLeave={
              step === 'upload' ? () => setIsDragOver(false) : undefined
            }
            onDrop={
              step === 'upload'
                ? (e) => {
                    e.preventDefault()
                    setIsDragOver(false)
                    handleFiles(e.dataTransfer.files)
                  }
                : undefined
            }
            className={[
              'mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400',
              step === 'upload'
                ? isDragOver
                  ? 'cursor-pointer border-dashed border-ember-400/60 bg-sage-300/50'
                  : 'cursor-pointer border-dashed border-sage-400/40 bg-sage-200/40 hover:border-sage-500/50 hover:bg-sage-200/50'
                : 'cursor-default border-transparent bg-sage-200/40',
            ].join(' ')}
          >
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <AnimatePresence mode="wait">
              {step === 'upload' && (
                <UploadContent
                  key="upload"
                  fileName={fileName}
                  onSubmit={() => {
                    setStep('processing')
                    tour.advanceFrom('contribute-analyse')
                  }}
                />
              )}
              {step === 'processing' && (
                <ProcessingPanel
                  key="processing"
                  onComplete={() => setStep('assigning')}
                />
              )}
              {step === 'assigning' && (
                <NumberAssignment
                  key="assigning"
                  digits={dialDigits}
                  onAssigned={() => tour.advanceFrom('contribute-assigning')}
                />
              )}
            </AnimatePresence>

            {step === 'upload' && (
              <button
                type="button"
                data-tour="mock-upload-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMockUpload()
                }}
                className="border border-sage-400 px-6 py-2 text-xs uppercase tracking-[0.2em] text-sage-500 transition hover:border-ember-400 hover:text-ember-500"
              >
                Add mock data
              </button>
            )}
          </div>
        </div>
      </main>

      <PhonebookDock showNewEntries={step === 'assigning'} />
    </>
  )
}
