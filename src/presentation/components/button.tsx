import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps
} from 'react-aria-components'

import type { PressVariant } from './press-variant'

import './pressable.sass'

export type ButtonProps = AriaButtonProps & {
  variant?: PressVariant
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'bare',
  ...props
}) => (
  <AriaButton
    {...props}
    className={composeClassName(className, 'pressable', variant)}
  />
)
