export const DebugMode = process.env.DEBUG_MODE === 'true'

export const localization_hashs: Record<string, string> =
  //@ts-ignore
  vcc_auto_translate.localization_hashs ?? {}
