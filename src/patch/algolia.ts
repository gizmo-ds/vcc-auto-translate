import { del as kv_del, set as kv_set, get as kv_get } from 'idb-keyval'
import { Config } from '@/types/patch'
import { Localization } from '@/types/patch/algolia'
import { Language } from '@/types/patch/translate'
import { localization_hashs, store, user_language } from '../helpers'

const embedded_languages: Language[] =
  process.env.EMBED_LANGUAGES === 'true'
    ? [
        {
          name: '简体中文',
          language: 'zh-CN',
          content: import('@/localization/algolia.zh_CN.json'),
          hash: localization_hashs['algolia.zh_CN.json'],
        },
        {
          name: '正體中文',
          language: 'zh-TW',
          content: import('@/localization/algolia.zh_TW.json'),
          hash: localization_hashs['algolia.zh_TW.json'],
        },
        {
          name: 'English',
          language: 'en',
          content: import('@/localization/algolia.en.json'),
          hash: localization_hashs['algolia.en.json'],
        },
      ]
    : []

const config: Config = {
  patch_jsx: {
    fname: '__algolia_jsx_patch__',
    async before() {
      await kv_del('algolia_languages', store)
    },
    async after() {
      const algolia_info = {
        apiKey: process.env.ALGOLIA_APIKEY,
        appId: process.env.ALGOLIA_APPID,
        indexName: process.env.ALGOLIA_INDEXNAME,
      }
      const is_str_set = (v: string | undefined) => v && v != ''
      const replace =
        is_str_set(algolia_info.apiKey) &&
        is_str_set(algolia_info.appId) &&
        is_str_set(algolia_info.indexName)

      await load_languages()
      const localization: Localization = (await algolia_localization())?.content
      globalThis['__algolia_jsx_patch__'] = (e: any, t: any) => {
        if (!e) return t
        if (!(t.apiKey && t.appId && t.appId && t.placeholder)) return t

        t.placeholder = localization!.placeholder
        if (replace) {
          t.apiKey = algolia_info.apiKey
          t.appId = algolia_info.appId
          t.indexName = algolia_info.indexName
        }
        return t
      }
    },
  },
  patch_createElement: {
    fname: '__algolia_createElement_patch__',
    async after() {
      await load_languages()
      const localization: Localization = (await algolia_localization())?.content
      globalThis['__algolia_createElement_patch__'] = (e: any, t: any, r: any) => {
        if (t && Object.prototype.hasOwnProperty.call(t, 'translations'))
          t.translations = localization?.translations ?? {}
      }
    },
  },
}

export default config

let algolia_languages: Language[] | undefined
async function load_languages() {
  if (algolia_languages) return
  algolia_languages = await kv_get('algolia_languages', store).then((langs) => langs as Language[])
  if (algolia_languages) return
  for (const lang of embedded_languages) lang.content = (await lang.content).default
  await kv_set('algolia_languages', embedded_languages, store)
  algolia_languages = embedded_languages
}
export async function algolia_localization(): Promise<Language | undefined> {
  const _user_language = await user_language()
  return algolia_languages?.find((v) => v.language === _user_language)
}
