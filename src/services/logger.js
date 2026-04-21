const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : false;

export const logger = {
  log:  (...args) => { if (isDev) console.log(...args); },
  warn: (...args) => { if (isDev) console.warn(...args); },
  error: (...args) => { console.error(...args); },
};
