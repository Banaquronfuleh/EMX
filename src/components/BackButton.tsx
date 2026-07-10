import { Link } from 'react-router-dom'

export default function BackButton() {
  return (
    <Link
      to="/home"
      aria-label="Back home"
      className="fixed left-4 top-4 z-40 text-black transition hover:text-ember-500"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-6 w-6 sm:h-7 sm:w-7"
      >
        <path d="M19 12H5M11 18l-6-6 6-6" />
      </svg>
    </Link>
  )
}
