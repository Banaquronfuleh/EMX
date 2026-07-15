import { useRef, useState } from 'react'
import { CATEGORY_ORDER, phonebook, type PhonebookEntry } from '../data/phonebook'
import { useWalkthrough } from '../walkthrough/useWalkthrough'

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function PhonebookRow({
  entry,
  isPlaying,
  isExpanded,
  onPlay,
  onToggleMemory,
}: {
  entry: PhonebookEntry
  isPlaying: boolean
  isExpanded: boolean
  onPlay: () => void
  onToggleMemory: () => void
}) {
  return (
    <div className={`border-b ${entry.isNew ? 'border-ember-200 bg-ember-50/40' : 'border-sage-300/60'}`}>
      <div
        data-tour={entry.isNew ? 'phonebook-new-entry' : undefined}
        role="button"
        tabIndex={0}
        aria-pressed={isPlaying}
        aria-label={`${isPlaying ? 'Stop' : 'Play'} recording: ${entry.title}, ${entry.place}`}
        onClick={onPlay}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onPlay()
          }
        }}
        className={`grid cursor-pointer grid-cols-[3fr_1fr] gap-x-4 px-2 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400 sm:gap-x-6 sm:px-4 ${
          isPlaying
            ? 'bg-sage-100/80'
            : entry.isNew
              ? 'hover:bg-ember-50/60'
              : 'hover:bg-sage-100/60'
        }`}
      >
        <div>
          <p className="font-display text-base text-black sm:text-lg">
            {entry.title}
            {entry.memory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleMemory()
                }}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Hide memory' : 'Show memory'}
                className="ml-1.5 align-super text-base text-ember-500 transition hover:text-ember-600"
              >
                *
              </button>
            )}
            {entry.isNew && (
              <span className="ml-2 align-middle text-xs font-sans uppercase tracking-[0.15em] text-ember-500 border border-ember-300 px-1.5 py-0.5">
                new
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-black">
            {entry.place} &middot; {entry.date}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          {isPlaying && (
            <span
              className="h-1.5 w-1.5 flex-none animate-pulse rounded-full bg-ember-500"
              aria-hidden="true"
            />
          )}
          <p className={`font-display text-base tabular-nums sm:text-lg ${entry.isNew ? 'text-ember-500' : 'text-black'}`}>
            {entry.dialCode}
          </p>
        </div>
      </div>

      {entry.memory && isExpanded && (
        <p className="border-t border-dashed border-sage-200 px-2 py-3 text-sm leading-relaxed text-black italic sm:px-4">
          {entry.memory}
        </p>
      )}
    </div>
  )
}

export default function PhonebookPanel({ className = '', showNewEntries = true }: { className?: string; showNewEntries?: boolean }) {
  const tour = useWalkthrough()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  function handlePlay(entry: PhonebookEntry) {
    if (entry.isNew) tour.advanceFrom('contribute-phonebook')

    const audio = audioRef.current
    if (!audio) return

    if (playingId === entry.dialCode) {
      audio.pause()
      setPlayingId(null)
      return
    }

    audio.src = entry.audioSrc
    audio.play().catch(() => {})
    setPlayingId(entry.dialCode)
  }

  return (
    <div className={`bg-white text-black ${className}`}>
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

      <h2 className="font-display text-3xl sm:text-4xl">Phonebook</h2>
      <p className="mt-3 max-w-2xl text-black">
        Select an entry to listen. Entries marked{' '}
        <span className="text-ember-500">*</span> carry a contributor's
        memory; select the asterisk to read it.
      </p>

      <div className="mt-8 grid grid-cols-[3fr_1fr] gap-x-4 border-t border-sage-400 px-2 py-2 text-xs uppercase tracking-[0.2em] text-black sm:gap-x-6 sm:px-4">
        <div>Place / Date</div>
        <div className="text-right">Number</div>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const entries = phonebook.filter(
          (entry) => entry.category === category && (showNewEntries || !entry.isNew)
        )
        if (entries.length === 0) return null

        return (
          <section key={category} aria-labelledby={`category-${slugify(category)}`}>
            <h3
              id={`category-${slugify(category)}`}
              className="mt-8 mb-1 font-display text-sm uppercase tracking-[0.3em] text-ember-500"
            >
              {category}
            </h3>
            <div>
              {entries.map((entry) => (
                <PhonebookRow
                  key={entry.dialCode}
                  entry={entry}
                  isPlaying={playingId === entry.dialCode}
                  isExpanded={expandedId === entry.dialCode}
                  onPlay={() => handlePlay(entry)}
                  onToggleMemory={() =>
                    setExpandedId((prev) => (prev === entry.dialCode ? null : entry.dialCode))
                  }
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
