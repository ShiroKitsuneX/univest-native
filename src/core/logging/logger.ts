declare const __DEV__: boolean | undefined

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) console.log(...args)
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args)
  },
  error: (...args: unknown[]): void => {
    console.error(...args)
  },
}
