import { useState } from 'react'
import { CATEGORY_ORDER, phonebook, type PhonebookEntry } from '../data/phonebook'
import BackButton from '../components/BackButton'
import { useWalkthrough } from '../walkthrough/useWalkthrough'

function AnalysisModal({ entry, onClose }: { entry: PhonebookEntry; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-sage-300 px-6 py-4">
          <div>
            <p className="font-display text-lg text-black">{entry.title}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-sage-500">
              {entry.place} · {entry.dialCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 font-mono text-xs uppercase tracking-[0.2em] text-sage-500 transition hover:text-black"
          >
            close ✕
          </button>
        </div>

        {/* Image area */}
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-sage-100/40 border-b border-sage-200">
          <img
            src={`/analysis/${entry.dialCode}.png`}
            alt={`Acoustic analysis for ${entry.title}`}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.removeAttribute('hidden')
            }}
          />
          <div hidden className="flex flex-col items-center gap-3 text-center">
            <div className="h-16 w-16 border border-dashed border-sage-400 flex items-center justify-center">
              <span className="font-mono text-2xl text-sage-300">~</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage-400">
              Analysis pending
            </p>
            <p className="font-mono text-[9px] text-sage-300">/analysis/{entry.dialCode}.png</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage-400">
            Acoustic spectrogram · {entry.coordinates}
          </p>
          <a
            href={`/analysis/${entry.dialCode}.png`}
            download
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember-500 transition hover:text-ember-600"
          >
            ↓ png
          </a>
        </div>
      </div>
    </div>
  )
}

const TOTAL = phonebook.length
const CATEGORIES = CATEGORY_ORDER.filter((c) => phonebook.some((e) => e.category === c))

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

type SortKey = 'dialCode' | 'title' | 'place' | 'date' | 'category'

export default function Data() {
  const tour = useWalkthrough()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('category')
  const [sortAsc, setSortAsc] = useState(true)
  const [analysisEntry, setAnalysisEntry] = useState<(typeof phonebook)[0] | null>(null)

  const filtered = activeCategory
    ? phonebook.filter((e) => e.category === activeCategory)
    : [...phonebook]

  const sorted = filtered.sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    const active = sortKey === field
    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className={`flex items-center gap-1 text-left text-xs uppercase tracking-[0.2em] transition ${
          active ? 'text-ember-500' : 'text-sage-600 hover:text-black'
        }`}
      >
        {label}
        <span className="text-[10px] opacity-60">{active ? (sortAsc ? '↑' : '↓') : '↕'}</span>
      </button>
    )
  }

  return (
    <main className="relative min-h-screen bg-white px-6 py-8 text-black lg:px-10 lg:py-10">
      <BackButton />

      {/* Header */}
      <div className="mt-8 mb-8 border-b border-sage-400 pb-6">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-sage-500">
          Environmental Memory Exchange · Issue Zero, 2026
        </p>
        <h1 className="font-display text-4xl text-black sm:text-5xl">Archive</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sage-600">
          Full acoustic dataset. {TOTAL} entries across {CATEGORIES.length} categories.
          All recordings provide acoustic data used to track ecosystem health, wildlife presence,
          and environmental shifts.
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-3 gap-px border border-sage-300 bg-sage-300">
        {[
          { label: 'Total entries', value: TOTAL },
          { label: 'Categories', value: CATEGORIES.length },
          {
            label: 'With memory',
            value: phonebook.filter((e) => e.memory).length,
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white px-4 py-4">
            <p className="font-mono text-2xl tabular-nums text-black">{value}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-sage-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
            activeCategory === null
              ? 'border-ember-500 text-ember-500'
              : 'border-sage-300 text-sage-600 hover:border-sage-500 hover:text-black'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
              activeCategory === cat
                ? 'border-ember-500 text-ember-500'
                : 'border-sage-300 text-sage-600 hover:border-sage-500 hover:text-black'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-sage-400">
              <th className="py-2 pr-6 text-left">
                <SortHeader label="No." field="dialCode" />
              </th>
              <th className="py-2 pr-6 text-left">
                <SortHeader label="Title" field="title" />
              </th>
              <th className="hidden py-2 pr-6 text-left sm:table-cell">
                <SortHeader label="Place" field="place" />
              </th>
              <th className="hidden py-2 pr-6 text-left lg:table-cell">
                <span className="text-xs uppercase tracking-[0.2em] text-sage-600">
                  Coordinates
                </span>
              </th>
              <th className="hidden py-2 pr-6 text-left md:table-cell">
                <SortHeader label="Date" field="date" />
              </th>
              <th className="hidden py-2 pr-6 text-left sm:table-cell">
                <SortHeader label="Category" field="category" />
              </th>
              <th className="py-2 text-right">
                <span className="text-xs uppercase tracking-[0.2em] text-sage-600">Download</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => (
              <tr
                key={entry.dialCode}
                className={`border-b transition-colors ${
                  entry.isNew
                    ? 'border-ember-200 bg-ember-50/30 hover:bg-ember-50/60'
                    : 'border-sage-200 hover:bg-sage-50/60'
                }`}
              >
                <td className="py-3 pr-6">
                  <span
                    className={`font-mono text-sm tabular-nums ${
                      entry.isNew ? 'text-ember-500' : 'text-sage-700'
                    }`}
                  >
                    {entry.dialCode}
                    {entry.isNew && (
                      <span className="ml-1.5 text-[9px] uppercase tracking-[0.15em] text-ember-400">
                        new
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-3 pr-6">
                  <p className="font-display text-sm text-black">{entry.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-sage-500 sm:hidden">
                    {entry.place}
                  </p>
                </td>
                <td className="hidden py-3 pr-6 sm:table-cell">
                  <p className="font-mono text-xs text-sage-700">{entry.place}</p>
                </td>
                <td className="hidden py-3 pr-6 lg:table-cell">
                  <p className="font-mono text-[11px] tabular-nums text-sage-500">
                    {entry.coordinates}
                  </p>
                </td>
                <td className="hidden py-3 pr-6 md:table-cell">
                  <p className="font-mono text-xs text-sage-600">{entry.date}</p>
                </td>
                <td className="hidden py-3 pr-6 sm:table-cell">
                  <span
                    className="border border-sage-300 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-sage-600"
                    id={`cat-${slugify(entry.category)}`}
                  >
                    {entry.category}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      data-tour={entry.dialCode === '51560' ? 'data-row-51560' : undefined}
                      onClick={() => {
                        setAnalysisEntry(entry)
                        if (entry.dialCode === '51560') tour.advanceFrom('data-analysis')
                      }}
                      className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage-500 transition hover:text-black"
                    >
                      ⊞ analysis
                    </button>
                    <a
                      href={entry.audioSrc}
                      download={entry.audioFile}
                      className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember-500 transition hover:text-ember-600"
                    >
                      ↓ audio
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-sage-400">
        {sorted.length} of {TOTAL} entries shown · www.the-emx.com
      </p>

      {analysisEntry && (
        <AnalysisModal entry={analysisEntry} onClose={() => setAnalysisEntry(null)} />
      )}
    </main>
  )
}
