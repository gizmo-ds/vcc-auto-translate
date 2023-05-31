import texts from '../data/texts.ts'
import { text_hash } from '../src/utils.ts'

async function main() {
  if (Deno.args.length < 1) return

  const texts_hash: Record<string, string> = {}
  for (const text of texts) texts_hash[await text_hash(text)] = text

  for (const f of Deno.args) {
    const data = await Deno.readTextFile(f)
    const localization: Record<string, string> = JSON.parse(data)
    const cm = Object.keys(localization).filter((v) => !!texts_hash[v]).length
    const p = ((cm / texts.length) * 100).toFixed(2)
    console.log(`${f}\n${texts.length}/${cm}: ${p}%\n`)
  }
}

await main()
