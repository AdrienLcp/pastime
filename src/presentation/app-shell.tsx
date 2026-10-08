import type React from 'react'

import './app-shell.sass'

type AppShellProps = {
  children: React.ReactNode
}

/** The booklet's page every screen is printed on. */
export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className='app-shell'>{children}</div>
)
