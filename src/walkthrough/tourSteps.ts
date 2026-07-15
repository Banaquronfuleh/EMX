export interface TourStep {
  id: string
  route: string
  target?: string
  title: string
  body: string
  /** Pin the prompt card to the top of the screen instead of positioning it
   *  next to the target — used when the target fills most of the page and a
   *  nearby card would sit on top of the thing the visitor needs to click. */
  cardPlacement?: 'auto' | 'top'
}

// Narrative: from the homepage, tap into Contribute (mock upload), watch a
// recording land in the Phonebook, then return to the homepage between each
// stop to tap into Listen, Explore, and Data, finding that same entry,
// 51560, Hampstead Heath, Dawn Chorus, along the way. Every step is gated on
// the visitor actually doing the thing it describes (there's no "Next" to
// skip ahead) except the very last one.
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'nav-contribute',
    route: '/home',
    target: 'nav-contribute',
    title: 'Add a recording',
    body: "Let's start by contributing a sound to the archive. Tap Contribute.",
  },
  {
    id: 'contribute-add',
    route: '/contribute',
    target: 'mock-upload-btn',
    title: 'Add a recording',
    body: 'Anyone can drag a recording in from their device. For today, tap "Add mock data" to simulate one from Hampstead Heath.',
  },
  {
    id: 'contribute-analyse',
    route: '/contribute',
    target: 'analyse-btn',
    title: 'Analyse the recording',
    body: 'Tap "Analyse Recording" to process the sound.',
  },
  {
    id: 'contribute-assigning',
    route: '/contribute',
    target: 'assigning-panel',
    title: 'Assigning a number',
    body: 'The archive maps the location and locks in a phonebook number. Watch it lock in.',
  },
  {
    id: 'contribute-phonebook',
    route: '/contribute',
    target: 'phonebook-new-entry',
    title: "It's in the Phonebook",
    body: 'Your recording appears instantly under Birdsong, marked NEW: 51560, Hampstead Heath, Dawn Chorus. Tap it to hear it.',
  },
  {
    id: 'nav-listen',
    route: '/home',
    target: 'nav-listen',
    title: 'Back to the Exchange',
    body: "That same recording now lives across the whole archive. Let's go find it. Tap Listen.",
  },
  {
    id: 'listen-dial',
    route: '/listen',
    target: 'rotary-dial',
    title: 'Dial it in',
    body: 'Dial any five holes on the rotary phone. This demo always plays back the Hampstead Heath recording.',
    cardPlacement: 'top',
  },
  {
    id: 'nav-explore',
    route: '/home',
    target: 'nav-explore',
    title: 'Find it on the map',
    body: 'It also shows up on the map. Tap Explore.',
  },
  {
    id: 'explore-map',
    route: '/explore',
    target: 'explore-pin-51560',
    title: 'Find it on the map',
    body: 'Here it is, Hampstead Heath. Tap the pin to see it.',
  },
  {
    id: 'nav-data',
    route: '/home',
    target: 'nav-data',
    title: 'View the data',
    body: 'Every recording feeds real acoustic data. Tap Data.',
  },
  {
    id: 'data-analysis',
    route: '/data',
    target: 'data-row-51560',
    title: 'View the data',
    body: 'Tap "analysis" on Hampstead Heath, Dawn Chorus to view its spectrogram.',
  },
  {
    id: 'finish',
    route: '/home',
    title: "That's the tour",
    body: "You're free to explore the rest of the archive from here.",
  },
]
