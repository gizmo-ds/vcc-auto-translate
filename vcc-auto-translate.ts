import zhHans from './localization/zh-hans.json'
import zhHant from './localization/zh-hant.json'
const supported_languages = {
  'zh-CN': zhHans,
  'zh-TW': zhHant,
}
const supported_element_name = [
  'Button',
  'SplitButton',
  'ToggleButton',
  'DataGridHeaderCell',
  'MenuItem',
  'Body1',
  'Title1',
  'Input',
  'DialogTitle',
  'DialogContent',
  'Caption1',
  'Badge',
  'Subtitle1',
  'Label',
  'Option',
  'Tab',
  'Dropdown',
  'Link',
  'ToastBody',

  'li',
  'span',
  'label',
  'div',
  'b',
  'input',
  'p',
]
const localization = supported_languages[navigator.language]
const localization_matcher = localization
  ? Object.keys(localization)
      .filter((k) => k.indexOf('[matcher]') === 0)
      .reduce((acc, key) => {
        const k = key.replace('[matcher]', '')
        acc[k] = [new RegExp(k), localization[key]]
        return acc
      }, {})
  : {}
function tr(s: string) {
  const text = localization[s]
  return [text !== undefined, text ?? s]
}
globalThis['vcc_auto_translate'] = (e: any, t: any) => {
  if (!localization) return t
  if (!e) return t
  const element_name = typeof e === 'string' ? e : e.displayName

  if (
    // 处理 Symbol(react.fragment)
    typeof e === 'symbol' &&
    e.toString() === 'Symbol(react.fragment)' &&
    t.children
  )
    t.children = t.children.map((item: any) =>
      typeof item === 'string' ? localization[item] ?? item : item
    )
  else if (
    // 忽略不受支持的 Element
    !supported_element_name.find(
      (e) => e === element_name || `Styled(${e})` === element_name
    )
  ) {
    if (element_name)
      console.warn(
        'not supported element:',
        `[${element_name}]`,
        t.children ?? t.placeholder
      )
    return t
  }

  var children_translated = false
  for (const k of ['children', 'placeholder', 'title']) {
    if (!t[k]) continue
    if (typeof t[k] === 'string') {
      const r = tr(t[k])
      if (!children_translated) children_translated = k === 'children' && r[0]
      t[k] = r[1]
    }
    if (Array.isArray(t[k]))
      t[k] = t[k].map((e: any) => (typeof e === 'string' ? tr(e)[1] : e))
  }
  // 如果 children 没有被翻译的话, 尝试使用匹配器进行翻译
  if (t.children && typeof t.children === 'string' && !children_translated)
    for (const k of Object.keys(localization_matcher)) {
      const matcher = localization_matcher[k][0]
      const m = t.children.match(matcher)
      if (!m) continue
      let rt = localization_matcher[k][1]
      for (let i = 0; i < m.length; i++) rt = rt.replaceAll(`$${i}`, m[i])
      t.children = rt
    }

  /* 样式优化 */
  // 修复 Projects 标题的换行问题
  if (element_name == 'Title1' && t.children === localization['Projects'])
    t.style = t.style
      ? Object.assign(t.style, { whiteSpace: 'nowrap' })
      : { whiteSpace: 'nowrap' }

  return t
}
