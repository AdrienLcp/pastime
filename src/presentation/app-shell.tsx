import type React from 'react'

import { ShellNotices } from './shell-notices'

import './app-shell.sass'

type AppShellProps = {
  children: React.ReactNode
}

/** The booklet's page every screen is printed on, the app's notices above it. */
export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className='app-shell'>
    <div className='notices'>
      <ShellNotices />
    </div>
    {children}
  </div>
)
