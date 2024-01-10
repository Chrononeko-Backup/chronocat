import type { CMNative } from '@chronocat/module-native'
import { load as loadModuleNative } from '@chronocat/module-native'

export interface Modules {
  native: CMNative
}

let modules: Modules

export const getModules = async () =>
  modules ?? {
    native: await loadModuleNative(),
  }
