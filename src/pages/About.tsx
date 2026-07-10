import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'

const PHRASES = [
  'Less contact with nature',
  'Atrophied biophilia',
  'Diminished conservation',
  'Less nature',
]

// Loop geometry: four phrases sit at the compass points of a circle, joined
// by arcs that bow outward — the same trig used for the rotary dial, just
// laid out on a 0–100 viewBox so it scales with the container.
const NODE_RADIUS = 40
const ARC_RADIUS = 56

function point(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: 50 + radius * Math.sin(rad), y: 50 - radius * Math.cos(rad) }
}

const NODES = PHRASES.map((_, i) => point(i * 90, NODE_RADIUS))

const ARC_PATHS = PHRASES.map((_, i) => {
  const from = NODES[i]
  const to = NODES[(i + 1) % PHRASES.length]
  const control = point(i * 90 + 45, ARC_RADIUS)
  return `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`
})

// One full pass around the loop, looped forever. Each of the four stages
// reveals a phrase, glowing in, then draws the arc onward to the next one;
// everything settles, then softly fades so the loop can begin again.
const CYCLE_SECONDS = 18
const BUILD_END = 0.72
const STAGE_SPAN = BUILD_END / PHRASES.length
const HOLD = 0.88

const NO_GLOW = '0 0 0px rgba(226, 87, 43, 0)'
const FLASH_GLOW = '0 0 26px rgba(226, 87, 43, 0.85)'
const SOFT_GLOW = '0 0 12px rgba(226, 87, 43, 0.4)'

function phraseTiming(index: number) {
  const start = index * STAGE_SPAN
  const peak = start + STAGE_SPAN * 0.35
  return {
    times: [start, peak, HOLD, 1],
    opacity: [0, 1, 1, 0],
    textShadow: [NO_GLOW, FLASH_GLOW, SOFT_GLOW, NO_GLOW],
  }
}

function arcTiming(index: number) {
  const start = index * STAGE_SPAN + STAGE_SPAN * 0.4
  const end = index * STAGE_SPAN + STAGE_SPAN * 0.95
  return {
    times: [start, end, HOLD, 1],
    pathLength: [0, 1, 1, 1],
    opacity: [0, 1, 1, 0],
  }
}

export default function About() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-12 bg-white px-6 py-16 text-center text-black">
      <BackButton />
      <div className="relative aspect-square w-full max-w-xl">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
          {ARC_PATHS.map((d, i) => {
            const timing = arcTiming(i)
            return (
              <motion.path
                key={d}
                d={d}
                fill="none"
                stroke="#ec7f4d"
                strokeWidth={0.6}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(226, 87, 43, 0.45))' }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: timing.pathLength, opacity: timing.opacity }}
                transition={{
                  duration: CYCLE_SECONDS,
                  repeat: Infinity,
                  times: timing.times,
                  ease: 'easeInOut',
                }}
              />
            )
          })}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center px-16 sm:px-20">
          <motion.span
            className="font-display text-lg leading-snug text-black sm:text-xl"
            animate={{
              textShadow: [
                '0 0 0px rgba(116, 137, 95, 0)',
                '0 0 20px rgba(116, 137, 95, 0.45)',
                '0 0 0px rgba(116, 137, 95, 0)',
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            extinction
            <br />
            of experience
          </motion.span>
        </div>

        {PHRASES.map((phrase, i) => {
          const node = NODES[i]
          const timing = phraseTiming(i)
          return (
            <motion.div
              key={phrase}
              className="absolute w-32 -translate-x-1/2 -translate-y-1/2 text-center sm:w-40"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: timing.opacity }}
              transition={{
                duration: CYCLE_SECONDS,
                repeat: Infinity,
                times: timing.times,
                ease: 'easeInOut',
              }}
            >
              {/* soft white halo — masks the loop line passing behind the text */}
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.95) 38%, rgba(255,255,255,0) 72%)',
                }}
                aria-hidden="true"
              />
              <motion.span
                className="relative inline-block font-display text-sm text-ember-500 sm:text-base"
                animate={{ textShadow: timing.textShadow }}
                transition={{
                  duration: CYCLE_SECONDS,
                  repeat: Infinity,
                  times: timing.times,
                  ease: 'easeInOut',
                }}
              >
                {phrase}
              </motion.span>
            </motion.div>
          )
        })}
      </div>

      <p className="max-w-lg text-black">
        As people lose everyday contact with the natural world, their innate
        affinity for it fades — weakening the will to protect what remains,
        and leaving even less nature to encounter. The cycle feeds itself.
      </p>

      <div className="mt-8 w-full max-w-lg border-t border-sage-300 pt-10 text-left">
        <p className="mb-6 text-sm leading-relaxed text-black">
          The Environmental Memory Exchange is a collective directory of the world's natural sounds.
        </p>
        <p className="mb-6 text-sm leading-relaxed text-black">
          It began as a direct response to the extinction of experience — a term for how we slowly
          lose our connection to nature as we spend more time in urban spaces and digital
          environments.
        </p>
        <p className="mb-6 text-sm leading-relaxed text-black">
          In modern cities, constant traffic and background noise crowd out the landscape, causing
          us to lose our ability to truly listen to the living world.
        </p>
        <p className="mb-6 text-sm leading-relaxed text-black">
          This directory directly addresses that isolation by creating a physical and digital space
          where anyone can pause, reconnect, and tune back into the environment.
        </p>
        <p className="mb-10 text-sm leading-relaxed text-black">
          It is also part of a larger citizen science platform. All entries provide critical
          acoustic data used to track ecosystem health, wildlife presence, and environmental shifts
          in real time.
        </p>

        <h2 className="mb-4 font-display text-xl text-black">How to Listen &amp; Contribute</h2>
        <p className="text-sm leading-relaxed text-black">
          Every recording in this directory was left by a stranger for a stranger. If you notice
          interesting soundscapes in your area — whether it is a specific bird status, a weather
          event, or a water current — you can record and share it to become part of the directory.
        </p>
      </div>
    </main>
  )
}
