export interface Config {
  patch_jsx?: {
    fname: string
    after?: () => Promise<void>
  }
  [key: string]: unknown
}
