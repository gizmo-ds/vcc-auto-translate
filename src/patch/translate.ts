import { delMany as kv_del, set as kv_set, get as kv_get } from 'idb-keyval'
import { Config } from '@/types/patch'
import { Language } from '@/types/patch/translate'
import { DebugMode, localization_hashs, user_language, debug_log, store } from '../helpers'

const embedded_languages: Language[] =
  process.env.EMBED_LANGUAGES === 'true'
    ? [
        {
          name: '简体中文',
          language: 'zh-CN',
          content: import('@/localization/zh_CN.json'),
          hash: localization_hashs['zh_CN.json'],
        },
        {
          name: '正體中文',
          language: 'zh-TW',
          content: import('@/localization/zh_TW.json'),
          hash: localization_hashs['zh_TW.json'],
        },
      ]
    : []

const fname = '__vcc_auto_translate__'
const config: Config = {
  patch_jsx: {
    fname,
    async before() {
      await kv_del(['vcc_languages'], store)
    },
    async after() {
      await load_languages()
      const localization = (await vcc_localization())?.content ?? {}

      const translater = new Translater(localization)
      globalThis[fname] = translater.translate.bind(translater)
      globalThis[fname]['restore'] = () => kv_del(['patched-content', 'patched-filename'], store)
    },
  },
  async after() {
    if (DebugMode) {
      var originHistory = history.pushState
      history.pushState = function () {
        var rv = originHistory.apply(this, arguments)
        var e = new Event('pushState')
        //@ts-ignore
        e.arguments = arguments
        window.dispatchEvent(e)
        return rv
      }
      window.addEventListener('pushState', function (e: Event) {
        if ('arguments' in e) {
          const args = e.arguments as IArguments
          if (args.length === 3) debug_log(args[2])
        }
      })
    }
  },
}

export default config

export class Translater {
  private localization: Record<string, string>
  private all_matcher: Record<string, [RegExp, string]> = {}

  // 保存翻译完成后的字符串, 防止重复翻译. 初始值为需要跳过翻译的字符串
  private translated: Set<string> = new Set(
    // prettier-ignore
    [
      // FIXME: https://github.com/gizmo-ds/vcc-auto-translate/issues/13
      'Official', 'Curated', 'Local User Packages',
      // 一些不需要翻译的字符串
      ' · ', '2022.3.6f1', '2019.4.31f1', 'v', '.', '2022', 'settings.json',
      'VRChat', 'Udon', 'Discord', 'URL', 'assets.vrchat.com',
      'https://assets.vrchat.com/sdk/vrc-official.json', 'https://assets.vrchat.com/sdk/vrc-curated.json',
      // 由 algolia patch 翻译的字符串
      'Search the VRChat docs'
    ]
  )

  constructor(localization: Record<string, string>) {
    this.localization = localization
    if (localization)
      this.all_matcher = Object.keys(localization)
        .filter((k) => k.indexOf('[matcher]') === 0)
        .reduce<Record<string, [RegExp, string]>>((acc, key) => {
          const k = key.replace('[matcher]', '')
          acc[k] = [new RegExp(k), localization[key]]
          return acc
        }, {})
  }

  private t(item: any) {
    if (!item || typeof item !== 'string') return item
    if (this.translated.has(item)) return item

    const tr = this.localization[item]
    if (tr) return this.translated.add(tr) && tr

    for (const k of Object.keys(this.all_matcher)) {
      const matcher = this.all_matcher[k][0]
      const m = item.match(matcher)
      if (!m) continue
      let rt = this.all_matcher[k][1]
      for (let i = 0; i < m.length; i++) rt = rt.replaceAll(`$${i}`, m[i])
      return this.translated.add(rt) && rt
    }
    return this._translation_missing(item)
  }

  // 将翻译结果中的格式化字符串还原为数组
  private _rebuild_array(t_str: string, arr: any[]) {
    const regex = /\{\{(\d+):([^\}]+)\}\}/g
    let match: RegExpExecArray | null
    const rebuilt_arr: any[] = []
    let last_index = 0

