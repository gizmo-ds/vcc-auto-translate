import { build } from 'esbuild'
import cssModulesPlugin from 'esbuild-css-modules-plugin'

build({
  entryPoints: ['src/script-loader.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2017',
  minify: true,
  outfile: 'build/script-loader.js',
  metafile: true,
  plugins: [
    cssModulesPlugin({
      emitDeclarationFile: true,
      inject: true,
    }),
  ],
}).catch(() => process.exit(1))
