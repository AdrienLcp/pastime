import type React from 'react'

import { ShellNotices } from './shell-notices'
import { ThemeSwitch } from './theme/theme-switch'

import './app-shell.sass'

type AppShellProps = {
  children: React.ReactNode
}

/**
 * The booklet's page every screen is printed on: the app's notices above, the
 * page below, the colophon with the theme switch at the foot.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className='app-shell'>
    <div className='notices'>
      <ShellNotices />
    </div>
    {children}
    <footer className='colophon'>
      <ThemeSwitch />
    </footer>
  </div>
)
