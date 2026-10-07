import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps
} from 'react-aria-components'

import type { PressVariant } from './press-variant'

import './pressable.sass'

export type LinkProps = AriaLinkProps & {
  variant?: PressVariant
}

export const Link: React.FC<LinkProps> = ({
  className,
  variant = 'bare',
  ...props
}) => (
  <AriaLink
    {...props}
    className={composeClassName(className, 'pressable', variant)}
  />
)
