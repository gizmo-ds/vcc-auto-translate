import { Config } from './patch'

const info = {
  apiKey: process.env.ALGOLIA_APIKEY,
  appId: process.env.ALGOLIA_APPID,
  indexName: process.env.ALGOLIA_INDEXNAME,
}
const is_str_set = (v: string | undefined) => v && v != ''
const replace = is_str_set(info.apiKey) && is_str_set(info.appId) && is_str_set(info.indexName)

const fname = '__algolia_patch__'
let localization: Record<string, string> = {}

function func(e: any, t: any) {
  if (!e) return t
  if (!(t.apiKey && t.appId && t.appId && t.placeholder)) return t

  t.placeholder = localization['placeholder']
  if (replace) {
    t.apiKey = info.apiKey
    t.appId = info.appId
    t.indexName = info.indexName
  }
  return t
}

const config: Config = {
  patch_jax: {
    fname,
    async after() {
      const supported_languages = {
        'zh-CN': (await import('@/localization/algolia.zh_CN.json')).default,
        'zh-TW': (await import('@/localization/algolia.zh_TW.json')).default,
      }
      localization =
        supported_languages[navigator.language] ??
        (await import('@/localization/algolia.en.json')).default
      globalThis[fname] = func
    },
  },
}

export default config
