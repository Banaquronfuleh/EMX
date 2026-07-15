import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import backgroundImage from '../assets/background_1.png'
import conceptThumbnail from '../assets/concept-thumbnail.jpg'
import { useWalkthrough } from '../walkthrough/useWalkthrough'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 sm:h-7 sm:w-7"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

const panelGlow = {
  rest: { backgroundColor: 'rgba(0, 0, 0, 0)' },
  active: { backgroundColor: 'rgba(0, 0, 0, 0.15)' },
}

export default function Landing() {
  const tour = useWalkthrough()
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <main className="relative min-h-screen w-full text-cream-50">
      <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
        <motion.button
          type="button"
          onClick={() => setVideoOpen(true)}
          className="group relative flex flex-col items-center justify-center gap-4 bg-cover bg-center px-8 py-16 text-center"
          style={{ backgroundImage: `url(${conceptThumbnail})` }}
          initial="rest"
          whileHover="active"
          whileTap="active"
          animate="rest"
        >
          <div className="absolute inset-0 bg-sage-900/60" aria-hidden="true" />
          <motion.div className="absolute inset-0" variants={panelGlow} transition={{ duration: 0.25 }} aria-hidden="true" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-cream-100/50 text-cream-50 transition group-hover:border-ember-300 group-hover:text-ember-300 sm:h-20 sm:w-20">
            <PlayIcon />
          </span>
          <span className="relative font-display text-2xl sm:text-3xl">Watch the Concept</span>
          <span className="relative max-w-xs font-sans text-sm text-cream-200">
            A short film on the idea behind the Environmental Memory Exchange.
          </span>
        </motion.button>

        <motion.div
          initial="rest"
          whileHover="active"
          whileTap="active"
          animate="rest"
          className="relative flex"
        >
          <Link
            to="/home"
            onClick={() => tour.resetWalkthrough()}
            className="group relative flex flex-1 flex-col items-center justify-center gap-4 bg-cover bg-center px-8 py-16 text-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-ember-500/60" aria-hidden="true" />
            <motion.div className="absolute inset-0" variants={panelGlow} transition={{ duration: 0.25 }} aria-hidden="true" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-cream-100/50 text-cream-50 transition group-hover:border-sage-900 group-hover:text-sage-900 sm:h-20 sm:w-20">
              <ArrowIcon />
            </span>
            <span className="relative font-display text-2xl sm:text-3xl">Explore the Website</span>
            <span className="relative max-w-xs font-sans text-sm text-cream-100">
              Go straight in and browse contributions, sounds, and data.
            </span>
          </Link>
        </motion.div>
      </div>

      <AnimatePresence>
        {videoOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setVideoOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-3xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setVideoOpen(false)}
                aria-label="Close video"
                className="absolute -top-10 right-0 text-cream-50 transition hover:text-ember-300"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-7 w-7">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              <video
                src="/video/concept.mp4"
                poster={conceptThumbnail}
                controls
                autoPlay
                className="w-full rounded-lg bg-black"
              >
                Your browser does not support embedded video.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
