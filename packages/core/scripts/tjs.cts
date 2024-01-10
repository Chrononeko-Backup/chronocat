import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { PartialArgs } from 'typescript-json-schema'
import { buildGenerator, programFromConfig } from 'typescript-json-schema'

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
  programFromConfig(resolve(__dirname, '../src/config/tsconfig.tjs.json')),
  settings,
)!

const schema = generator.getSchemaForSymbol('ChronocatConfig')

schema.$id = 'https://chronocat.vercel.app/config-v0.schema.json'
schema.title = 'Chronocat 配置'
schema.description = 'Chronocat 配置（chronocat.yml）'

const schemaString = JSON.stringify(schema).replaceAll(
  '"anyOf"',
  '"type":"object","discriminator":{"propertyName":"type"},"oneOf"',
)

void writeFile(
  resolve(__dirname, '../src/config/schema.ts'),
  `import type { JSONSchemaType } from 'ajv'\nimport type { ChronocatConfig } from './types'\n\nexport const chronocatConfigSchema = ${schemaString} as unknown as JSONSchemaType<ChronocatConfig>\n`,
)
void writeFile(
  resolve(__dirname, '../../docs/static/config-v0.schema.json'),
  schemaString,
)
void writeFile(
  resolve(__dirname, '../../docs/static/openapi-config.json'),
  `{"openapi":"3.1.0","info":{},"components":{"schemas":{"Config":${schemaString.replaceAll(
    '#/definitions/',
    '#/components/schemas/Config/definitions/',
  )}}}}`,
)
