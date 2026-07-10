// One-off generator: copies recordings from the master library into
// public/audio under coordinate-derived "dialable numbers", and writes
// src/data/phonebook.ts + src/data/rename-manifest.json from a single
// source-of-truth ENTRIES list.
//
// Number scheme (matches src/pages/Contribute.tsx):
//   dialCode = first 5 digits of |latitude|, decimal point removed
//   filename = "<dialCode><ext>"

import { copyFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const MASTER_DIR =
  'c:\\Users\\banaq\\OneDrive\\01_IDE\\02_IDE 2\\02_Solo Y\\03_Validated Delivery\\recordings'
const ROOT = path.resolve(import.meta.dirname, '..')
const AUDIO_DIR = path.join(ROOT, 'public', 'audio')
const DATA_DIR = path.join(ROOT, 'src', 'data')

const CATEGORY_ORDER = [
  'Birdsong',
  'Water',
  'Weather',
  'Markets & Crowds',
  'Transit',
  'After Dark',
  'Trunk Calls',
]

// lat/lon stored as signed decimal degrees.
const ENTRIES = [
  // ─── Birdsong ──────────────────────────────────────────────────────────
  {
    category: 'Birdsong',
    originalFile: '243054__klankbeeld__seagulls-in-city-140719_00.wav',
    title: 'Gulls Over the Pool',
    place: 'St Katharine Docks',
    lat: 51.5055, lon: -0.0754,
    note: 'Herring gulls wheeling above the dock basin',
    date: '14 Jul 2019',
  },
  {
    category: 'Birdsong',
    originalFile: '259983__lwdickens__forest-ambience-crazed-chipmunk-and-loons-on-lake.wav',
    title: 'The Broad at First Light',
    place: 'Hickling Broad, Norfolk Broads',
    lat: 52.7370, lon: 1.5820,
    note: "A loon's cry carries flat across still water",
    date: 'date',
    memory:
      "I got there before the mist lifted. For a long while there was nothing but the slap of water against the reeds. Then that loon's call, somewhere out on the broad, like a question nobody answered. I didn't move for twenty minutes.",
  },
  {
    category: 'Birdsong',
    originalFile: '779230__yannsauvin__birds-in-cage-in-clissold-park-london-day.wav',
    title: 'Aviary, Clissold Park',
    place: 'Clissold Park, Stoke Newington',
    lat: 51.5614, lon: -0.0875,
    note: 'Caged finches answer the wild ones outside',
    date: '2 Sep 2025',
  },
  {
    category: 'Birdsong',
    originalFile: '798179__vizaion__park-day-birds-london-2oa-spatial-audio.wav',
    title: 'Battersea, Midday Chorus',
    place: 'Battersea Park',
    lat: 51.4791, lon: -0.1567,
    note: 'Spatial recording: pigeons, robins, distant parakeets',
    date: '18 Apr 2026',
    memory:
      "The wood pigeons were doing their slow, patient thing, and then a flash of green tore through: ring-necked parakeets, three of them, screeching like they owned the place. Which, by now, they sort of do.",
  },
  {
    category: 'Birdsong',
    originalFile: '800949__iscence__birds-at-hampstead-heath.wav',
    title: 'Hampstead Heath, Dawn Chorus',
    place: 'Hampstead Heath',
    lat: 51.5607, lon: -0.1660,
    note: 'Robins and wrens before the joggers arrive',
    date: '22 Mar 2025',
    memory:
      "Up before six, frost still on the grass. The chorus builds in layers, robin first, then wren, then everything at once, and for about four minutes the whole heath sounds like it's arguing with itself. Then a jogger goes past and it's just birds again.",
  },
  {
    category: 'Birdsong',
    originalFile: '835517__kanny100__blackbird_alarm_nk.wav',
    title: 'Blackbird, Alarm Call',
    place: 'A back garden, Walthamstow',
    lat: 51.5847, lon: -0.0145,
    note: 'A cat in the hedge, by the sound of it',
    date: '9 Jun 2025',
  },
  {
    category: 'Birdsong',
    originalFile: '844954__taranliberation__undergrowth.wav',
    title: 'Epping Forest, Undergrowth',
    place: 'Epping Forest',
    lat: 51.6500, lon: 0.0280,
    note: 'Rustling leaf litter, a woodpecker close by',
    date: 'date',
  },
  {
    category: 'Birdsong',
    originalFile: '854512__klankbeeld__birds-wind-forest-naturpark-our-luxembourg-1113-am-260516_1194.flac',
    title: 'Epping Forest, Windfall',
    place: 'Epping Forest',
    lat: 51.6512, lon: 0.0283,
    note: 'Wind through beech canopy, finches scattering',
    date: 'date',
  },
  {
    category: 'Birdsong',
    originalFile: '581779__theworldofsound__waves-and-seagulls.wav',
    title: 'St Ives, Outgoing Tide',
    place: 'St Ives, Cornwall',
    lat: 50.0996, lon: -5.4790,
    note: 'Gulls follow the tide line, waves behind',
    date: 'date',
  },

  // ─── Water ─────────────────────────────────────────────────────────────
  {
    category: 'Water',
    originalFile: '484252__graudio__hyde-park-serpentine.wav',
    title: 'The Serpentine',
    place: 'The Serpentine, Hyde Park',
    lat: 51.5047, lon: -0.1654,
    note: 'Pedalos, ducks, and a distant ice-cream van',
    date: '30 Jun 2025',
    memory:
      "Recorded from a bench by the boathouse. Someone's pedalo had a squeaky wheel and they went round and round past me about six times. I kept the squeak in. It felt more honest than cutting it.",
  },
  {
    category: 'Water',
    originalFile: '696686__loudernoises__babbling-brook-at-sentinel-dome.m4a',
    title: 'The Hampstead Ponds, Inflow',
    place: 'Hampstead Heath ponds',
    lat: 51.5589, lon: -0.1683,
    note: 'Where the chain of ponds feeds down the hill',
    date: '5 May 2026',
  },
  {
    category: 'Water',
    originalFile: '803672__cvltiv8r__fern-canyon-babbling-brook-in-the-redwoods-2.wav',
    title: 'Highgate Wood, the Stream Below',
    place: 'Highgate Wood',
    lat: 51.5723, lon: -0.1466,
    note: 'A hidden culvert, ferns thick on both banks',
    date: '11 Apr 2026',
  },
  {
    category: 'Water',
    originalFile: '830482__pnwheeler__water-flowing-across-sculpted-granite-channel.flac',
    title: "Regent's Canal, the Lock Cut",
    place: "Regent's Canal, Camden Lock",
    lat: 51.5350, lon: -0.1010,
    note: 'Water finding its level through the lock',
    date: '19 Aug 2025',
  },
  {
    category: 'Water',
    originalFile: '833490__eskvy__small-waterfall-london.wav',
    title: 'The Falls, Crystal Palace Park',
    place: 'Crystal Palace Park',
    lat: 51.4197, lon: -0.0712,
    note: 'An ornamental cascade, dinosaurs out of shot',
    date: '14 Feb 2026',
    memory:
      "The waterfall sits just round the corner from the old dinosaur sculptures. I like that you can hear the water but not see them, so for a second it could be anywhere. Then a child shouts 'IGUANODON' and you're back in Crystal Palace.",
  },
  {
    category: 'Water',
    originalFile: '855585__klankbeeld__waves-lapping-on-breakwater-sand-beach-and-wooden-boat-riverside-maas-bokhoven-netherlands-744-pm-250611_1126 (1).wav',
    title: 'Greenwich Reach, Low Tide',
    place: 'Thames foreshore, Greenwich',
    lat: 51.4826, lon: -0.0077,
    note: 'A moored boat knocks gently against the wall',
    date: 'date',
  },
  {
    category: 'Water',
    originalFile: '855747__klankbeeld__sunday-may-riverside-maas-bokhoven-netherlands-759-am-260524_0114.flac',
    title: 'Greenwich Reach, Sunday Morning',
    place: 'Thames foreshore, Greenwich',
    lat: 51.4831, lon: -0.0080,
    note: 'Church bells drift over from the far bank',
    date: 'date',
    memory:
      "Two recordings, the same stretch of foreshore, a fortnight apart. This one has bells in it and the other doesn't; otherwise I genuinely couldn't tell you which was which.",
  },
  {
    category: 'Water',
    originalFile: '165877__sonicport__stream6.wav',
    title: 'Watendlath Beck',
    place: 'Watendlath, Lake District',
    lat: 54.5040, lon: -3.1390,
    note: 'A fellside beck, swollen after rain',
    date: '3 Oct 2024',
  },
  {
    category: 'Water',
    originalFile: '827530__yevgverh__ocean_coast_04_092025_0659am.wav',
    title: 'St Ives, Before the Town Wakes',
    place: 'St Ives, Cornwall',
    lat: 50.1002, lon: -5.4793,
    note: '06:59, the harbour empty but for the tide',
    date: 'date',
    memory:
      "Set the alarm for an ungodly hour to catch the harbour before anyone else was up. 06:59 on the file. I checked twice. Just the tide, a halyard somewhere, and my own breathing, which I should probably have edited out.",
  },

  // ─── Weather ───────────────────────────────────────────────────────────
  {
    category: 'Weather',
    originalFile: '135821__cybergenic__amazon-soft-to-harder-rain-with-some-thunder.aiff',
    title: 'Storm Front, Peckham Rye',
    place: 'Peckham Rye',
    lat: 51.4630, lon: -0.0660,
    note: 'Rain building to a roll of thunder',
    date: '6 Aug 2025',
  },
  {
    category: 'Weather',
    originalFile: '483910__mick-gibbs__seattle-thunder-storm-9-7-2019-1.wav',
    title: 'Thunder Over Greenwich',
    place: 'Greenwich Park',
    lat: 51.4769, lon: 0.0005,
    note: 'Storm tracking up from the estuary',
    date: '7 Sep 2019',
  },
  {
    category: 'Weather',
    originalFile: '640631__ec36power__wind-before-rain.mp3',
    title: 'The Calm Before, Hackney Marshes',
    place: 'Hackney Marshes',
    lat: 51.5570, lon: -0.0390,
    note: 'Wind picks up; the first drops still minutes off',
    date: '11 Jul 2025',
  },
  {
    category: 'Weather',
    originalFile: '685618__misternormmedia__hail-in-the-city.wav',
    title: 'Hailstorm, Elephant & Castle',
    place: 'Elephant & Castle',
    lat: 51.4943, lon: -0.1000,
    note: 'Hail rattling on a bus shelter roof',
    date: '17 Jan 2026',
  },
  {
    category: 'Weather',
    originalFile: '211663__klankbeeld__city-wind-apartment-131224_01.flac',
    title: 'Wind in the Stairwell, New Cross',
    place: 'A flat above New Cross',
    lat: 51.4747, lon: -0.0350,
    note: 'December gusts find every gap in the frame',
    date: '13 Dec 2024',
  },
  {
    category: 'Weather',
    originalFile: '751933__klankbeeld__thunder-in-city-436-pm-240521_0726.flac',
    title: 'Thunder at Teatime, Brixton',
    place: 'Brixton',
    lat: 51.4613, lon: -0.1156,
    note: '4:36pm, the sky goes the colour of a bruise',
    date: '21 May 2024',
  },
  {
    category: 'Weather',
    originalFile: '354025__stondi__thunder-during-rainstorm-1.wav',
    title: 'Thunder Over Primrose Hill, I',
    place: 'Primrose Hill',
    lat: 51.5390, lon: -0.1607,
    note: 'A rumble somewhere over the city',
    date: 'date',
  },
  {
    category: 'Weather',
    originalFile: '732993__cask__huge-thunder-crack-xy.wav',
    title: 'Thunder Over Primrose Hill, II',
    place: 'Primrose Hill',
    lat: 51.5410, lon: -0.1610,
    note: 'One enormous crack, directly overhead',
    date: 'date',
  },
  {
    category: 'Weather',
    originalFile: '856487__tosha73__rain-the-sound-of-rain-on-the-outskirts-of-the-city.wav',
    title: 'Rain on the Marshes, I',
    place: 'Walthamstow Marshes',
    lat: 51.5683, lon: -0.0395,
    note: 'A grey afternoon settling in for the day',
    date: 'date',
  },
  {
    category: 'Weather',
    originalFile: '857691__yondertide__rain-downpour.m4a',
    title: 'Rain on the Marshes, II',
    place: 'Walthamstow Marshes',
    lat: 51.5705, lon: -0.0398,
    note: 'Heavier this time, a proper downpour',
    date: 'date',
  },
  {
    category: 'Weather',
    originalFile: '17144__lgarrett__lg-wind3.wav',
    title: 'Wind Off the North Sea, Bamburgh',
    place: 'Bamburgh, Northumberland',
    lat: 55.6080, lon: -1.7080,
    note: 'A steady gale, gulls riding it sideways',
    date: '6 Jan 2025',
  },
  {
    category: 'Weather',
    originalFile: '343448__rucisko__windy-weather.wav',
    title: 'Malham Cove, a Blustery Day',
    place: 'Malham, Yorkshire Dales',
    lat: 54.0610, lon: -2.1480,
    note: 'Wind funnelling up through the limestone',
    date: '2 Apr 2025',
  },
  {
    category: 'Weather',
    originalFile: '403051__teadrinker__wind_forest_08_strong_l_01.wav',
    title: 'New Forest, Storm in the Canopy',
    place: 'New Forest, Hampshire',
    lat: 50.8650, lon: -1.5800,
    note: 'Pines bending, branches creaking',
    date: '19 Nov 2024',
  },
  {
    category: 'Weather',
    originalFile: '515888__arnaud-coutancier__rainstorm-on-trees-birds.aiff',
    title: 'Dartmoor, Rain on the Tors',
    place: 'Dartmoor, Devon',
    lat: 50.5720, lon: -3.9170,
    note: 'Birds fall quiet as the rain thickens',
    date: '8 Sep 2025',
  },
  {
    category: 'Weather',
    originalFile: '522025__nimlos__three-mighty-thunders-in-row-200601.flac',
    title: 'Three Thunders, Edale',
    place: 'Edale, Peak District',
    lat: 53.3680, lon: -1.8130,
    note: 'Counted between flash and crash, close',
    date: '27 Jul 2025',
    memory:
      "Counted the gap between flash and crash out loud without meaning to. You can hear me on the recording getting to 'one' before the third one hit. Packed up shortly after that.",
  },

  // ─── Markets & Crowds ──────────────────────────────────────────────────
  {
    category: 'Markets & Crowds',
    originalFile: '263662__alcappuccino__london-street-drummers.mp3',
    title: 'Street Drummers, Covent Garden',
    place: 'Covent Garden',
    lat: 51.5117, lon: -0.1240,
    note: 'Buckets and pans, a crowd forming',
    date: '16 Aug 2025',
    memory:
      "Five-gallon buckets, upturned, and a kid who couldn't have been more than sixteen keeping perfect time. A crowd had gathered three-deep by the time I started recording. You can hear someone's coins land in the case partway through.",
  },
  {
    category: 'Markets & Crowds',
    originalFile: '347029__ianaces__london-afternoon-street-sounds.mp3',
    title: 'Oxford Street, Saturday',
    place: 'Oxford Street',
    lat: 51.5154, lon: -0.1410,
    note: 'Footfall, buses, a hundred conversations',
    date: '23 Nov 2024',
  },
  {
    category: 'Markets & Crowds',
    originalFile: '749484__klankbeeld__harbor-in-summer-0106-pm-240730_0867.ogg',
    title: 'St Katharine Docks, 1pm',
    place: 'St Katharine Docks',
    lat: 51.5067, lon: -0.0734,
    note: 'Halyards ticking against masts, lunchtime crowd',
    date: '30 Jul 2024',
  },
  {
    category: 'Markets & Crowds',
    originalFile: '844712__sounds_from_palestine__urban-ambience-with-passing-cars-and-birds-al-tireh-ramallah-palestine.wav',
    title: 'Walworth Road, Late Morning',
    place: 'Walworth Road, Southwark',
    lat: 51.4920, lon: -0.0940,
    note: 'Market stalls, traffic, sparrows in the gutter',
    date: '4 Mar 2026',
    memory:
      "Recorded with the phone in my coat pocket, walking slow. A stallholder shouting prices in three languages, a moped, sparrows fighting over a dropped chip. Ordinary Tuesday noise, the kind you stop hearing if you live here.",
  },

  // ─── Transit ───────────────────────────────────────────────────────────
  {
    category: 'Transit',
    originalFile: '262690__toybox__london-tube-ride.aiff',
    title: 'Northern Line, Angel to Old Street',
    place: 'Northern line',
    lat: 51.5322, lon: -0.1058,
    note: "Brakes, announcements, the doors' two-tone chime",
    date: '12 Jan 2026',
    memory:
      "Held the recorder low, against my knee, so it wouldn't look like I was filming anyone. The two-tone door chime always gets me. It's such a small sound to be so recognisable. Half of London could place it blindfolded.",
  },
  {
    category: 'Transit',
    originalFile: '798000__alexmilsom__birds-trains.wav',
    title: 'Wandsworth Common, Trackside',
    place: 'Wandsworth Common',
    lat: 51.4502, lon: -0.1660,
    note: 'A robin sings between passing trains',
    date: '27 May 2025',
  },
  {
    category: 'Transit',
    originalFile: '405503__mshahen__rain_thunder_birds_cars.wav',
    title: 'Rain on the North Circular',
    place: 'North Circular, Hanger Lane',
    lat: 51.5300, lon: -0.2940,
    note: 'Tyres on wet tarmac, a heron unbothered',
    date: '1 Oct 2025',
  },
  {
    category: 'Transit',
    originalFile: '846019__sounds_from_palestine__cedar-branch-percussive-texture-with-wind-and-distant-traffic.wav',
    title: 'Wormwood Scrubs, Windbreak',
    place: 'Wormwood Scrubs',
    lat: 51.5230, lon: -0.2380,
    note: 'A cedar branch knocks; the A40 hums beyond',
    date: '14 Dec 2025',
  },

  // ─── After Dark ────────────────────────────────────────────────────────
  {
    category: 'After Dark',
    originalFile: '129342__le_abbaye_noirlac__cricket-fly.aiff',
    title: 'Crickets, an Allotment in Walworth',
    place: 'Walworth allotments',
    lat: 51.4880, lon: -0.0930,
    note: 'A late-summer night, sheds creaking as they cool',
    date: '19 Aug 2024',
    memory:
      "A neighbour's shed roof was still ticking as it cooled when I started recording. You can hear it in the first few seconds, a soft metallic tap every so often. The crickets didn't care either way.",
  },
  {
    category: 'After Dark',
    originalFile: '348068__dobroide__20160616_night15.wav',
    title: 'Soho, 2am',
    place: 'Soho',
    lat: 51.5136, lon: -0.1318,
    note: 'The last bars closing; a distant siren',
    date: '16 Jun 2016',
    memory:
      "One of the oldest recordings in the archive. I remember the bouncer outside the bar opposite recognised what I was doing and lowered his voice for a bit, which rather defeated the point, but I left it in. It's part of the night too.",
  },
  {
    category: 'After Dark',
    originalFile: '32655__greysound__frogsandcrickets_excerptb_jma_24bit_48k.wav',
    title: 'Hickling Broad, After Dark',
    place: 'Hickling Broad, Norfolk Broads',
    lat: 52.7390, lon: 1.5824,
    note: 'Frogs and crickets take over once the birds settle',
    date: 'date',
  },

  // ─── Trunk Calls ───────────────────────────────────────────────────────
  {
    category: 'Trunk Calls',
    originalFile: '128845__greenmeat__banff-national-park.aiff',
    title: 'Banff, Alberta',
    place: 'Banff National Park, Canada',
    lat: 51.1784, lon: -115.5708,
    note: 'Wind through pine, a glacial river below',
    date: '30 Jul 2025',
  },
  {
    category: 'Trunk Calls',
    originalFile: '80081__daniele-salvati__tsukutsukuboshi-cicadas-kyoto.wav',
    title: 'Kyoto, Late Summer',
    place: 'Kyoto, Japan',
    lat: 35.0116, lon: 135.7681,
    note: 'Tsukutsukuboshi cicadas, summer ending',
    date: '28 Aug 2025',
    memory:
      "The tsukutsukuboshi only really get going once the bigger cicadas have worn themselves out for the day. There's a shift in the texture of the sound, almost a relief. A reminder that even somewhere this loud, things take turns.",
  },
  {
    category: 'Trunk Calls',
    originalFile: '504583__felixblume__village-in-the-mexican-desert-wadley.wav',
    title: 'Wadley, San Luis Potosí',
    place: 'Wadley, Mexico',
    lat: 23.6850, lon: -100.8870,
    note: 'A desert village waking: dogs, a distant radio',
    date: '11 Mar 2025',
  },
  {
    category: 'Trunk Calls',
    originalFile: '556988__enricoviets__arctic-breeeze-rig.wav',
    title: 'Svalbard, the Research Rig',
    place: 'Svalbard, Norway',
    lat: 78.2232, lon: 15.6469,
    note: 'Wind against equipment housing, nothing else for miles',
    date: '2 Feb 2026',
    memory:
      "Forty seconds of wind against a metal housing, and that's it. No birds, no water, nothing living that I could hear. I kept checking the meter to make sure the recorder hadn't just stopped.",
  },
  {
    category: 'Trunk Calls',
    originalFile: '253607__floating-tree__waves_washingthroughcoral.wav',
    title: 'The Reef, Outer Atoll, I',
    place: 'An atoll, Maldives',
    lat: 4.1755, lon: 73.5093,
    note: 'Waves washing through the coral at low tide',
    date: 'date',
  },
  {
    category: 'Trunk Calls',
    originalFile: '253607__floating-tree__waves_washingthroughcoral (1).wav',
    title: 'The Reef, Outer Atoll, II',
    place: 'An atoll, Maldives',
    lat: 4.1758, lon: 73.5097,
    note: 'The same reef, a different tide',
    date: 'date',
    memory:
      "Came back two days later hoping for the same stillness and got a stronger current instead. The coral sounds completely different under more water. Kept both recordings for exactly that reason.",
  },
]

// ─── derive computed fields ────────────────────────────────────────────────

mkdirSync(AUDIO_DIR, { recursive: true })

const seenDialCodes = new Set()
const manifest = []

const computed = ENTRIES.map((entry) => {
  const latStr = Math.abs(entry.lat).toFixed(4).replace('.', '')
  const dialCode = latStr.slice(0, 5)
  if (seenDialCodes.has(dialCode)) {
    throw new Error(`Duplicate dialCode ${dialCode} for "${entry.title}"`)
  }
  seenDialCodes.add(dialCode)

  const ext = path.extname(entry.originalFile)
  const audioFile = `${dialCode}${ext}`

  const latHem = entry.lat >= 0 ? 'N' : 'S'
  const lonHem = entry.lon >= 0 ? 'E' : 'W'
  const coordinates = `${Math.abs(entry.lat).toFixed(4)}° ${latHem}, ${Math.abs(entry.lon).toFixed(4)}° ${lonHem}`

  const srcPath = path.join(MASTER_DIR, entry.originalFile)
  const destPath = path.join(AUDIO_DIR, audioFile)
  if (!existsSync(srcPath)) {
    throw new Error(`Source file not found: ${srcPath}`)
  }
  copyFileSync(srcPath, destPath)

  manifest.push({
    originalFile: entry.originalFile,
    audioFile,
    place: entry.place,
    category: entry.category,
    dialCode,
    sourcePath: `recordings/${entry.originalFile}`,
    destPath: `Frontend/public/audio/${audioFile}`,
  })

  return {
    dialCode,
    title: entry.title,
    originalFile: entry.originalFile,
    audioFile,
    audioSrc: `/audio/${audioFile}`,
    place: entry.place,
    coordinates,
    date: entry.date,
    note: entry.note,
    category: entry.category,
    ...(entry.memory ? { memory: entry.memory } : {}),
  }
})

// ─── write outputs ──────────────────────────────────────────────────────────

writeFileSync(
  path.join(DATA_DIR, 'rename-manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
)

const tsHeader = `// Auto-generated source-of-truth data for the Phonebook page.
// Each entry's `+'`dialCode`'+` is derived from its `+'`coordinates`'+`: the first 5
// digits of the latitude with the decimal point removed. The renamed audio
// file under public/audio/ is "<dialCode><ext>". See rename-manifest.json
// for the original to renamed mapping.

export interface PhonebookEntry {
  dialCode: string
  title: string
  originalFile: string
  audioFile: string
  audioSrc: string
  place: string
  coordinates: string
  date: string
  note: string
  category: string
  memory?: string
}

export const CATEGORY_ORDER = ${JSON.stringify(CATEGORY_ORDER, null, 2)} as const

export const phonebook: PhonebookEntry[] = ${JSON.stringify(computed, null, 2)}
`

writeFileSync(path.join(DATA_DIR, 'phonebook.ts'), tsHeader)

console.log(`Wrote ${computed.length} entries.`)
console.log(`Audio copied to ${AUDIO_DIR}`)
