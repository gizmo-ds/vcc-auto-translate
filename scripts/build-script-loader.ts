import { config as dotenv_config } from 'dotenv'
import { build } from 'esbuild'
import cssModulesPlugin from 'esbuild-css-modules-plugin'

const env_config = dotenv_config({ path: ['.env.local', '.env'] })

build({
  entryPoints: ['src/script-loader.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2017',
  minify: true,
  outfile: 'build/script-loader.js',
  metafile: true,
  jsx: 'automatic',
  define: env_config.parsed
    ? Object.keys(env_config.parsed).reduce((acc, key) => {
        acc[`process.env.${key}`] = JSON.stringify(env_config.parsed![key])
        return acc
      }, {})
    : {},
  plugins: [
    cssModulesPlugin({
      emitDeclarationFile: true,
      inject: true,
    }),
  ],
}).catch(() => process.exit(1))
