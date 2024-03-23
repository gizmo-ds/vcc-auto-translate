import zhHans from '@/localization/zh_CN.json'
import zhHant from '@/localization/zh_TW.json'

export const supported_languages = {
  'zh-CN': zhHans,
  'zh-TW': zhHant,
}

export const language = localStorage.getItem('__vcc_language__') ?? navigator.language
export function set_language(lang: string) {
  localStorage.setItem('__vcc_language__', lang)
}
