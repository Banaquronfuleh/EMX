import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import backgroundImage from '../assets/background_1.png'

const navLinks = [
  { label: 'Contribute', to: '/contribute' },
  { label: 'Listen', to: '/listen' },
  { label: 'Explore', to: '/explore' },
]

const textGlow = {
  rest: { color: '#faf6ec', textShadow: '0 0 0px rgba(226, 87, 43, 0)' },
  hover: { color: '#f3ac84', textShadow: '0 0 22px rgba(226, 87, 43, 0.75)' },
}

function GlowLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-block">
      <motion.span
        className="font-sans text-lg tracking-wide lowercase sm:text-xl"
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={textGlow}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {children}
      </motion.span>
    </Link>
  )
}

export default function Home() {
  return (
    <main
      className="relative min-h-screen w-full bg-cover bg-center text-cream-50"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-sage-900/45" aria-hidden="true" />
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-8 py-10 sm:px-12 lg:px-20">
        <nav className="flex justify-end gap-3 text-xs uppercase tracking-[0.2em]">
          <Link
            to="/about"
            className="border border-cream-100/40 px-4 py-1.5 transition hover:border-ember-300 hover:text-ember-300"
          >
            About
          </Link>
          <Link
            to="/data"
            className="border border-cream-100/40 px-4 py-1.5 transition hover:border-ember-300 hover:text-ember-300"
          >
            Data
          </Link>
        </nav>

        <div className="flex flex-1 flex-col justify-center">
          <div className="flex flex-col items-start gap-5">
            {navLinks.map((link) => (
              <GlowLink key={link.to} to={link.to}>
                {link.label}
              </GlowLink>
            ))}
          </div>
        </div>

        <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
          The
          <br />
          Environmental
          <br />
          Memory Exchange
        </h1>
      </div>
    </main>
  )
}
