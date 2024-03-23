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

  translate(e: any, t: any) {
    if (!this.localization) return t
    if (!e) return t
    const element_name = typeof e === 'string' ? e : e.displayName

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
      if (element_name && process.env.DEBUG_MODE === 'true')
        console.warn('not supported element:', `[${element_name}]`, t.children ?? t.placeholder)
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
