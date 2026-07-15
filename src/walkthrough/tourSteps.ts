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
// skip ahead) except the very last one. Copy stays short: this runs on a
// tablet where the prompt card can't cover the thing being demoed.
//
// Getting back to the homepage is never automatic — jumping the visitor
// there mid-tour was disorienting. Instead a step highlights the back arrow
// on the current page and waits for them to tap it themselves; the next
// step then just waits on the homepage for the follow-up tap.
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'nav-contribute',
    route: '/home',
    target: 'nav-contribute',
    title: 'Add a recording',
    body: 'Tap Contribute to add a sound.',
  },
  {
    id: 'contribute-add',
    route: '/contribute',
    target: 'mock-upload-btn',
    title: 'Add a recording',
    body: 'Tap "Add mock data" to simulate a Hampstead Heath recording.',
  },
  {
    id: 'contribute-upload',
    route: '/contribute',
    target: 'upload-btn',
    title: 'Upload it',
    body: 'Tap "Upload Recording" to send it in.',
  },
  {
    id: 'contribute-submitted',
    route: '/contribute',
    target: 'upload-zone',
    title: 'Queued for review',
    body: "Numbers are assigned from each recording's coordinates.",
  },
  {
    id: 'contribute-phonebook',
    route: '/contribute',
    target: 'phonebook-new-entry',
    title: "It's in the Phonebook",
    body: "51560, Hampstead Heath. Tap it to hear it.",
  },
  {
    id: 'contribute-back',
    route: '/contribute',
    target: 'back-button',
    title: 'Head back',
    body: 'Tap the arrow to return to the Exchange.',
  },
  {
    id: 'nav-listen',
    route: '/home',
    target: 'nav-listen',
    title: 'Find it again',
    body: 'Tap Listen.',
  },
  {
    id: 'listen-dial',
    route: '/listen',
    target: 'rotary-dial',
    title: 'Dial it in',
    body: 'Dial 51560, it plays Hampstead Heath.',
    cardPlacement: 'top',
  },
  {
    id: 'listen-back',
    route: '/listen',
    target: 'back-button',
    title: 'Head back',
    body: 'Tap the arrow to return to the Exchange.',
  },
  {
    id: 'nav-explore',
    route: '/home',
    target: 'nav-explore',
    title: 'Find it on the map',
    body: 'Tap Explore.',
  },
  {
    id: 'explore-map',
    route: '/explore',
    target: 'explore-pin-51560',
    title: 'Find it on the map',
    body: 'Tap the pin for Hampstead Heath.',
  },
  {
    id: 'explore-back',
    route: '/explore',
    target: 'back-button',
    title: 'Head back',
    body: 'Tap the arrow to return to the Exchange.',
  },
  {
    id: 'nav-data',
    route: '/home',
    target: 'nav-data',
    title: 'View the data',
    body: 'Tap Data.',
  },
  {
    id: 'data-analysis',
    route: '/data',
    target: 'data-row-51560',
    title: 'View the data',
    body: 'Tap "analysis" on Hampstead Heath to view its spectrogram.',
  },
  {
    id: 'data-back',
    route: '/data',
    target: 'back-button',
    title: 'Head back',
    body: 'Tap the arrow to return to the Exchange.',
  },
  {
    id: 'finish',
    route: '/home',
    title: "That's the tour",
    body: 'Explore freely from here.',
  },
]
