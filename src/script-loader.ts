import { injector } from './injector'
import { get as kv_get, set as kv_set, createStore, delMany as kv_del } from 'idb-keyval'
import { Translater } from './translate'
import { fluentProgress, provideFluentDesignSystem } from '@fluentui/web-components'

import style from './styles/script-loader.module.css'

import zhHans from '../localization/zh-hans.json'
import zhHant from '../localization/zh-hant.json'

const inject_function_name = '__vcc_auto_translate__'
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
    patched_code = await injector(code, inject_function_name)

    update_loading(loading, '翻译补丁已应用 🎉')

    kv_set('patched-filename', patched_filename, store)
    await kv_set('patched-content', patched_code, store)

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

function create_loading(text = '正在应用翻译补丁...') {
  provideFluentDesignSystem().register(fluentProgress())

  const loading = document.createElement('div')
  loading.className = style.patchLoadingCover

  const loadingText = document.createElement('p')
  loadingText.className = style.patchLoadingText
  loadingText.innerText = text

  const loadingProgress = document.createElement('fluent-progress')
  loadingProgress.className = style.patchLoadingProgress
  loadingProgress.setAttribute('indeterminate', '')

  loading.appendChild(loadingText)
  loading.appendChild(loadingProgress)

  switch (localStorage.getItem('app_theme')) {
    case 'Light':
      loading.classList.add(style.light)
      break
    case 'Dark':
      loading.classList.add(style.dark)
      break
  }

  return loading
}

function update_loading(loadingElement: HTMLElement, text: string) {
  const loadingText = document.createElement('p')
  loadingText.className = style.patchLoadingText
  loadingText.innerText = text

  loadingElement.innerHTML = ''
  loadingElement.appendChild(loadingText)
}
