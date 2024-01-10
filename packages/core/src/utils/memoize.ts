import type { MemoryStoreItem } from '../types'
import toSource from 'tosource'

export class MemoryStore {
  #data: Record<string, MemoryStoreItem> = {}

  get(key: string, cb: (item: MemoryStoreItem | undefined) => void) {
    cb(this.#data[key])
  }

  set(key: string, val: MemoryStoreItem, cb: () => void) {
    this.#data[key] = val
    cb()
  }

  clear(cb: () => void) {
    this.#data = {}
    cb()
  }
}

export function memoize(target: (...args: unknown[]) => unknown) {
  const expire = 30000
  const id = Math.floor(Math.random() * 100000000).toString(36)
  const store = new MemoryStore()

  function wrapper() {
    return function (this: unknown, ...rawArgs: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      const args = rawArgs.slice()
      const cb = args.pop() as (...args: unknown[]) => void
      const hash = id + '=' + toSource(args)

      store.get(hash, function (cached) {
        if (cached && (!cached.expires || cached.expires >= Date.now()))
          return cb.apply(self, cached.args)
        args.push(function (this: unknown, ...rawArgs: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this
          const cbargs = rawArgs.slice()
          store.set(
            hash,
            {
              args: cbargs,
              expires: Date.now() + expire,
            },
            function () {
              cb.apply(self, cbargs)
            },
          )
        })

        target.apply(target, args)
      })
    }
  }

  return wrapper()
}
