import { cp, mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

void (async () => {
  const distPath = resolve(
    __dirname,
    '../../build/dist/qqntim/qqntim-plugin-chronocat',
  )
  const srcPath = join(distPath, 'src')

  await mkdir(srcPath, { recursive: true })
  await cp(join(__dirname, 'lib/index.js'), join(srcPath, 'main.js'))
  await cp(join(__dirname, 'qqntim.json'), join(distPath, 'qqntim.json'))
})()
