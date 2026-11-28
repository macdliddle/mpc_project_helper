import { readFile, writeFile } from 'node:fs/promises'

const bundlePaths = [
  'node_modules/mpc_api/dist/mpc_api.js',
  'node_modules/mpc_api/dist/mpc_api.cjs',
]

for (const path of bundlePaths) {
  const source = await readFile(path, 'utf8')
  const unboundFetchCount = source.match(/window\.fetch\)/g)?.length ?? 0

  if (unboundFetchCount === 0) {
    if (source.includes('window.fetch.bind(window)')) continue
    throw new Error(`Could not find the expected window.fetch initializer in ${path}`)
  }

  if (unboundFetchCount !== 1) {
    throw new Error(`Expected one unbound window.fetch initializer in ${path}; found ${unboundFetchCount}`)
  }

  await writeFile(path, source.replace('window.fetch)', 'window.fetch.bind(window))'))
  console.log(`Bound window.fetch in ${path}`)
}
