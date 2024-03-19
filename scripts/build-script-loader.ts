import { config as dotenv_config } from 'dotenv'
import { build } from 'esbuild'
import cssModulesPlugin from 'esbuild-css-modules-plugin'

dotenv_config({ path: ['.env.local', '.env'] })

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
  define: {
    'process.env.DEBUG_MODE': JSON.stringify(process.env.DEBUG_MODE),
  },
  plugins: [
    cssModulesPlugin({
      emitDeclarationFile: true,
      inject: true,
    }),
  ],
}).catch(() => process.exit(1))
