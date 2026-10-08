import type React from 'react'

import { Switch } from './switch'

import './setting-switch.sass'

type SettingSwitchProps = {
  label: string
  /** What the setting does, in a sentence under its name. */
  prose: string
  isOn: boolean
  onChange: (isOn: boolean) => void
}

/** A named setting and the printed box its knob slides across. */
export const SettingSwitch: React.FC<SettingSwitchProps> = ({
  isOn,
  label,
  onChange,
  prose
}) => (
  <Switch className='setting-switch' isSelected={isOn} onChange={onChange}>
    <span className='switch-text'>
      <span className='switch-label'>{label}</span>
      <span className='switch-prose'>{prose}</span>
    </span>
    <span aria-hidden='true' className='switch-track'>
      <span className='switch-knob' />
    </span>
  </Switch>
)
