import { delMany as kv_del, set as kv_set, get as kv_get } from 'idb-keyval'
import { user_language } from '../language'
import { Config } from '@/types/patch'
import { Language } from '@/types/patch/translate'
import { DebugMode, localization_hashs } from '../env'
import { store } from '../store'

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
          if (args.length === 3) console.log(args[2])
        }
      })
    }
  },
}

export default config

export class Translater {
  localization: Record<string, string>
  localization_matcher: any
  // prettier-ignore
  supported_element_name = [
    'Button', 'SplitButton', 'ToggleButton', 'DataGridHeaderCell', 'TableHeaderCell', 'MenuItem', 'Body1', 'Title1', 'Title3',
    'Subtitle2', 'Input', 'DialogTitle', 'DialogContent', 'Caption1', 'Badge', 'Subtitle1', 'Label', 'Option', 'Tab', 'Dropdown',
    'Link', 'ToastBody', 'Checkbox', 'Alert', 'TableCellLayout', 'OptionGroup', 'MessageBarBody', 'MenuItem', 'Tooltip',

    'li', 'span', 'label', 'div', 'b', 'input', 'p', 'code', 'i'
  ]

  constructor(localization: Record<string, string>) {
    this.localization = localization
    this.localization_matcher = this.localization
      ? Object.keys(this.localization)
          .filter((k) => k.indexOf('[matcher]') === 0)
          .reduce((acc, key) => {
            const k = key.replace('[matcher]', '')
            acc[k] = [new RegExp(k), this.localization[key]]
            return acc
          }, {})
      : {}
  }

  translate(e: any, t: any, r: any) {
    if (!this.localization) return t
    if (!e) return t
    const element_name: string = typeof e === 'string' ? e : e.displayName

    // FIXME: https://github.com/gizmo-ds/vcc-auto-translate/issues/13
    if (['Official', 'Curated', 'Local User Packages'].includes(t.children)) return t

    // 仅翻译标题 New Project
    if (t.children === 'New Project' && t && t.className) return t

    if (
      // 处理 Symbol(react.fragment)
      typeof e === 'symbol' &&
      e.toString() === 'Symbol(react.fragment)' &&
      t.children
    )
      t.children = t.children.map((item: any) =>
        typeof item === 'string' ? this.localization[item] ?? item : item
      )
    else if (
      // 忽略不受支持的 Element
      !this.supported_element_name.find(
        (e) => e === element_name || `Styled(${e})` === element_name
      )
    ) {
      if (DebugMode && element_name)
        console.warn('not supported element:', `[${element_name}]`, t.children ?? t.placeholder)
      return t
    }

    // 翻译 Tooltip 的 description
    if (
      element_name &&
      t &&
      element_name.includes('Tooltip') &&
      t?.relationship === 'description' &&
      t.content
    ) {
      t.content = this.tr(t.content)[1]
      return t
    }

    var children_translated = false
    for (const k of ['children', 'placeholder', 'title', 'label']) {
      if (!t[k]) continue
      if (typeof t[k] === 'string') {
        const r = this.tr(t[k])
        //@ts-ignore
        if (!children_translated) children_translated = k === 'children' && r[0]
        t[k] = r[1]
      }
      if (Array.isArray(t[k]))
        t[k] = t[k].map((e: any) => (typeof e === 'string' ? this.tr(e)[1] : e))
    }
    // 如果 children 没有被翻译的话, 尝试使用匹配器进行翻译
    if (t.children && typeof t.children === 'string' && !children_translated)
      for (const k of Object.keys(this.localization_matcher)) {
        const matcher = this.localization_matcher[k][0]
        const m = t.children.match(matcher)
        if (!m) continue
        let rt = this.localization_matcher[k][1]
        for (let i = 0; i < m.length; i++) rt = rt.replaceAll(`$${i}`, m[i])
        t.children = rt
      }

    /* 样式优化 */
    // 修复 Projects 标题的换行问题
    if (element_name == 'Title1' && t.children === this.localization['Projects'])
      t.style = t.style
        ? Object.assign(t.style, { whiteSpace: 'nowrap' })
        : { whiteSpace: 'nowrap' }
    return t
  }

  tr(s: string) {
    const text = this.localization[s]
    return [text !== undefined, text ?? s]
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
