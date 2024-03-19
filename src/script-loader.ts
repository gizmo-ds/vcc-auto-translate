import { injector } from './injector'
import { get as kv_get, set as kv_set, createStore, delMany as kv_del } from 'idb-keyval'
import { Translater } from './translate'
import { LoadingComponent } from './components/loading'
import { supported_languages } from './localization'

const inject_function_name = '__vcc_auto_translate__'
const store = createStore('vcc_auto_translate', 'store')

async function main() {
  const index_script_file = document.getElementsByTagName('meta')['index-module'].content
  const patched_filename = index_script_file.replace(/\.js$/, '.patched.js')
  const local_patched_filename = await kv_get('patched-filename', store)
  let patched_code: string | undefined

  const localization = supported_languages[navigator.language]

  if (!local_patched_filename || local_patched_filename !== patched_filename) {
    const loading = LoadingComponent({ text: '正在应用翻译补丁...' })
    document.querySelector('#root')?.before(loading)

    const u = new URL(location.origin)
    u.pathname = index_script_file
    const code = await fetch(u.href).then((res) => res.text())
    patched_code = await injector(code, inject_function_name)

    kv_set('patched-filename', patched_filename, store)
    await kv_set('patched-content', patched_code, store)

    loading.querySelector('fluent-progress')?.remove()
    loading.querySelector<HTMLElement>('p#text')!.innerText = '翻译补丁已应用 🎉'
    setTimeout(() => loading.remove(), 2000)
  }

  const translater = new Translater(localization)
  globalThis[inject_function_name] = translater.translate.bind(translater)
  globalThis[inject_function_name]['restore'] = () =>
    kv_del(['patched-content', 'patched-filename'], store)

  load_patched_code(patched_code)
}

async function load_patched_code(patched_code?: string) {
  if (!patched_code) patched_code = await kv_get('patched-content', store)!
  const e = document.createElement('script')
  e.setAttribute('type', 'module')
  e.innerHTML = patched_code!
  document.body.appendChild(e)
}

main()
