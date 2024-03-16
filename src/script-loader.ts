import { injector } from './injector'
import { get as kv_get, set as kv_set, createStore } from 'idb-keyval'
import { Translater } from './translate'
import zhHans from '../localization/zh-hans.json'
import zhHant from '../localization/zh-hant.json'

const store = createStore('vcc_auto_translate', 'store')

main()

async function main() {
  const index_script_file = document.getElementsByTagName('meta')['index-module'].content
  const patched_filename = index_script_file.replace(/\.js$/, '.patched.js')
  const local_patched_filename = await kv_get('patched-filename', store)
  let patched_code: string | undefined

  const supported_languages = {
    'zh-CN': zhHans,
    'zh-TW': zhHant,
  }
  const localization = supported_languages[navigator.language]

  if (!local_patched_filename || local_patched_filename !== patched_filename) {
    const loading = create_loading()
    document.querySelector('#root')?.before(loading)

    const u = new URL(location.origin)
    u.pathname = index_script_file
    const code = await fetch(u.href).then((res) => res.text())
    patched_code = await injector(code, 'vcc_auto_translate')
    loading.innerText = '翻译补丁已应用 🎉'
    kv_set('patched-filename', patched_filename, store)
    await kv_set('patched-content', patched_code, store)

    setTimeout(() => loading.remove(), 1000)
  }

  const translater = new Translater(localization)
  globalThis.vcc_auto_translate = translater.translate.bind(translater)

  load_patched_code(patched_code)
}

async function load_patched_code(patched_code?: string) {
  if (!patched_code) patched_code = await kv_get('patched-content', store)!
  const e = document.createElement('script')
  e.setAttribute('type', 'module')
  e.innerHTML = patched_code!
  document.body.appendChild(e)
}

function create_loading(text = '正在应用翻译补丁...') {
  const loading = document.createElement('p')
  loading.innerText = text
  loading.style.height = '100vh'
  loading.style.textAlign = 'center'
  loading.style.paddingTop = '45vh'
  loading.style.fontSize = 'xxx-large'
  loading.style.zIndex = '2000'
  return loading
}
