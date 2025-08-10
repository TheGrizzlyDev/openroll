import { FormField, Select } from '../design-system'
import { useSettingsStore, type NavPosition } from '../settingsStore'

export default function GeneralSettings() {
  const navPosition = useSettingsStore(state => state.navPosition)
  const setNavPosition = useSettingsStore(state => state.setNavPosition)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Navbar position" htmlFor="nav-position">
        <Select
          id="nav-position"
          value={navPosition}
          onChange={e => setNavPosition(e.target.value as NavPosition)}
        >
          <option value="bottom">Bottom</option>
          <option value="top">Top</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </Select>
      </FormField>
    </div>
  )
}
