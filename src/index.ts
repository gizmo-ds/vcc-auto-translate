import { text_hash } from './utils'

const supportedLanguages = ['zh-CN', 'zh-TW']

const language = navigator.language
const text_record: Record<string, string> = {}

if (supportedLanguages.includes(language)) start(language)

async function start(language: string) {
  const tr = (await fetch(`/localization/${language}.json`).then((resp) =>
    resp.json()
  )) as Record<string, string>
  let observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      await vcc_auto_translate(mutation.target as HTMLElement, tr)
    }
  })
  observer.observe(document.querySelector('#root')!, {
    childList: true,
    subtree: true,
  })
}

async function vcc_auto_translate(
  node: HTMLElement,
  tr: Record<string, string>
) {
  const selectors = [
    '.fui-Button',
    '.fui-Title1, .fui-Title3, .fui-Subtitle1, .fui-Subtitle2',
    '.fui-MenuList .fui-MenuItem, .fui-Option, .fui-OptionGroup__label',
    '.fui-Label, .fui-Caption1, .fui-Body1',
    '.fui-Tab>.fui-Tab__content, .fui-DataGridHeaderCell__button, .fui-TableHeaderCell__button',
    '.fui-TableCell',
    '.list-disc>li',
    '.fui-Alert',
  ]
  for (const selector of selectors) {
    for (const e of node.querySelectorAll(selector)) {
      for (const child of e.childNodes) {
        const text = child.textContent
        if (!text) continue
        if (!text_record[text]) text_record[text] = await text_hash(text)

        if (tr[text_record[text]]) {
          if (
            text === 'New Project' &&
            (child as HTMLElement).classList &&
            !(child as HTMLElement).classList.contains('fui-Title1')
          )
            return
          child.textContent = tr[text_record[text]]
          if (text === 'Projects')
            (e as HTMLElement).style.whiteSpace = 'nowrap'
        }
      }
    }
  }
  for (const e of node.querySelectorAll('[placeholder]')) {
    const text = e.getAttribute('placeholder')
    if (!text) continue
    if (!text_record[text]) text_record[text] = await text_hash(text)
    if (tr[text_record[text]])
      e.setAttribute('placeholder', tr[text_record[text]])
  }
}
