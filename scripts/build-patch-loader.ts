import { config as dotenv_config } from 'dotenv'
import { build as esbuild } from 'esbuild'
import cssModulesPlugin from 'esbuild-css-modules-plugin'
import { localization_hashs } from './localization_hashs'

const env_config = dotenv_config({ path: ['.env.local', '.env'] })

async function build() {
  const define = env_config.parsed
    ? Object.keys(env_config.parsed).reduce((acc, key) => {
        acc[`process.env.${key}`] = JSON.stringify(env_config.parsed![key])
        return acc
      }, {})
    : {}
  define['vcc_auto_translate.localization_hashs'] =
    env_config.parsed?.EMBED_LANGUAGES === 'true' ? await localization_hashs() : '{}'

  esbuild({
    entryPoints: ['src/patch-loader.ts'],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2017',
    minify: true,
    outfile: 'build/patch-loader.js',
    metafile: true,
    jsx: 'automatic',
    define,
    plugins: [
      cssModulesPlugin({
        emitDeclarationFile: true,
        inject: true,
      }),
    ],
  }).catch(() => process.exit(1))
}

build()
