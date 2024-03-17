import { injector } from './injector'
import { get as kv_get, set as kv_set, createStore } from 'idb-keyval'
import { Translater } from './translate'
import zhHans from '../localization/zh-hans.json'
import zhHant from '../localization/zh-hant.json'

import { fluentProgress, provideFluentDesignSystem } from '@fluentui/web-components'

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

    update_loading(loading, '翻译补丁已应用 🎉')

    kv_set('patched-filename', patched_filename, store)
    await kv_set('patched-content', patched_code, store)

    setTimeout(() => loading.remove(), 2000)
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
  provideFluentDesignSystem().register(fluentProgress())

  const loading = document.createElement('div')

  loading.className = 'patch-loading-cover'

  const loadingText = document.createElement('p')
  loadingText.className = 'patch-loading-text'
  loadingText.innerText = text

  const loadingProgress = document.createElement('fluent-progress')
  loadingProgress.className = 'patch-loading-progress'
  loadingProgress.setAttribute('indeterminate', '')

  const loadingStyle = document.createElement('style')
  loadingStyle.innerHTML = `
  .patch-loading-cover {
    --patch-loading-cover-dark-background: #1f1f1f;
    --patch-loading-cover-dark-color: #ffffff;

    --patch-loading-cover-light-background: #fafafa;
    --patch-loading-cover-light-color: #242424;
  }

  .patch-loading-cover {
      background: var(--patch-loading-cover-light-background);
      color: var(--patch-loading-cover-light-color) !important;
  }

  @media (prefers-color-scheme: dark) {
    .patch-loading-cover {
      background: var(--patch-loading-cover-dark-background);
      color: var(--patch-loading-cover-dark-color) !important;
    }
  }
  
  .patch-loading-cover.dark {
    background: var(--patch-loading-cover-dark-background) !important;
    color: var(--patch-loading-cover-dark-color) !important;
  }

  .patch-loading-cover.light {
      background: var(--patch-loading-cover-light-background);
      color: var(--patch-loading-cover-light-color) !important;
  }

  .patch-loading-cover {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    height: 100vh;
    width: 100vw;

    z-index: 1000;
  }

  .patch-loading-text {
    font-size: xx-large;
  }

  .patch-loading-progress {
    margin-top: 1rem;
    width: 400px;
  }
  `

  document.head.appendChild(loadingStyle)

  loading.appendChild(loadingText)
  loading.appendChild(loadingProgress)

  switch (localStorage.getItem('app_theme')) {
    case 'Light':
      loading.classList.add('light')
      break
    case 'Dark':
      loading.classList.add('dark')
      break
  }

  return loading
}

function update_loading(loadingElement: HTMLElement, text: string) {
  const loadingText = document.createElement('p')
  loadingText.className = 'patch-loading-text'
  loadingText.innerText = text

  loadingElement.innerHTML = ''
  loadingElement.appendChild(loadingText)
}
