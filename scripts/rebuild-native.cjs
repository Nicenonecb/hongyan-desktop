#!/usr/bin/env node

async function main() {
  const electronPkg = require('electron/package.json')
  const { rebuild } = await import('@electron/rebuild')

  await rebuild({
    buildPath: process.cwd(),
    electronVersion: electronPkg.version,
    force: true,
    onlyModules: ['better-sqlite3'],
  })
}

main().catch((error) => {
  console.error('Failed to rebuild native modules:', error)
  process.exit(1)
})
