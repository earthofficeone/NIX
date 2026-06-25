import { execSync, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apkPath = path.join(root, 'android/app/build/outputs/apk/debug/app-debug.apk')
const remote = process.env.RCLONE_REMOTE?.trim()

function fail(message) {
  console.error(`\n[upload-apk] ${message}`)
  process.exit(1)
}

if (!existsSync(apkPath)) {
  fail(`ไม่พบไฟล์ APK — รัน pnpm cap:build:debug ก่อน\n  ${apkPath}`)
}

if (!remote) {
  fail(
    [
      'ยังไม่ได้ตั้งค่า RCLONE_REMOTE',
      '',
      'ตั้งค่าครั้งเดียว:',
      '  1. brew install rclone',
      '  2. rclone config   # สร้าง remote ชื่อ gdrive → Google Drive',
      '  3. สร้างโฟลเดอร์ใน Drive เช่น NixAPK',
      '  4. export RCLONE_REMOTE="gdrive:NixAPK"',
      '',
      'หรือใส่ใน nix-frontend/.env.upload:',
      '  RCLONE_REMOTE=gdrive:NixAPK',
    ].join('\n'),
  )
}

const rclone = spawnSync('rclone', ['version'], { encoding: 'utf8' })
if (rclone.error || rclone.status !== 0) {
  fail('ไม่พบ rclone — ติดตั้งด้วย: brew install rclone')
}

const stamp = new Date().toISOString().slice(0, 10)
const version = process.env.APK_VERSION?.trim() || stamp
const uploadName = `nix-debug-${version}.apk`
const stagingDir = path.join(root, '.upload-staging')
const stagedApk = path.join(stagingDir, uploadName)

mkdirSync(stagingDir, { recursive: true })
copyFileSync(apkPath, stagedApk)

console.log(`[upload-apk] อัปโหลด ${uploadName} → ${remote}`)

try {
  execSync(`rclone copy "${stagedApk}" "${remote}" --progress`, {
    stdio: 'inherit',
    cwd: root,
  })
} catch {
  fail('อัปโหลดล้มเหลว — ตรวจ rclone config และสิทธิ์โฟลเดอร์ Drive')
}

console.log(`\n[upload-apk] สำเร็จ → ${remote}/${uploadName}`)
console.log('[upload-apk] เปิด Drive: https://drive.google.com/drive/home')
