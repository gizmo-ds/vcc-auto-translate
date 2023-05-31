import texts from '../data/texts.ts'
import { text_hash } from '../src/utils.ts'

async function main() {
  if (Deno.args.length < 1) return

  const texts_hash: Record<string, string> = {}
  for (const text of texts) texts_hash[await text_hash(text)] = text

  for (const f of Deno.args) {
    const data = await Deno.readTextFile(f)
    const localization: Record<string, string> = JSON.parse(data)
    const localization_keys = Object.keys(localization)
    const missing = Object.keys(texts_hash).filter(
      (v) => !localization_keys.includes(v)
    )
    for (let i = 0; i < missing.length; i++)
      localization[missing[i]] = texts_hash[missing[i]]
    await Deno.writeTextFile(f, JSON.stringify(localization, null, 2))
  }
}

await main()
