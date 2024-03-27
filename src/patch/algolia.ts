import { language } from '../localization'
import { Config } from '@/types/patch'
import { Localization } from '@/types/patch/algolia'

const info = {
  apiKey: process.env.ALGOLIA_APIKEY,
  appId: process.env.ALGOLIA_APPID,
  indexName: process.env.ALGOLIA_INDEXNAME,
}
const is_str_set = (v: string | undefined) => v && v != ''
const replace = is_str_set(info.apiKey) && is_str_set(info.appId) && is_str_set(info.indexName)

let supported_languages: Record<string, Localization> | undefined

async function get_localization() {
  if (supported_languages) return supported_languages[language] ?? supported_languages['en']
  supported_languages = {
    'zh-CN': (await import('@/localization/algolia.zh_CN.json')).default,
    'zh-TW': (await import('@/localization/algolia.zh_TW.json')).default,
    en: (await import('@/localization/algolia.en.json')).default,
  }
  return supported_languages![language] ?? supported_languages!['en']
}

const config: Config = {
  patch_jsx: {
    fname: '__algolia_jsx_patch__',
    async after() {
      const localization = await get_localization()
      globalThis['__algolia_jsx_patch__'] = (e: any, t: any) => {
        if (!e) return t
        if (!(t.apiKey && t.appId && t.appId && t.placeholder)) return t

        t.placeholder = localization!.placeholder
        if (replace) {
          t.apiKey = info.apiKey
          t.appId = info.appId
          t.indexName = info.indexName
        }
        return t
      }
    },
  },
  patch_createElement: {
    fname: '__algolia_createElement_patch__',
    async after() {
      const localization = await get_localization()
      globalThis['__algolia_createElement_patch__'] = (e: any, t: any, r: any) => {
        if (t && Object.prototype.hasOwnProperty.call(t, 'translations'))
          t.translations = localization?.translations ?? {}
      }
    },
  },
}

export default config
