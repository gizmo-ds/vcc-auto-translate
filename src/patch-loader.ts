import { get as kv_get, set as kv_set } from 'idb-keyval'
import { InjectFunction } from '@/types/injector'
import { LoadingComponent } from './components/loading'
import { injector, function_proxy } from './injector'
import algolia_patch from './patch/algolia'
import translate_patch from './patch/translate'
import console_log_patch from './patch/console_log'
import { store, DebugMode } from './helpers'

const patchs = [algolia_patch, translate_patch, console_log_patch]

async function main() {
  const index_script_file =
    document.getElementsByTagName('meta')['index-module']?.content ??
    document.querySelector('script[type="module"][src^="/assets/index-"]')?.getAttribute('src')
  const patched_filename = index_script_file.replace(/\.js$/, '.patched.js')
  const local_patched_filename = await kv_get('patched-filename', store)
  let patched_code: string | undefined
  const patch_version = process.env.PATCH_VERSION
  const local_patch_version = await kv_get('patch-version', store)

  globalThis['__vcc_function_proxy__'] = function_proxy

  if (
    DebugMode ||
    !local_patched_filename ||
    local_patched_filename !== patched_filename ||
    !local_patch_version ||
    local_patch_version !== patch_version
  ) {
    for (const p of patchs) {
      for (const key of Object.keys(p)) p[key].before && (await p[key].before())
      p.before && (await p.before())
    }

    const loading = LoadingComponent({ text: '正在应用翻译补丁...' })
    document.querySelector('#root')?.before(loading.component)

    const u = new URL(location.origin)
    u.pathname = index_script_file
    const code = await fetch(u.href).then((res) => res.text())

    const inject_functions: InjectFunction[] = []
    patchs.forEach((p) => {
      if (p.patch_jsx) inject_functions.push({ name: p.patch_jsx.fname, type: 'jsx' })
      if (p.patch_createElement)
        inject_functions.push({ name: p.patch_createElement.fname, type: 'createElement' })
    })
    patched_code = await injector(code, inject_functions)

    await kv_set('patch-version', patch_version, store)
    kv_set('patched-filename', patched_filename, store)
    await kv_set('patched-content', patched_code, store)

    loading.hide_progress()
    loading.set_text('翻译补丁已应用 🎉')
    setTimeout(() => loading.component.remove(), 2000)
  }

  for (const p of patchs) {
    for (const key of Object.keys(p)) p[key].after && (await p[key].after())
    p.after && (await p.after())
  }

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
