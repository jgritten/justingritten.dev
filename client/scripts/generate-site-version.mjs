import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientRoot = path.resolve(__dirname, '..')
const sourcePath = path.join(clientRoot, 'src', 'utils', 'siteVersion.ts')
const outputPath = path.join(clientRoot, 'public', 'site-version.json')

async function main() {
  const source = await readFile(sourcePath, 'utf8')
  const match = source.match(/SITE_VERSION\s*=\s*'([^']+)'/)
  if (!match?.[1]) {
    throw new Error('Could not find SITE_VERSION in src/utils/siteVersion.ts')
  }

  const payload = JSON.stringify(
    {
      version: match[1],
      generatedAtUtc: new Date().toISOString(),
    },
    null,
    2
  )

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${payload}\n`, 'utf8')
  console.log(`Wrote ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
