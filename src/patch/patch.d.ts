export interface Config {
  patch_jsx?: {
    fname: string
    after?: () => Promise<void>
  }
  patch_createElement?: {
    fname: string
    after?: () => Promise<void>
  }
  after?: () => Promise<void>
}
