import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFile = path.join(root, '.env.upload')

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

const [script, ...args] = process.argv.slice(2)
if (!script) {
  console.error('usage: node scripts/run-with-env.mjs <script> [...args]')
  process.exit(1)
}

const result = spawnSync(process.execPath, [path.join(root, script), ...args], {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
})

process.exit(result.status ?? 1)
