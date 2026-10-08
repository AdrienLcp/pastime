import type React from 'react'
import { useLocation } from 'react-router'

const SITE_ORIGIN = 'https://pastime.adrienlcp.com'

/**
 * The address search engines file the current page under, hoisted by React
 * into the head. Rendered once, by the root route: every page names itself,
 * never the home page.
 */
export const DocumentCanonical: React.FC = () => {
  const { pathname } = useLocation()
  return <link href={`${SITE_ORIGIN}${pathname}`} rel='canonical' />
}
