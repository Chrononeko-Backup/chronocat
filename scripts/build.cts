import { analyzeMetafile, context } from 'esbuild'
import { join } from 'node:path'

const [_node, _tsNode, mode] = process.argv
const cwd = process.cwd()

void (async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const { version } = require(join(cwd, 'package.json'))

  const ctx = await context({
    entryPoints: [join(cwd, 'src/index.ts')],
    write: true,
    outdir: 'lib',

    loader: {
      '.yml': 'text',
      '.html': 'binary',
      '.txt': 'text',
    },

    platform: 'node',
    format: 'cjs',
    tsconfig: join(cwd, 'tsconfig.json'),

    define: {
      __DEFINE_CHRONO_VERSION__: `'${version}'`,
    },
    external: [
      'electron',
      'qqntim/main',
      'qqntim/renderer',
      'qqntim-settings',
      'qqntim-settings/components',
    ],

    bundle: true,
    minify: true,
    sourcemap: true,

    metafile: true,
    color: true,
  })

  if (mode === 'watch') await ctx.watch()
  else {
    console.log(await analyzeMetafile((await ctx.rebuild()).metafile))
    await ctx.dispose()
  }
})()
