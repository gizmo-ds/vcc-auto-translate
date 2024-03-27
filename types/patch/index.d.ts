export interface Config {
  patch_jsx?: FunctionPatch
  patch_createElement?: FunctionPatch
  patch_useMemo?: FunctionPatch
  after?: () => Promise<void>
}

export interface FunctionPatch {
  fname: string
  after?: () => Promise<void>
}
