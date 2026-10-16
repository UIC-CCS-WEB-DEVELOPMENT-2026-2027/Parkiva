# ParkingFavorites integration

`ParkingFavorites` accepts the existing `parkingAreas` array from `parkingData.js`; it does not define a second parking dataset. Each item needs its existing unique string `id`, and the default row also displays `name` and `location`.

```jsx
<ParkingFavorites
  parkingAreas={parkingAreas}
  onSavedIdsChange={(ids) => setSavedIds(ids)}
  onFilteredAreasChange={(areas) => setVisibleAreas(areas)}
  renderParkingArea={(area, { saved, onToggleSaved }) => (
    <ParkingCard
      key={area.id}
      area={area}
      saved={saved}
      onToggleSaved={onToggleSaved}
    />
  )}
/>
```

The optional `renderParkingArea` receives an area and `{ saved, onToggleSaved }`, so the listing owner can reuse its existing card UI. The component provides the saved-only toggle, saved count, persistence, and empty state when the saved-only list is empty.

For a listing that keeps its own card rendering, use the exported `useParkingFavorites(parkingAreas)` hook. It returns `{ savedIds, toggleSaved }`; mark a card saved with `savedIds.includes(area.id)` and call `toggleSaved(area.id)` from its button. Filter the listing with `savedIds` when the listing's saved-only mode is active.

Saved IDs use the `parkiva-saved-parking-ids` localStorage key. Invalid JSON, non-array values, non-string entries, unavailable storage, and IDs absent from the current parking data are handled safely.
