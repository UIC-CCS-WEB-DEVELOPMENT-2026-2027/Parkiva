import { useEffect, useMemo, useState } from 'react'
import './ParkingFavorites.css'
import { getDemoStorage, isDemoStorageEvent } from './demoAccounts'
import { DEMO_DATA_EVENT, notifyDemoDataChanged } from './mockSlotState'

const STORAGE_KEY = 'parkiva-saved-parking-ids'

function readSavedIds(storage) {
  try {
    const stored = storage?.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id) => typeof id === 'string'))] : []
  } catch {
    return []
  }
}

/**
 * Props:
 * - parkingAreas: the existing parking records, each with a unique string `id`.
 * - onSavedIdsChange (optional): called with the saved IDs after they change.
 * - onFilteredAreasChange (optional): called with the current visible records.
 * - renderParkingArea (optional): render prop for a listing card; receives
 *   (area, { saved, onToggleSaved }).
 *
 * Use the exported useParkingFavorites hook in a listing owner to put save
 * buttons directly on its cards and apply saved-only filtering there.
 */
export function useParkingFavorites(parkingAreas = [], { ready = true } = {}) {
  // AccountWorkspace remounts this hook on role changes. Capture its namespace so
  // a delayed effect can never write old favorites into a newly selected account.
  const [storage] = useState(() => {
    try {
      return getDemoStorage()
    } catch {
      return null
    }
  })
  const [savedIds, setSavedIds] = useState(() => readSavedIds(storage))
  const validIds = useMemo(() => new Set(parkingAreas.map((area) => area.id)), [parkingAreas])

  // Drop IDs that no longer exist in the source parking data.
  const currentSavedIds = useMemo(
    () => savedIds.filter((id) => validIds.has(id)),
    [savedIds, validIds],
  )

  useEffect(() => {
    try {
      if (!storage || !ready) return
      const value = JSON.stringify(currentSavedIds)
      if (storage.getItem(STORAGE_KEY) !== value) {
        storage.setItem(STORAGE_KEY, value)
        notifyDemoDataChanged()
      }
    } catch {
      // Favorites remain usable for this page view when storage is unavailable.
    }
  }, [currentSavedIds, storage, ready])

  useEffect(() => {
    const sync = () => {
      const next = readSavedIds(storage)
      setSavedIds((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      )
    }
    const onStorage = (event) => {
      if (isDemoStorageEvent(event.key, STORAGE_KEY)) sync()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(DEMO_DATA_EVENT, sync)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(DEMO_DATA_EVENT, sync)
    }
  }, [storage])

  function toggleSaved(id) {
    if (!validIds.has(id)) return
    setSavedIds((previous) =>
      previous.includes(id) ? previous.filter((savedId) => savedId !== id) : [...previous, id],
    )
  }

  return { savedIds: currentSavedIds, toggleSaved }
}

export default function ParkingFavorites({
  parkingAreas = [],
  onSavedIdsChange,
  onFilteredAreasChange,
  renderParkingArea,
}) {
  const { savedIds, toggleSaved } = useParkingFavorites(parkingAreas)
  const [savedOnly, setSavedOnly] = useState(false)
  const savedIdSet = useMemo(() => new Set(savedIds), [savedIds])
  const visibleAreas = useMemo(
    () => (savedOnly ? parkingAreas.filter((area) => savedIdSet.has(area.id)) : parkingAreas),
    [parkingAreas, savedIdSet, savedOnly],
  )

  useEffect(() => {
    onSavedIdsChange?.(savedIds)
  }, [savedIds, onSavedIdsChange])

  useEffect(() => {
    onFilteredAreasChange?.(visibleAreas)
  }, [visibleAreas, onFilteredAreasChange])

  return (
    <section className="parking-favorites" aria-label="Parking favorites">
      <div className="parking-favorites-toolbar">
        <p className="parking-favorites-count" role="status">
          {savedIds.length} {savedIds.length === 1 ? 'parking area' : 'parking areas'} saved
        </p>
        <button
          className="parking-favorites-filter"
          type="button"
          aria-pressed={savedOnly}
          onClick={() => setSavedOnly((value) => !value)}
        >
          {savedOnly ? 'Show All' : 'Saved Only'}
        </button>
      </div>

      {savedOnly && visibleAreas.length === 0 ? (
        <p className="parking-favorites-empty">You haven’t saved any parking areas yet.</p>
      ) : renderParkingArea ? (
        <div className="parking-favorites-list">
          {visibleAreas.map((area) =>
            renderParkingArea(area, {
              saved: savedIdSet.has(area.id),
              onToggleSaved: () => toggleSaved(area.id),
            }),
          )}
        </div>
      ) : (
        <div
          className="parking-favorites-list"
          aria-label={savedOnly ? 'Saved parking areas' : 'Parking areas'}
        >
          {visibleAreas.map((area) => (
            <article className="parking-favorite-item" key={area.id}>
              <div>
                <h2>{area.name}</h2>
                <p>{area.location}</p>
              </div>
              <button
                className="parking-favorite-save"
                type="button"
                aria-pressed={savedIdSet.has(area.id)}
                onClick={() => toggleSaved(area.id)}
              >
                {savedIdSet.has(area.id) ? 'Unsave' : 'Save'}
                <span className="parking-favorites-sr-only"> {area.name}</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
