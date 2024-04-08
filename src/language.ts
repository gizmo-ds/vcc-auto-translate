import { get as kv_get, set as kv_set } from 'idb-keyval'
import { store } from './store'

export async function user_language(): Promise<string> {
  return (await kv_get('user_language', store)) ?? navigator.language
}
export async function set_user_language(lang: string) {
  return kv_set('user_language', lang, store)
}
