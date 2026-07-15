import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '../components/BackButton'
import PhonebookDock from '../components/PhonebookDock'
import { useWalkthrough } from '../walkthrough/useWalkthrough'

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
            data-tour="upload-btn"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              onSubmit()
            }}
            className="border border-sage-400 px-8 py-2 text-sm uppercase tracking-[0.2em] text-sage-600 transition hover:border-ember-400 hover:text-ember-500"
          >
            Upload Recording
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── uploading / submitted panels ─────────────────────────────────────────────

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      className="h-6 w-6 flex-none rounded-full border-2 border-sage-300 border-t-sage-700"
    />
  )
}

function Checkmark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-none text-ember-500">
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

const UPLOADING_MS = 1200

function UploadingPanel({ onComplete }: { onComplete: () => void }) {
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const t = setTimeout(() => onCompleteRef.current(), UPLOADING_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center gap-4 px-10"
    >
      <Spinner />
      <p className="font-sans text-xs uppercase tracking-[0.25em] text-sage-500">Uploading&hellip;</p>
    </motion.div>
  )
}

function SubmittedPanel({ onShown }: { onShown?: () => void }) {
  const onShownRef = useRef(onShown)
  onShownRef.current = onShown

  useEffect(() => {
    onShownRef.current?.()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3 px-10 text-center"
    >
      <Checkmark size={24} />
      <p className="font-display text-lg text-ember-500">Check back in a few minutes.</p>
    </motion.div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'uploading' | 'submitted'

const MOCK_FILE_NAME = 'Hampstead Heath, Dawn Chorus (mock).wav'

export default function Contribute() {
  const tour = useWalkthrough()
  const [step, setStep] = useState<Step>('upload')
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0]
    if (file) {
      setFileName(file.name)
      setIsMock(false)
    }
  }, [])

  function handleMockUpload() {
    setFileName(MOCK_FILE_NAME)
    setIsMock(true)
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
                    setStep('uploading')
                    tour.advanceFrom('contribute-upload')
                  }}
                />
              )}
              {step === 'uploading' && (
                <UploadingPanel key="uploading" onComplete={() => setStep('submitted')} />
              )}
              {step === 'submitted' && (
                <SubmittedPanel
                  key="submitted"
                  onShown={() => tour.advanceFrom('contribute-submitted')}
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

      <PhonebookDock showNewEntries={step === 'submitted' && isMock} />
    </>
  )
}
