import { Label, Radio, RadioGroup } from 'react-aria-components'

import './segmented-choice.sass'

type SegmentedChoiceProps<Value extends string> = {
  label: string
  options: readonly { value: Value; label: string }[]
  value: Value
  onChange: (value: Value) => void
}

/** A few printed tabs side by side, one pressed: the theme, the language, a size. */
export const SegmentedChoice = <Value extends string>({
  label,
  onChange,
  options,
  value
}: SegmentedChoiceProps<Value>) => (
  <RadioGroup
    className='segmented-choice'
    onChange={(picked) => {
      const option = options.find((candidate) => candidate.value === picked)
      if (option !== undefined) onChange(option.value)
    }}
    orientation='horizontal'
    value={value}
  >
    <Label className='segmented-label'>{label}</Label>
    <div className='segmented-options'>
      {options.map((option) => (
        <Radio
          className='segmented-option'
          key={option.value}
          value={option.value}
        >
          {option.label}
        </Radio>
      ))}
    </div>
  </RadioGroup>
)
