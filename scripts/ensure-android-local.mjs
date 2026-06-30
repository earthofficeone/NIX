import { existsSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localProps = path.join(root, 'android/local.properties')

if (existsSync(localProps)) {
  process.exit(0)
}

const candidates = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(os.homedir(), 'Library/Android/sdk'),
  path.join(os.homedir(), 'Android/Sdk'),
].filter(Boolean)

const sdkDir = candidates.find((dir) => existsSync(dir))

if (!sdkDir) {
  console.error(
    [
      '[ensure-android-local] ไม่พบ Android SDK',
      '',
      'ติดตั้ง Android Studio แล้วเปิด SDK Manager หรือตั้ง:',
      '  export ANDROID_HOME="$HOME/Library/Android/sdk"',
      '',
      'จากนั้นสร้าง android/local.properties:',
      '  sdk.dir=/Users/<you>/Library/Android/sdk',
    ].join('\n'),
  )
  process.exit(1)
}

const content = `## Auto-generated — machine-local (gitignored)\nsdk.dir=${sdkDir.replace(/\\/g, '/')}\n`
writeFileSync(localProps, content, 'utf8')
console.log(`[ensure-android-local] created android/local.properties → ${sdkDir}`)
