import type React from 'react'

import { Colophon } from './colophon'

import './app-shell.sass'

type AppShellProps = {
  children: React.ReactNode
}

/** The booklet's page every screen is printed on, its colophon at the foot. */
export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className='app-shell'>
    {children}
    <Colophon />
  </div>
)
