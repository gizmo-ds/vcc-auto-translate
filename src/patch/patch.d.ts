export interface Config {
  patch_jax?: {
    fname: string
    after?: () => Promise<void>
  }
  [key: string]: unknown
}
