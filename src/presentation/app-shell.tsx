import type React from 'react'

import { ShellNotices } from './shell-notices'

import './app-shell.sass'

type AppShellProps = {
  children: React.ReactNode
}

/** The frame every page sits in: the app's notices above, the page below. */
export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className='app-shell'>
    <div className='notices'>
      <ShellNotices />
    </div>
    {children}
  </div>
)
