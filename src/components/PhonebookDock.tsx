import { useState } from 'react'
import PhonebookPanel from './PhonebookPanel'

export default function PhonebookDock({ showNewEntries = true }: { showNewEntries?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-pressed={expanded}
        aria-label={expanded ? 'Collapse phonebook' : 'Expand phonebook'}
        className="fixed right-4 top-4 z-40 hidden border border-sage-400 bg-white px-5 py-1.5 text-xs uppercase tracking-[0.2em] text-black transition hover:border-ember-400 hover:text-ember-500 lg:block"
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>

      <div
        className={[
          'border-t border-sage-300 bg-white mt-12 lg:mt-0 lg:border-t-0 lg:overflow-y-auto',
          expanded
            ? 'lg:fixed lg:inset-0 lg:z-30 lg:w-full lg:border-0'
            : 'lg:fixed lg:inset-y-0 lg:right-0 lg:z-20 lg:w-1/2 lg:border-l',
        ].join(' ')}
      >
        <PhonebookPanel className="px-6 py-10 lg:px-10 lg:py-12" showNewEntries={showNewEntries} />
      </div>
    </>
  )
}
