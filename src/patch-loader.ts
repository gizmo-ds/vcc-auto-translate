import { inject_function, injector } from './injector'
import { get as kv_get, set as kv_set, createStore, UseStore } from 'idb-keyval'
import { LoadingComponent } from './components/loading'

import algolia_patch from './patch/algolia'
import translate_patch from './patch/translate'
import console_log_patch from './patch/console_log'

const patchs = [algolia_patch, translate_patch, console_log_patch]

async function main() {
  const store = createStore('vcc_auto_translate', 'store')

  const index_script_file = document.getElementsByTagName('meta')['index-module'].content
  const patched_filename = index_script_file.replace(/\.js$/, '.patched.js')
  const local_patched_filename = await kv_get('patched-filename', store)
  let patched_code: string | undefined

  if (!local_patched_filename || local_patched_filename !== patched_filename) {
    const loading = LoadingComponent({ text: '正在应用翻译补丁...' })
    document.querySelector('#root')?.before(loading)

    const u = new URL(location.origin)
    u.pathname = index_script_file
    const code = await fetch(u.href).then((res) => res.text())

    const inject_functions: inject_function[] = []
    patchs.forEach((p) => {
      if (p.patch_jsx) inject_functions.push({ name: p.patch_jsx.fname, type: 'jsx' })
      if (p.patch_createElement)
        inject_functions.push({ name: p.patch_createElement.fname, type: 'createElement' })
    })
    patched_code = await injector(code, inject_functions)

    kv_set('patched-filename', patched_filename, store)
    await kv_set('patched-content', patched_code, store)

    loading.querySelector('fluent-progress')?.remove()
    loading.querySelector<HTMLElement>('p#text')!.innerText = '翻译补丁已应用 🎉'
    setTimeout(() => loading.remove(), 2000)
  }

  for (const p of patchs) {
    p.patch_jsx?.after && (await p.patch_jsx.after())
    p.patch_createElement?.after && (await p.patch_createElement.after())
    p.after && (await p.after())
  }

  load_patched_code(store, patched_code)
}

async function load_patched_code(store: UseStore, patched_code?: string) {
  if (!patched_code) patched_code = await kv_get('patched-content', store)!
  const e = document.createElement('script')
  e.setAttribute('type', 'module')
  e.innerHTML = patched_code!
  document.body.appendChild(e)
}

main()
