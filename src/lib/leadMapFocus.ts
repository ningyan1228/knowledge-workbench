type ScreenRect = { left: number; top: number; width: number; height: number }

/** Place a selected company in the map area still visible beside the detail drawer. */
export function leadMapFocusAnchor(map: ScreenRect, viewport: { width: number; height: number }, drawer?: ScreenRect | null): [number, number] {
  if (map.width <= 0 || map.height <= 0) return [.5, .5]
  const left = Math.max(0, map.left), top = Math.max(0, map.top)
  let right = Math.min(viewport.width, map.left + map.width)
  const bottom = Math.min(viewport.height, map.top + map.height)
  if (drawer && drawer.top < bottom && drawer.top + drawer.height > top && drawer.left + drawer.width > left) right = Math.min(right, drawer.left)
  // On a phone the drawer covers the whole map; center normally for when it closes.
  if (right - left < 96 || bottom - top < 96) return [.5, .5]
  return [((left + right) / 2 - map.left) / map.width, ((top + bottom) / 2 - map.top) / map.height]
}
