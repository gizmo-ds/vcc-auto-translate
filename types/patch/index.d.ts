export interface Config {
  patch_jsx?: FunctionPatch
  patch_createElement?: FunctionPatch
  patch_useMemo?: FunctionPatch
  before?: () => Promise<void>
  after?: () => Promise<void>
}

export interface FunctionPatch {
  fname: string
  before?: () => Promise<void>
  after?: () => Promise<void>
}
