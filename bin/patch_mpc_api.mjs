import { readFile, writeFile } from 'node:fs/promises'

const patchFile = async (path, pattern, replacement, alreadyPatchedPattern, expectedMatches) => {
  const source = await readFile(path, 'utf8')
  const matchCount = source.match(pattern)?.length ?? 0

  if (matchCount === 0) {
    const patchedCount = source.match(alreadyPatchedPattern)?.length ?? 0
    if (patchedCount === expectedMatches) return
    throw new Error(`Could not find the expected source in ${path}`)
  }

  if (matchCount !== expectedMatches) {
    throw new Error(`Expected ${expectedMatches} matching source expressions in ${path}; found ${matchCount}`)
  }

  await writeFile(path, source.replace(pattern, replacement))
  console.log(`Applied compatibility patch to ${path}`)
}

const bundles = [
  'node_modules/mpc_api/dist/mpc_api.js',
  'node_modules/mpc_api/dist/mpc_api.cjs',
]

for (const path of bundles) {
  await patchFile(path, /window\.fetch\)/g, 'window.fetch.bind(window))', /window\.fetch\.bind\(window\)/g, 1)
  // In mpc_api's minified bundles, e is the parsed response Document and r is the XPath.
  await patchFile(path, /document\.evaluate\((\s*r,\s*e,)/g, 'e.evaluate($1', /e\.evaluate\((\s*r,\s*e,)/g, 2)
}

// Keep the dependency source aligned in case its distribution bundles are regenerated.
await patchFile(
  'node_modules/mpc_api/src/mpc_api.ts',
  /document\.evaluate\(/g,
  'root.evaluate(',
  /root\.evaluate\(/g,
  2,
)
