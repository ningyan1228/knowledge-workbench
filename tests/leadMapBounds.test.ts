import { describe, expect, it } from 'vitest'
import { leadsInMapBounds } from '../src/lib/leadMapBounds'

const points = [
  { id: 'mexico', latitude: 19.4, longitude: -99.1 },
  { id: 'italy', latitude: 45.5, longitude: 9.2 },
  { id: 'us', latitude: 40, longitude: -83 },
  { id: 'east', latitude: 0, longitude: 179 },
  { id: 'west', latitude: 0, longitude: -179 },
]

describe('map viewport customer scope', () => {
  it('shows only customers inside the viewport without changing the source or sort order', () => {
    const result = leadsInMapBounds(points, { south: 18, west: -100, north: 20, east: -98 })
    expect(result.map((point) => point.id)).toEqual(['mexico'])
    expect(points).toHaveLength(5)
    expect(leadsInMapBounds(points, { south: 10, west: -120, north: 50, east: 20 }).map((point) => point.id)).toEqual(['mexico', 'italy', 'us'])
  })
  it('keeps edge locations visible and handles an empty viewport', () => {
    expect(leadsInMapBounds(points, { south: 19.4, west: -99.1, north: 19.4, east: -99.1 })).toEqual([points[0]])
    expect(leadsInMapBounds(points, { south: -50, west: 50, north: -40, east: 60 })).toEqual([])
    expect(leadsInMapBounds([], { south: -50, west: 50, north: -40, east: 60 })).toEqual([])
  })
  it('supports date-line wrapping and unwrapped Leaflet longitudes', () => {
    const expected = [points[3], points[4]]
    expect(leadsInMapBounds(points, { south: -10, west: 170, north: 10, east: -170 })).toEqual(expected)
    expect(leadsInMapBounds(points, { south: -10, west: 170, north: 10, east: 190 })).toEqual(expected)
    expect(leadsInMapBounds(points, { south: -10, west: -190, north: 10, east: -170 })).toEqual(expected)
  })
  it('supports the world overview, missing bounds, and invalid coordinates', () => {
    expect(leadsInMapBounds(points, null)).toBe(points)
    expect(leadsInMapBounds(points, { south: -85, west: -180, north: 85, east: 180 })).toEqual(points)
    expect(leadsInMapBounds([...points, { id: 'invalid', latitude: NaN, longitude: 0 }], { south: -85, west: -180, north: 85, east: 180 })).toEqual(points)
  })
})
