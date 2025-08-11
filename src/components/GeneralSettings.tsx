import { FormField, Select, Input } from '../design-system'
import {
  useSettingsStore,
  type NavPosition,
  type AnimationStyle,
  type ThemeMode,
  type ButtonVariant,
} from '../settingsStore'

export default function GeneralSettings() {
  const {
    navPosition,
    setNavPosition,
    theme,
    setTheme,
    navBgColorLight,
    setNavBgColorLight,
    navBgColorDark,
    setNavBgColorDark,
    navBgOpacityLight,
    setNavBgOpacityLight,
    navBgOpacityDark,
    setNavBgOpacityDark,
    navCornerRadius,
    setNavCornerRadius,
    navShadowColorLight,
    setNavShadowColorLight,
    navShadowColorDark,
    setNavShadowColorDark,
    navShadowOpacityLight,
    setNavShadowOpacityLight,
    navShadowOpacityDark,
    setNavShadowOpacityDark,
    navHideDelay,
    setNavHideDelay,
    navAnimationDuration,
    setNavAnimationDuration,
    navAnimationStyle,
    setNavAnimationStyle,
    navButtonVariant,
    setNavButtonVariant,
    navActiveButtonVariant,
    setNavActiveButtonVariant,
  } = useSettingsStore()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Navbar position" htmlFor="nav-position">
        <Select
          value={navPosition}
          onChange={e => setNavPosition(e.target.value as NavPosition)}
        >
          <option value="bottom">Bottom</option>
          <option value="top">Top</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </Select>
      </FormField>

      <FormField label="Theme" htmlFor="theme-mode">
        <Select value={theme} onChange={e => setTheme(e.target.value as ThemeMode)}>
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
      </FormField>

      <FormField label="Navbar color (light)" htmlFor="nav-color-light">
        <input
          type="color"
          value={navBgColorLight}
          onChange={e => setNavBgColorLight(e.target.value)}
        />
      </FormField>

      <FormField label="Navbar opacity (light)" htmlFor="nav-opacity-light">
        <Input
          type="number"
          step={0.1}
          min={0}
          max={1}
          value={navBgOpacityLight}
          onChange={e => setNavBgOpacityLight(parseFloat(e.target.value))}
        />
      </FormField>

      <FormField label="Navbar color (dark)" htmlFor="nav-color-dark">
        <input
          type="color"
          value={navBgColorDark}
          onChange={e => setNavBgColorDark(e.target.value)}
        />
      </FormField>

      <FormField label="Navbar opacity (dark)" htmlFor="nav-opacity-dark">
        <Input
          type="number"
          step={0.1}
          min={0}
          max={1}
          value={navBgOpacityDark}
          onChange={e => setNavBgOpacityDark(parseFloat(e.target.value))}
        />
      </FormField>

      <FormField label="Navbar corner radius" htmlFor="nav-radius">
        <Input
          type="number"
          min={0}
          value={navCornerRadius}
          onChange={e => setNavCornerRadius(parseInt(e.target.value, 10))}
        />
      </FormField>

      <FormField label="Navbar shadow color (light)" htmlFor="nav-shadow-color-light">
        <input
          type="color"
          value={navShadowColorLight}
          onChange={e => setNavShadowColorLight(e.target.value)}
        />
      </FormField>

      <FormField label="Navbar shadow opacity (light)" htmlFor="nav-shadow-opacity-light">
        <Input
          type="number"
          step={0.1}
          min={0}
          max={1}
          value={navShadowOpacityLight}
          onChange={e =>
            setNavShadowOpacityLight(parseFloat(e.target.value))
          }
        />
      </FormField>

      <FormField label="Navbar shadow color (dark)" htmlFor="nav-shadow-color-dark">
        <input
          type="color"
          value={navShadowColorDark}
          onChange={e => setNavShadowColorDark(e.target.value)}
        />
      </FormField>

      <FormField label="Navbar shadow opacity (dark)" htmlFor="nav-shadow-opacity-dark">
        <Input
          type="number"
          step={0.1}
          min={0}
          max={1}
          value={navShadowOpacityDark}
          onChange={e =>
            setNavShadowOpacityDark(parseFloat(e.target.value))
          }
        />
      </FormField>

      <FormField label="Navbar hide delay (ms)" htmlFor="nav-hide-delay">
        <Input
          type="number"
          min={0}
          value={navHideDelay}
          onChange={e => setNavHideDelay(parseInt(e.target.value, 10))}
        />
      </FormField>

      <FormField label="Navbar animation duration (ms)" htmlFor="nav-anim-duration">
        <Input
          type="number"
          min={0}
          value={navAnimationDuration}
          onChange={e => setNavAnimationDuration(parseInt(e.target.value, 10))}
        />
      </FormField>

      <FormField label="Navbar animation style" htmlFor="nav-anim-style">
        <Select
          value={navAnimationStyle}
          onChange={e => setNavAnimationStyle(e.target.value as AnimationStyle)}
        >
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="both">Both</option>
        </Select>
      </FormField>

      <FormField label="Navbar button style" htmlFor="nav-button-variant">
        <Select
          value={navButtonVariant}
          onChange={e => setNavButtonVariant(e.target.value as ButtonVariant)}
        >
          <option value="ghost">Ghost</option>
          <option value="soft">Soft</option>
          <option value="surface">Surface</option>
          <option value="outline">Outline</option>
          <option value="solid">Solid</option>
        </Select>
      </FormField>

      <FormField
        label="Active navbar button style"
        htmlFor="nav-active-button-variant"
      >
        <Select
          value={navActiveButtonVariant}
          onChange={e =>
            setNavActiveButtonVariant(e.target.value as ButtonVariant)
          }
        >
          <option value="ghost">Ghost</option>
          <option value="soft">Soft</option>
          <option value="surface">Surface</option>
          <option value="outline">Outline</option>
          <option value="solid">Solid</option>
        </Select>
      </FormField>
    </div>
  )
}
