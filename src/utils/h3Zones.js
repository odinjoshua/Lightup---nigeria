import { latLngToCell, cellToBoundary } from 'h3-js';

// Resolution 10 hexagons have an edge length of ~65m and an area of
// roughly 0.015 km^2 — small enough to keep adjacent streets in a town
// like Agbor separated without too many collisions. If your zones are
// closer together than ~100m apart, bump this up (smaller hexagons).
export const H3_RESOLUTION = 10;

/**
 * Assigns each zone to its own H3 cell so that no two zones' shapes on
 * the map can ever overlap — the same idea Uber uses for non-overlapping
 * spatial indexing.
 *
 * If two zones' coordinates are close enough to land in the same cell,
 * the later one is pushed to a finer resolution (smaller hexagon) until
 * it lands in a cell nobody else has claimed, up to `maxResolutionBump`
 * extra levels.
 */
export function assignH3Cells(zones, baseResolution = H3_RESOLUTION, maxResolutionBump = 4) {
  const claimedCells = new Map(); // h3Index -> zone.id

  return zones.map((zone) => {
    let resolution = baseResolution;
    let cell = latLngToCell(zone.lat, zone.lng, resolution);
    let bump = 0;

    while (claimedCells.has(cell) && bump < maxResolutionBump) {
      resolution += 1;
      cell = latLngToCell(zone.lat, zone.lng, resolution);
      bump += 1;
    }

    if (claimedCells.has(cell)) {
      console.warn(
        `Zone "${zone.name}" (id ${zone.id}) could not be separated from zone id ` +
        `${claimedCells.get(cell)} even at resolution ${resolution}. Their coordinates ` +
        `may be too close together — consider adjusting the source lat/lng.`
      );
    }

    claimedCells.set(cell, zone.id);
    return { ...zone, h3Index: cell, h3Resolution: resolution };
  });
}

/**
 * Returns the [lat, lng] boundary ring for a zone's H3 cell, ready to
 * hand straight to react-leaflet's <Polygon positions={...} />.
 */
export function getZoneBoundary(zone) {
  return cellToBoundary(zone.h3Index);
}