    while ((match = regex.exec(t_str)) !== null) {
      const [_, index, content] = match
      const start = match.index
      const end = regex.lastIndex

      if (start > last_index) rebuilt_arr.push(t_str.substring(last_index, start))

      const original_object = arr[parseInt(index)]
      rebuilt_arr.push({
        ...original_object,
        props: { ...original_object.props, children: content },
      })

      last_index = end
    }

    if (last_index < t_str.length) rebuilt_arr.push(t_str.substring(last_index))
    return rebuilt_arr
  }

  // NOTE: 为大段文字但中间有不同格式的数据做处理
  private rebuild_array(t: any[]) {
    const allowed_types = ['b']
    const array_checker = (item: any) => {
      if (typeof item === 'string') return true
      if (!item?.type) return false
      return allowed_types.includes(item?.type) && typeof item?.props?.children === 'string'
    }
    if (!t.every(array_checker)) return t.map((i) => this._translate(i))

    const translated_regex = /\{\{\d+:[^\}]+\}\}/g
    const special = this._convert2special(t)

    // 如果已经翻译过，直接返回
    if (this.translated.has(special.replace(translated_regex, '{{-}}'))) return t

    const t_str = this.localization[special]
    // 如果翻译结果不存在，返回翻译缺失
    if (!t_str) return this._translation_missing(t, special)
    // 如果翻译结果为非格式化字符串，直接返回
    if (!t_str.includes('{{1:')) return t.map((i) => this._translate(i))

    this.translated.add(t_str.replace(translated_regex, '{{-}}'))
    return this._rebuild_array(t_str, t)
  }

  private _translation_missing(t: any, str?: string): any {
    if (DebugMode) debug_log(`Translation missing for: [${str ?? t}]`)
    return t
  }

  private _convert2special(arr: any[]) {
    let special_str = ''
    arr.forEach((item, index) => {
      if (typeof item === 'object') special_str += `{{${index}:${item.props.children}}}`
      else special_str += item
    })
    return special_str
  }

  private _translate(t: any, element_name?: string): any {
    if (!t) return t

    // 处理 Array
    if (Array.isArray(t)) return this.rebuild_array(t)
    // 处理 String
    if (typeof t === 'string') return this.t(t)
    // 处理 Object
    if (typeof t === 'object') {
      for (const tk of Object.keys(t)) {
        if (['content', 'title', 'placeholder', 'label', 'props'].includes(tk))
          t[tk] = this._translate(t[tk], t.type)
      }
    }

    // 单独处理 children
    if (t.children) {
      // NOTE: 忽略不需要翻译的 New Project 标题
      if (t.children === 'New Project' && (t.className || element_name === 'b')) return t

      t.children = this._translate(t.children)
    }
    return t
  }

  translate(e: any, t: any, r: any) {
    if (!this.localization) return t
    if (!e) return t

    const element_name: string = typeof e === 'string' ? e : e.displayName

    /* 样式优化 */
    // NOTE: 修复 Projects 标题的换行问题
    if (element_name == 'Title1' && t.children === 'Projects')
      t.style = t.style
        ? Object.assign(t.style, { whiteSpace: 'nowrap' })
        : { whiteSpace: 'nowrap' }

    return this._translate(t, element_name)
  }
}

let vcc_languages: Language[] | undefined
async function load_languages() {
  if (vcc_languages) return
  vcc_languages = await kv_get('vcc_languages', store).then((langs) => langs as Language[])
  if (vcc_languages) return
  for (const lang of embedded_languages) lang.content = (await lang.content).default
  await kv_set('vcc_languages', embedded_languages, store)
  vcc_languages = embedded_languages
}
export async function vcc_localization(): Promise<Language | undefined> {
  const _user_language = await user_language()
  return vcc_languages?.find((v) => v.language === _user_language)
}
