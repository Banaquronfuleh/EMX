import BackButton from '../components/BackButton'

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
      <BackButton />
      <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
      <p className="max-w-md text-black">
        This page is on its way. Content and design specs for the{' '}
        {title.toLowerCase()} experience are coming soon.
      </p>
    </main>
  )
}
