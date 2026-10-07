import { globSync, readFileSync } from 'node:fs'

import { findUnitFailures } from '@adrienlcp/styles/audit'
import { describe, expect, it } from 'vitest'

const STYLESHEETS = globSync('src/**/*.{sass,css}')

describe.each(STYLESHEETS)('%s', (path) => {
  const stylesheet = readFileSync(path, 'utf8')

  it('sizes text and spacing in rem', () => {
    expect(findUnitFailures(stylesheet)).toEqual([])
  })
})
