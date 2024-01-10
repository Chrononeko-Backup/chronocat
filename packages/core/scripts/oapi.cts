import { dump, load } from 'js-yaml'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Definition, PartialArgs } from 'typescript-json-schema'
import { buildGenerator, programFromConfig } from 'typescript-json-schema'

void (async () => {
  const settings: PartialArgs = {
    aliasRef: true,
    titles: false,
    defaultProps: true,
    noExtraProps: true,
    propOrder: false,
    required: true,
    strictNullChecks: true,
    skipLibCheck: true,
  }

  const generator = buildGenerator(
    programFromConfig(
      resolve(__dirname, '../src/satori/types/tsconfig.oapi.json'),
    ),
    settings,
  )!

  let definition = generator.getSchemaForSymbols(generator.getUserSymbols())
  definition = JSON.parse(
    JSON.stringify(definition).replaceAll(
      '#/definitions/',
      '#/components/schemas/',
    ),
  ) as Definition

  const openapi = load(
    await readFile(resolve(__dirname, '../static/openapi.yaml'), 'utf-8'),
  ) as {
    components: {
      schemas: unknown
    }
  }

  openapi.components.schemas = definition.definitions

  await writeFile(
    resolve(__dirname, '../../docs/static/openapi.yaml'),
    dump(openapi),
  )
})()
