import type React from 'react'

import { BackIcon } from './icons'
import { Link } from './link'

import './page-head.sass'

type PageHeadProps = {
  /** Where the arrow leads: the list of games. */
  backHref: string
  backLabel: string
  title: string
}

/** A page's own head, off the hub: the way back, its title, a heavy rule beneath. */
export const PageHead: React.FC<PageHeadProps> = ({
  backHref,
  backLabel,
  title
}) => (
  <header className='page-head'>
    <Link aria-label={backLabel} className='page-back' href={backHref}>
      <BackIcon aria-hidden='true' />
    </Link>
    <h1 className='page-title'>{title}</h1>
  </header>
)
