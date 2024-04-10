import { get as kv_get, set as kv_set, createStore as create_store } from 'idb-keyval'

export const store = create_store('vcc_auto_translate', 'store')
export const DebugMode = process.env.DEBUG_MODE === 'true'

// 本地化文件的哈希值
export const localization_hashs: Record<string, string> =
  //@ts-ignore
  vcc_auto_translate.localization_hashs ?? {}

// 打印调试信息
export function debug_log(...args: any[]) {
  if (!DebugMode) return
  console.debug('[vcc-auto-translate]', ...args)
}

export async function user_language(): Promise<string> {
  return (await kv_get('user_language', store)) ?? navigator.language
}
export async function set_user_language(lang: string) {
  return kv_set('user_language', lang, store)
}
