// Parses coordinate strings of the form "51.5055° N, 0.0754° W" into signed
// decimal degrees as [latitude, longitude].
export function parseCoordinates(coords: string): [number, number] {
  const match = coords.match(
    /(-?\d+(?:\.\d+)?)\s*°?\s*([NSns]),\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EWew])/
  )

  if (!match) {
    throw new Error(`Unrecognised coordinate format: "${coords}"`)
  }

  const [, latRaw, latDir, lonRaw, lonDir] = match
  const lat = parseFloat(latRaw) * (latDir.toUpperCase() === 'S' ? -1 : 1)
  const lon = parseFloat(lonRaw) * (lonDir.toUpperCase() === 'W' ? -1 : 1)

  return [lat, lon]
}
