import Ajv from 'ajv'
import standaloneCode from 'ajv/dist/standalone'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chronocatConfigSchema } from '../src/config/schema'

const ajv = new Ajv({
  code: {
    source: true,
    esm: true,
    lines: true,
  },

  discriminator: true,
  useDefaults: true,
})

ajv.addKeyword({
  keyword: 'defaultProperties',
  valid: true,
})

const validate = ajv.compile(chronocatConfigSchema)
const moduleCode = '//@ts-nocheck\n\n' + standaloneCode(ajv, validate)
void writeFile(join(__dirname, '../src/config/validate.ts'), moduleCode)
