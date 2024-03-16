import { Translater } from './translate'

import zhHans from '../localization/zh-hans.json'
import zhHant from '../localization/zh-hant.json'

const supported_languages = {
  'zh-CN': zhHans,
  'zh-TW': zhHant,
}
const localization = supported_languages[navigator.language]

const translater = new Translater(localization)
globalThis.vcc_auto_translate = translater.translate.bind(translater)
