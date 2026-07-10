import { useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { phonebook, type PhonebookEntry } from '../data/phonebook'
import { parseCoordinates } from '../utils/geo'
import BackButton from '../components/BackButton'
import PhonebookPanel from '../components/PhonebookPanel'

const LONDON_CENTER: [number, number] = [51.5074, -0.1278]

const pinIcon = L.divIcon({
  className: '',
  html: '<span style="display:block;width:10px;height:10px;background:#c9421b;border:1px solid #ffffff;"></span>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
  popupAnchor: [0, -6],
})

type View = 'map' | 'phonebook'

const toggleButtonClass = (active: boolean) =>
  `border px-5 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
    active
      ? 'border-ember-500 text-ember-500'
      : 'border-sage-400 text-black hover:border-ember-400 hover:text-ember-500'
  }`

export default function Explore() {
  const [view, setView] = useState<View>('map')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  function handlePlay(entry: PhonebookEntry) {
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
    <main className="flex min-h-screen flex-col bg-white px-6 py-6 text-black lg:px-10 lg:py-8">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

      <BackButton />

      <div className="flex items-center justify-end gap-4">
        <div className="flex">
          <button
            type="button"
            onClick={() => setView('map')}
            aria-pressed={view === 'map'}
            className={toggleButtonClass(view === 'map')}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setView('phonebook')}
            aria-pressed={view === 'phonebook'}
            className={`border-l-0 ${toggleButtonClass(view === 'phonebook')}`}
          >
            Phonebook
          </button>
        </div>
      </div>

      {view === 'map' ? (
        <div className="mt-6 h-[calc(100vh-8rem)] overflow-hidden border border-sage-300">
          <MapContainer center={LONDON_CENTER} zoom={10} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {phonebook.map((entry) => (
              <Marker
                key={entry.dialCode}
                position={parseCoordinates(entry.coordinates)}
                icon={pinIcon}
              >
                <Popup>
                  <p className="font-display text-base">{entry.title}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-black">
                    {entry.place} &middot; {entry.dialCode}
                  </p>
                  <button
                    type="button"
                    onClick={() => handlePlay(entry)}
                    className="mt-2 border border-sage-400 px-3 py-1 text-xs uppercase tracking-[0.2em] transition hover:border-ember-400 hover:text-ember-500"
                  >
                    {playingId === entry.dialCode ? 'Stop' : 'Play'}
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="mt-6 flex-1 overflow-y-auto">
          <PhonebookPanel />
        </div>
      )}
    </main>
  )
}
