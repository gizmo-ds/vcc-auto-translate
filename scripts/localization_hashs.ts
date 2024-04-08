import { readdirSync, readFileSync } from 'node:fs'
import { resolve, join as path_join } from 'node:path'

export async function localization_hashs() {
  const dir = resolve('./localization')
  const files = readdirSync(dir)
  const hashs: Record<string, string> = {}
  for (const filename of files)
    hashs[filename] = await text_hash(
      JSON.stringify(JSON.parse(readFileSync(path_join(dir, filename), 'utf-8')))
    )
  return JSON.stringify(hashs)
}

async function text_hash(content: any) {
  const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(content as string))
  return hex(hash)
}
function hex(hash: ArrayBuffer): string {
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
