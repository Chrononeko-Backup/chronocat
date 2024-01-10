/* eslint-disable @typescript-eslint/no-var-requires */

import execa from 'execa'
import { mkdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const spawnAsync = (
  command: string,
  args?: ReadonlyArray<string>,
  options?: execa.SyncOptions,
) => {
  const parsedArgs = args ?? []
  const parsedOptions: execa.SyncOptions = Object.assign<
    execa.SyncOptions,
    execa.SyncOptions,
    execa.SyncOptions | undefined
  >({}, { stdio: 'inherit', shell: true }, options)
  const child = execa(command, parsedArgs, parsedOptions)
  return new Promise<number>((resolve) => {
    void child.on('close', resolve)
  })
}

void (async () => {
  const pathDist = resolve(__dirname, '../build/dist')
  await rm(pathDist, { recursive: true, force: true })
  await mkdir(pathDist, { recursive: true })

  await Promise.all(
    ['core']
      .map(
        (x) =>
          require(`../packages/${x}/package.json`) as {
            name: string
            version: string
          },
      )
      .map((pkgJson) =>
        spawnAsync('yarn', [
          'workspace',
          pkgJson.name,
          'pack',
          '-f',
          join(
            pathDist,
            `${pkgJson.name.replace('@chronocat/', 'chronocat-')}-v${
              pkgJson.version
            }.tgz`,
          ),
        ]),
      ),
  )
})()
